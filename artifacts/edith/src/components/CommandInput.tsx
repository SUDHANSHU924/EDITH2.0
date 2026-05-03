import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Sparkles, Send, ChevronUp, ChevronDown, Paperclip, Camera, X, Volume2, VolumeX, Loader } from 'lucide-react';
import { DEPARTMENT_COMMANDS, type DepartmentId } from '@/departments';
import type { Attachment } from '@/types/message.types';
import { useVoice } from '@/hooks/useVoice';

interface CommandInputProps {
  onSendMessage: (message: string, attachments?: Attachment[], voiceResponse?: boolean) => void;
  onDepartmentChange: (dept: DepartmentId) => void;
  securityMode: boolean;
  activeDepartment: DepartmentId;
  departmentColor: string;
}

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

function cleanVoiceText(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/\b(um+|uh+|erm+|ah+|hmm+|like|you know)\b/gi, "")
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/([,.!?;:])([A-Za-z0-9])/g, "$1 $2")
    .replace(/\b(really|actually|basically|literally)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

export function CommandInput({ onSendMessage, onDepartmentChange, securityMode, activeDepartment, departmentColor }: CommandInputProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showEnhanceMenu, setShowEnhanceMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const attachmentsRef = useRef<Attachment[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { isRecording, isTranscribing, startRecording, stopRecording, transcript, clearTranscript, error: voiceError } = useVoice();

  const color = departmentColor;
  const commands = DEPARTMENT_COMMANDS[activeDepartment] || [];

  const resolveVoiceDepartment = (text: string): DepartmentId | null => {
    const normalized = text.toLowerCase();
    const match = normalized.match(/(switch to|activate|open|go to|use|set department|department)\s+(core|planning|agent hub|code|code forge|files|file vault|search|learning|ml|data lab|iot|vision|voice|personal|security|daily|hacker|security grid|satellite)/);
    if (!match) return null;
    const raw = match[2];
    const map: Record<string, DepartmentId> = {
      core: 'core', planning: 'planning', 'agent hub': 'planning', code: 'code', 'code forge': 'code',
      files: 'files', 'file vault': 'files', search: 'search', learning: 'learning', ml: 'ml',
      'data lab': 'ml', iot: 'iot', vision: 'vision', voice: 'voice', personal: 'personal',
      security: 'security', daily: 'daily', hacker: 'security_grid', 'security grid': 'security_grid', satellite: 'satellite',
    };
    return map[raw] || null;
  };

  const stripVoiceDepartmentPrefix = (text: string): string => {
    return text.replace(/(switch to|activate|open|go to|use|set department|department)\s+(core|planning|agent hub|code|code forge|files|file vault|search|learning|ml|data lab|iot|vision|voice|personal|security|daily|hacker|security grid|satellite)/i, '').trim();
  };

  useEffect(() => { setShowSuggestions(true); setInput(''); setShowEnhanceMenu(false); }, [activeDepartment]);
  useEffect(() => { attachmentsRef.current = attachments; }, [attachments]);

  useEffect(() => () => { attachmentsRef.current.forEach((a) => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); }); }, []);

  const stopCameraStream = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
  };

  useEffect(() => {
    if (!showCamera) { stopCameraStream(); return; }
    if (!navigator?.mediaDevices?.getUserMedia) { setCameraError('camera unsupported'); return; }
    let cancelled = false;
    setCameraError(null);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => undefined); }
      })
      .catch((e) => setCameraError(e?.message || 'camera blocked'));
    return () => { cancelled = true; stopCameraStream(); };
  }, [showCamera]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 140) + 'px';
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() || attachments.length) {
      onSendMessage(input.trim(), attachments.length ? attachments : undefined, autoSpeak);
      setInput('');
      attachments.forEach((a) => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
      setAttachments([]);
      setShowEnhanceMenu(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const addFiles = (files: File[], source: 'camera' | 'file') => {
    const next: Attachment[] = [];
    files.forEach((file) => {
      if (file.size > MAX_ATTACHMENT_BYTES) { setAttachmentError('file too large'); return; }
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      next.push({ id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: file.name, type: file.type, size: file.size, previewUrl, source, file });
    });
    if (next.length) { setAttachments((prev) => [...prev, ...next]); setAttachmentError(null); }
  };

  const handleAttachments = (fileList: FileList | null, source: 'camera' | 'file') => {
    if (!fileList) return;
    addFiles(Array.from(fileList), source);
  };

  const openCamera = () => {
    if (!navigator?.mediaDevices?.getUserMedia) { setCameraError('camera unsupported'); cameraInputRef.current?.click(); return; }
    setShowCamera(true);
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    if (!blob) return;
    addFiles([new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' })], 'camera');
    setShowCamera(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  };

  const enhanceOptions = [
    { label: 'Add more detail', prefix: 'Provide a comprehensive, detailed explanation of:' },
    { label: 'Step-by-step', prefix: 'Break down into clear numbered steps:' },
    { label: 'Code example', prefix: 'Write working code with explanation for:' },
    { label: 'Professional tone', prefix: 'Rewrite in professional, executive-level language:' },
    { label: 'Summarize', prefix: 'Summarize concisely:' },
  ];

  return (
    <div className="w-full pb-5 pt-3" style={{ background: 'linear-gradient(to top, rgba(5,5,5,0.98) 60%, transparent)' }}>
      {/* Suggestions */}
      <AnimatePresence>
        {showSuggestions && !input && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.2 }} className="flex items-center gap-2 mb-3 flex-wrap px-1">
            <button className="flex items-center gap-1 text-white/20 hover:text-white/40 transition-colors" onClick={() => setShowSuggestions(false)}>
              <ChevronDown size={12} />
            </button>
            {commands.map((cmd) => (
              <motion.button key={cmd} className="px-2.5 py-1 rounded-lg text-xs transition-all"
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', background: `${color}0c`, border: `1px solid ${color}20`, color: color + 'aa' }}
                whileHover={{ scale: 1.03, background: `${color}18`, borderColor: `${color}40` }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setInput(cmd); inputRef.current?.focus(); }}
              >
                {cmd}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!showSuggestions && (
        <motion.button className="flex items-center gap-1.5 mb-2 text-white/20 hover:text-white/40 transition-colors text-xs px-1"
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}
          onClick={() => setShowSuggestions(true)}
        >
          <ChevronUp size={12} /> SHOW SUGGESTIONS
        </motion.button>
      )}

      <motion.div className="relative" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }}>
        <motion.div
          className="relative backdrop-blur-xl rounded-2xl overflow-hidden"
          style={{ background: 'rgba(10,16,30,0.92)', border: `1px solid ${isFocused ? color : 'rgba(255,255,255,0.08)'}`, boxShadow: isFocused ? `0 0 24px ${color}25, 0 8px 32px rgba(0,0,0,0.6)` : '0 4px 24px rgba(0,0,0,0.5)' }}
          animate={{ borderColor: isFocused ? color : 'rgba(255,255,255,0.08)' }}
          transition={{ duration: 0.2 }}
        >
          <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: isFocused ? 0.04 : 0 }} style={{ background: `radial-gradient(ellipse at 50% 100%, ${color}, transparent 60%)` }} />

          {(isRecording || isTranscribing || transcript) && (
            <div className="px-3 pt-2 pb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: isRecording ? '#FF2A4B' : color, letterSpacing: '0.12em' }}>VOICE PREVIEW</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                  {isTranscribing ? 'Transcribing...' : isRecording ? 'Listening...' : transcript || ''}
                </span>
              </div>
              {transcript && !isRecording && !isTranscribing && (
                <button onClick={clearTranscript} className="text-[10px] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.35)' }}>Clear</button>
              )}
            </div>
          )}

          <div className="flex items-end gap-3 p-3">
            <div className="flex items-end gap-2">
              {/* Mic */}
              <motion.button
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center relative"
                style={{ background: isRecording ? 'rgba(255,42,75,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isRecording ? '#FF2A4B' : 'rgba(255,255,255,0.08)'}` }}
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                onMouseDown={startRecording}
                onMouseUp={async () => {
                  const text = await stopRecording();
                  const trimmed = cleanVoiceText(text);
                  if (trimmed) {
                    const nextDept = resolveVoiceDepartment(trimmed);
                    if (nextDept && nextDept !== activeDepartment) onDepartmentChange(nextDept);
                    const payload = nextDept ? stripVoiceDepartmentPrefix(trimmed) : trimmed;
                    if (payload) onSendMessage(payload, undefined, true);
                    clearTranscript();
                  }
                  if (!trimmed) clearTranscript();
                }}
                onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                onTouchEnd={async (e) => {
                  e.preventDefault();
                  const text = await stopRecording();
                  const trimmed = cleanVoiceText(text);
                  if (trimmed) {
                    const nextDept = resolveVoiceDepartment(trimmed);
                    if (nextDept && nextDept !== activeDepartment) onDepartmentChange(nextDept);
                    const payload = nextDept ? stripVoiceDepartmentPrefix(trimmed) : trimmed;
                    if (payload) onSendMessage(payload, undefined, true);
                    clearTranscript();
                  }
                  if (!trimmed) clearTranscript();
                }}
                title={voiceError || (isRecording ? 'Release to send' : 'Hold to speak')}
              >
                {isTranscribing ? <Loader size={16} style={{ color }} /> : <Mic size={16} style={{ color: isRecording ? '#FF2A4B' : 'rgba(255,255,255,0.5)' }} />}
                <AnimatePresence>
                  {isRecording && (
                    <motion.div className="absolute inset-0 rounded-xl flex items-center justify-center gap-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div key={i} className="w-0.5 rounded-full" style={{ background: '#FF2A4B' }} animate={{ height: ['3px', '14px', '3px'] }} transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.1 }} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Camera */}
              <motion.button className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={openCamera}>
                <Camera size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
              </motion.button>

              {/* Attach */}
              <motion.button className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={() => fileInputRef.current?.click()}>
                <Paperclip size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
              </motion.button>

              {/* Auto-speak */}
              <motion.button className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: autoSpeak ? `${color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${autoSpeak ? color + '50' : 'rgba(255,255,255,0.08)'}` }} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={() => setAutoSpeak((p) => !p)}>
                {autoSpeak ? <Volume2 size={16} style={{ color }} /> : <VolumeX size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />}
              </motion.button>
            </div>

            {/* Text area */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder={`Issue directive to ${activeDepartment.toUpperCase()} module...`}
                className="w-full bg-transparent outline-none min-h-[44px] max-h-[140px] py-2.5"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '1.6', color: '#FFFFFF', caretColor: '#00F0FF', background: 'transparent', outline: 'none', resize: 'none' }}
                rows={1}
              />
            </div>

            {/* Enhance */}
            <motion.button className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: showEnhanceMenu ? `${color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${showEnhanceMenu ? color + '40' : 'rgba(255,255,255,0.08)'}` }} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={() => setShowEnhanceMenu(!showEnhanceMenu)}>
              <Sparkles size={16} style={{ color: showEnhanceMenu ? color : 'rgba(255,255,255,0.4)' }} />
            </motion.button>

            {/* Send */}
            <motion.button
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: input.trim() || attachments.length ? `linear-gradient(135deg, ${color}cc, ${color}80)` : 'rgba(255,255,255,0.04)', border: `1px solid ${input.trim() || attachments.length ? color + '60' : 'rgba(255,255,255,0.08)'}`, boxShadow: input.trim() || attachments.length ? `0 0 14px ${color}30` : 'none' }}
              whileHover={{ scale: input.trim() || attachments.length ? 1.06 : 1 }}
              whileTap={{ scale: input.trim() || attachments.length ? 0.94 : 1 }}
              onClick={handleSubmit}
              disabled={!input.trim() && !attachments.length}
            >
              <Send size={16} className="text-white" />
            </motion.button>
          </div>

          {/* Attachment tray */}
          {attachments.length > 0 && (
            <div className="px-3 pb-2">
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-2 rounded-lg px-2 py-1" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}22` }}>
                    {attachment.previewUrl ? (
                      <img src={attachment.previewUrl} alt={attachment.name} className="w-8 h-8 rounded-md object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>{attachment.type.startsWith('image/') ? 'IMG' : 'FILE'}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="truncate" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(255,255,255,0.7)', maxWidth: '160px' }}>{attachment.name}</div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{formatBytes(attachment.size)}</div>
                    </div>
                    <motion.button className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => removeAttachment(attachment.id)}>
                      <X size={12} style={{ color: 'rgba(255,255,255,0.5)' }} />
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-4 pb-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px' }}>
            <span className="text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', color: color + '60', fontSize: '10px' }}>
              {securityMode ? 'TACTICAL MODE' : `MODULE ${String(Object.keys(DEPARTMENT_COMMANDS).indexOf(activeDepartment) + 1).padStart(2, '0')} · ACTIVE`}
            </span>
            <span className="text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', fontSize: '9px' }}>
              {voiceError ? `VOICE ${voiceError}` : isTranscribing ? 'VOICE TRANSCRIBING' : isRecording ? 'VOICE LISTENING' : 'VOICE READY'}
              {attachments.length ? ` · ${attachments.length} FILE${attachments.length > 1 ? 'S' : ''}` : ''}
              {attachmentError ? ` · ${attachmentError}` : ''}
            </span>
            <span className="text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.15)', fontSize: '10px' }}>↵ send · shift+↵ newline</span>
          </div>
        </motion.div>

        <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.txt,.md,.json,.csv,.log" className="hidden" onChange={(e) => { handleAttachments(e.target.files, 'file'); e.target.value = ''; }} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { handleAttachments(e.target.files, 'camera'); e.target.value = ''; }} />

        {/* Camera modal */}
        <AnimatePresence>
          {showCamera && (
            <motion.div className="fixed inset-0 z-[60] flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ background: 'rgba(5,8,12,0.85)' }}>
              <motion.div className="w-[92vw] max-w-3xl rounded-2xl overflow-hidden" initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 20 }} style={{ border: `1px solid ${color}40`, background: 'rgba(8,12,18,0.96)', boxShadow: `0 18px 48px rgba(0,0,0,0.6)` }}>
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: color + 'cc', letterSpacing: '0.12em' }}>LIVE CAMERA</div>
                  <motion.button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowCamera(false)}>
                    <X size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
                  </motion.button>
                </div>
                <div className="relative bg-black">
                  <video ref={videoRef} className="w-full h-[60vh] object-cover" playsInline muted autoPlay />
                  {cameraError && <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>{cameraError}</div>}
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Tap capture to add the photo to your message.</span>
                  <div className="flex items-center gap-2">
                    <motion.button className="px-3 py-1.5 rounded-lg" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCamera(false)}>CANCEL</motion.button>
                    <motion.button className="px-4 py-1.5 rounded-lg" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#0b0f12', background: `linear-gradient(135deg, ${color}dd, ${color}88)`, border: `1px solid ${color}80` }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={capturePhoto}>CAPTURE</motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhance menu */}
        <AnimatePresence>
          {showEnhanceMenu && (
            <motion.div className="absolute bottom-20 right-0" initial={{ scale: 0.9, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 4 }} transition={{ type: 'spring', stiffness: 320, damping: 25 }}>
              <div className="backdrop-blur-xl rounded-xl p-1.5 min-w-[180px]" style={{ background: 'rgba(8,14,28,0.95)', border: `1px solid ${color}25`, boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 16px ${color}15` }}>
                <div className="px-3 py-1.5 mb-1 border-b border-white/5">
                  <span className="text-white/30 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>ENHANCE DIRECTIVE</span>
                </div>
                {enhanceOptions.map((opt) => (
                  <motion.button
                    key={opt.label}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left"
                    style={{ background: 'transparent' }}
                    whileHover={{ background: `${color}12` }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setInput(opt.prefix + ' ' + input); setShowEnhanceMenu(false); inputRef.current?.focus(); }}
                  >
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>{opt.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
