"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Sparkles, Send, ChevronUp, ChevronDown, Paperclip, Camera, X } from 'lucide-react';
import { DEPARTMENT_COMMANDS, type DepartmentId } from '../departments';
import type { Attachment } from '@/types/message.types';

interface CommandInputProps {
  onSendMessage: (message: string, attachments?: Attachment[]) => void;
  securityMode: boolean;
  activeDepartment: DepartmentId;
  departmentColor: string;
}

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

export function CommandInput({
  onSendMessage,
  securityMode,
  activeDepartment,
  departmentColor,
}: CommandInputProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showEnhanceMenu, setShowEnhanceMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [micError, setMicError] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const attachmentsRef = useRef<Attachment[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const color = departmentColor;
  const commands = DEPARTMENT_COMMANDS[activeDepartment] || [];

  // Reset suggestions visibility on department change
  useEffect(() => {
    setShowSuggestions(true);
    setInput('');
    setShowEnhanceMenu(false);
  }, [activeDepartment]);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setMicError('mic unsupported');
      return;
    }

    const recognition: SpeechRecognitionLike = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }
      if (finalTranscript) {
        setInput((prev) => (prev ? `${prev} ${finalTranscript.trim()}` : finalTranscript.trim()));
      }
    };
    recognition.onerror = (event: any) => {
      setMicError(event?.error || 'mic error');
      setIsListening(false);
    };
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  useEffect(() => () => {
    attachmentsRef.current.forEach((attachment) => {
      if (attachment.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    });
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (!showCamera) {
      stopCameraStream();
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError('camera unsupported');
      return;
    }

    let cancelled = false;
    setCameraError(null);

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => undefined);
        }
      })
      .catch((error) => {
        setCameraError(error?.message || 'camera blocked');
      });

    return () => {
      cancelled = true;
      stopCameraStream();
    };
  }, [showCamera]);

  const handleSubmit = () => {
    if (input.trim() || attachments.length) {
      if (isListening) {
        recognitionRef.current?.stop();
      }
      onSendMessage(input.trim(), attachments.length ? attachments : undefined);
      setInput('');
      attachments.forEach((attachment) => {
        if (attachment.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
      });
      setAttachments([]);
      setShowEnhanceMenu(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 140) + 'px';
    }
  }, [input]);

  const handleQuickCommand = (cmd: string) => {
    setInput(cmd);
    inputRef.current?.focus();
  };

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setMicError('mic unsupported');
      return;
    }
    setMicError(null);
    if (isListening) {
      recognition.stop();
      return;
    }
    try {
      recognition.start();
    } catch {
      setMicError('mic busy');
      setIsListening(false);
    }
  };

  const addFiles = (files: File[], source: 'camera' | 'file') => {
    const next: Attachment[] = [];
    files.forEach((file) => {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        setAttachmentError('file too large');
        return;
      }
      const previewUrl = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined;
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        previewUrl,
        source,
        file,
      });
    });
    if (next.length) {
      setAttachments((prev) => [...prev, ...next]);
      setAttachmentError(null);
    }
  };

  const handleAttachments = (fileList: FileList | null, source: 'camera' | 'file') => {
    if (!fileList) return;
    addFiles(Array.from(fileList), source);
  };

  const openCamera = () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError('camera unsupported');
      cameraInputRef.current?.click();
      return;
    }
    setShowCamera(true);
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.9)
    );
    if (!blob) return;
    const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
    addFiles([file], 'camera');
    setShowCamera(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((attachment) => attachment.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((attachment) => attachment.id !== id);
    });
  };

  return (
    <div
      className="w-full pb-5 pt-3"
      style={{
        background: 'linear-gradient(to top, rgba(5,5,5,0.98) 60%, transparent)',
      }}
    >
      {/* Quick Command Suggestions */}
      <AnimatePresence>
        {showSuggestions && !input && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 mb-3 flex-wrap"
          >
            <button
              className="flex items-center gap-1 text-white/20 hover:text-white/40 transition-colors"
              onClick={() => setShowSuggestions(false)}
            >
              <ChevronDown size={12} />
            </button>
            {commands.map((cmd) => (
              <motion.button
                key={cmd}
                className="px-2.5 py-1 rounded-lg text-xs transition-all"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px',
                  background: `${color}0c`,
                  border: `1px solid ${color}20`,
                  color: color + 'aa',
                }}
                whileHover={{
                  scale: 1.03,
                  background: `${color}18`,
                  borderColor: `${color}40`,
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleQuickCommand(cmd)}
              >
                {cmd}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show suggestions button when hidden */}
      {!showSuggestions && (
        <motion.button
          className="flex items-center gap-1.5 mb-2 text-white/20 hover:text-white/40 transition-colors text-xs"
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}
          onClick={() => setShowSuggestions(true)}
        >
          <ChevronUp size={12} />
          SHOW SUGGESTIONS
        </motion.button>
      )}

      {/* Main Input Container */}
      <motion.div
        className="relative"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        <motion.div
          className="relative backdrop-blur-xl rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(10, 16, 30, 0.92)',
            border: `1px solid ${isFocused ? color : 'rgba(255,255,255,0.08)'}`,
            boxShadow: isFocused
              ? `0 0 24px ${color}25, 0 8px 32px rgba(0,0,0,0.6)`
              : '0 4px 24px rgba(0,0,0,0.5)',
          }}
          animate={{ borderColor: isFocused ? color : 'rgba(255,255,255,0.08)' }}
          transition={{ duration: 0.2 }}
        >
          {/* Glow overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: isFocused ? 0.04 : 0 }}
            style={{
              background: `radial-gradient(ellipse at 50% 100%, ${color}, transparent 60%)`,
            }}
          />

          <div className="flex items-end gap-3 p-3">
            {/* Input Utilities */}
            <div className="flex items-end gap-2">
              <motion.button
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center relative"
                style={{
                  background: isListening
                    ? `${color}25`
                    : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isListening ? color + '50' : 'rgba(255,255,255,0.08)'}`,
                }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={toggleListening}
                title={micError ? micError : 'Voice input'}
              >
                <Mic size={16} style={{ color: isListening ? color : 'rgba(255,255,255,0.5)' }} />
                <AnimatePresence>
                  {isListening && (
                    <motion.div
                      className="absolute inset-0 rounded-xl flex items-center justify-center gap-0.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-0.5 rounded-full"
                          style={{ background: color }}
                          animate={{ height: ['3px', '14px', '3px'] }}
                          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <motion.button
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={openCamera}
                title="Capture image"
              >
                <Camera size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
              </motion.button>

              <motion.button
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => fileInputRef.current?.click()}
                title="Attach files"
              >
                <Paperclip size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
              </motion.button>
            </div>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder={`Issue directive to ${activeDepartment.toUpperCase()} module...`}
                className="w-full bg-transparent resize-none outline-none min-h-[44px] max-h-[140px] py-2.5"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#FFFFFF',
                  caretColor: '#00F0FF',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                }}
                rows={1}
              />
            </div>

            {/* Enhance Button */}
            <motion.button
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: showEnhanceMenu ? `${color}20` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${showEnhanceMenu ? color + '40' : 'rgba(255,255,255,0.08)'}`,
              }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setShowEnhanceMenu(!showEnhanceMenu)}
            >
              <Sparkles size={16} style={{ color: showEnhanceMenu ? color : 'rgba(255,255,255,0.4)' }} />
            </motion.button>

            {/* Send Button */}
            <motion.button
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: input.trim() || attachments.length
                  ? `linear-gradient(135deg, ${color}cc, ${color}80)`
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${input.trim() || attachments.length ? color + '60' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: input.trim() || attachments.length ? `0 0 14px ${color}30` : 'none',
              }}
              whileHover={{ scale: input.trim() || attachments.length ? 1.06 : 1 }}
              whileTap={{ scale: input.trim() || attachments.length ? 0.94 : 1 }}
              onClick={handleSubmit}
              disabled={!input.trim() && !attachments.length}
            >
              <Send size={16} className="text-white" />
            </motion.button>
          </div>

          {/* Attachment Tray */}
          {attachments.length > 0 && (
            <div className="px-3 pb-2">
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${color}22`,
                    }}
                  >
                    {attachment.previewUrl ? (
                      <img
                        src={attachment.previewUrl}
                        alt={attachment.name}
                        className="w-8 h-8 rounded-md object-cover"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      >
                        <span
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '9px',
                            color: 'rgba(255,255,255,0.5)',
                          }}
                        >
                          {attachment.type.startsWith('image/') ? 'IMG' : 'FILE'}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div
                        className="truncate"
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '10px',
                          color: 'rgba(255,255,255,0.7)',
                          maxWidth: '160px',
                        }}
                      >
                        {attachment.name}
                      </div>
                      <div
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '10px',
                          color: 'rgba(255,255,255,0.35)',
                        }}
                      >
                        {formatBytes(attachment.size)}
                      </div>
                    </div>
                    <motion.button
                      className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeAttachment(attachment.id)}
                      title="Remove"
                    >
                      <X size={12} style={{ color: 'rgba(255,255,255,0.5)' }} />
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom info bar */}
          <div
            className="flex items-center justify-between px-4 pb-2.5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px' }}
          >
            <span
              className="text-xs"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: color + '60', fontSize: '10px' }}
            >
              {securityMode ? 'TACTICAL MODE' : `MODULE ${DEPARTMENT_COMMANDS[activeDepartment] ? String(Object.keys(DEPARTMENT_COMMANDS).indexOf(activeDepartment) + 1).padStart(2, '0') : '01'} · ACTIVE`}
            </span>
            <span
              className="text-xs"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', fontSize: '9px' }}
            >
              {micError ? `MIC ${micError}` : isListening ? 'MIC LISTENING' : 'MIC READY'}
              {attachments.length ? ` · ${attachments.length} FILE` : ''}
              {attachments.length > 1 ? 'S' : ''}
              {attachmentError ? ` · ${attachmentError}` : ''}
            </span>
            <span
              className="text-xs"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.15)', fontSize: '10px' }}
            >
              ↵ send · shift+↵ newline
            </span>
          </div>
        </motion.div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.md,.json,.csv,.log"
          className="hidden"
          onChange={(event) => {
            handleAttachments(event.target.files, 'file');
            event.target.value = '';
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            handleAttachments(event.target.files, 'camera');
            event.target.value = '';
          }}
        />

        <AnimatePresence>
          {showCamera && (
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ background: 'rgba(5,8,12,0.85)' }}
            >
              <motion.div
                className="w-[92vw] max-w-3xl rounded-2xl overflow-hidden"
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                style={{
                  border: `1px solid ${color}40`,
                  background: 'rgba(8, 12, 18, 0.96)',
                  boxShadow: `0 18px 48px rgba(0,0,0,0.6)`,
                }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '10px',
                      color: color + 'cc',
                      letterSpacing: '0.12em',
                    }}
                  >
                    LIVE CAMERA
                  </div>
                  <motion.button
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCamera(false)}
                  >
                    <X size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
                  </motion.button>
                </div>
                <div className="relative bg-black">
                  <video
                    ref={videoRef}
                    className="w-full h-[60vh] object-cover"
                    playsInline
                    muted
                    autoPlay
                  />
                  {cameraError && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        background: 'rgba(0,0,0,0.6)',
                        color: 'rgba(255,255,255,0.7)',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                      }}
                    >
                      {cameraError}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    Tap capture to add the photo to your message.
                  </span>
                  <div className="flex items-center gap-2">
                    <motion.button
                      className="px-3 py-1.5 rounded-lg"
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '10px',
                        color: 'rgba(255,255,255,0.55)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(255,255,255,0.04)',
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowCamera(false)}
                    >
                      CANCEL
                    </motion.button>
                    <motion.button
                      className="px-4 py-1.5 rounded-lg"
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '10px',
                        color: '#0b0f12',
                        background: `linear-gradient(135deg, ${color}dd, ${color}88)`,
                        border: `1px solid ${color}80`,
                      }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={capturePhoto}
                    >
                      CAPTURE
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhance Radial Menu */}
        <AnimatePresence>
          {showEnhanceMenu && (
            <motion.div
              className="absolute bottom-20 right-0"
              initial={{ scale: 0.9, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 4 }}
              transition={{ type: 'spring', stiffness: 320, damping: 25 }}
            >
              <div
                className="backdrop-blur-xl rounded-xl p-1.5 min-w-[180px]"
                style={{
                  background: 'rgba(8, 14, 28, 0.95)',
                  border: `1px solid ${color}25`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 16px ${color}15`,
                }}
              >
                <div className="px-3 py-1.5 mb-1 border-b border-white/5">
                  <span className="text-white/30 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' }}>
                    ENHANCE DIRECTIVE
                  </span>
                </div>
                {[
                  { label: 'Refine Prompt', desc: 'Sharpen clarity & precision' },
                  { label: 'Tree of Thought', desc: 'Multi-path reasoning' },
                  { label: 'Chain of Thought', desc: 'Step-by-step breakdown' },
                  { label: 'Execute Task', desc: 'Autonomous agent mode' },
                ].map((action, i) => (
                  <motion.button
                    key={action.label}
                    className="w-full px-3 py-2 text-left rounded-lg"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ background: `${color}12` }}
                    onClick={() => {
                      setInput((prev) => prev ? `[${action.label}] ${prev}` : `[${action.label}] `);
                      setShowEnhanceMenu(false);
                      inputRef.current?.focus();
                    }}
                  >
                    <div className="text-xs text-white" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>
                      {action.label}
                    </div>
                    <div className="text-white/30 mt-0.5" style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px' }}>
                      {action.desc}
                    </div>
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
