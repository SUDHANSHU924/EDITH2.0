import { 
    useEffect, useRef, useState, useCallback 
} from 'react'

const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080'

const CONFIG = {
    VOICE_THRESHOLD: 0.012,
    SILENCE_MS: 2000,
    MIN_SPEECH_MS: 700,
    MAX_RECORD_MS: 30000,
    FFT_SIZE: 1024,
}

type Status = 
    'idle'|'listening'|'recording'|
    'processing'|'speaking'|'error'

function speakFallback(text: string, onEnd: () => void) {
    if (!text?.trim() || !window.speechSynthesis) {
        onEnd()
        return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 0.95
    utterance.volume = 1
    utterance.onend = onEnd
    utterance.onerror = onEnd
    window.speechSynthesis.speak(utterance)
}

export function useAlwaysOn(
    onResult: (
        transcript: string,
        reply: string,
        system: string,
        language: string
    ) => void,
    enabled: boolean
) {
    const [status, setStatus] = useState<Status>('idle')
    const [volume, setVolume] = useState(0)
    const [error, setError] = useState('')
    const [lastTranscript, setLastTranscript] = useState('')
    const [detectedLanguage, setDetectedLanguage] = useState('en')

    const streamRef = useRef<MediaStream|null>(null)
    const audioCtxRef = useRef<AudioContext|null>(null)
    const analyserRef = useRef<AnalyserNode|null>(null)
    const recorderRef = useRef<MediaRecorder|null>(null)
    const chunksRef = useRef<Blob[]>([])
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout>|null>(null)
    const maxTimerRef = useRef<ReturnType<typeof setTimeout>|null>(null)
    const rafRef = useRef<number|null>(null)
    const isRecordingRef = useRef(false)
    const isSpeakingRef = useRef(false)
    const enabledRef = useRef(enabled)
    const audioRef = useRef<HTMLAudioElement|null>(null)
    const recordStartRef = useRef(0)

    useEffect(() => {
        enabledRef.current = enabled
    }, [enabled])

    const stopAllAudio = useCallback(() => {
        audioRef.current?.pause()
        isSpeakingRef.current = false
    }, [])

    const playResponse = useCallback(
        (base64Audio: string, fallbackText = ''): Promise<void> => {
        return new Promise(resolve => {
            isSpeakingRef.current = true
            setStatus('speaking')
            
            try {
                const bytes = atob(base64Audio)
                const arr = new Uint8Array(bytes.length)
                for (let i = 0; i < bytes.length; i++) {
                    arr[i] = bytes.charCodeAt(i)
                }
                const blob = new Blob([arr], {
                    type: 'audio/mpeg'
                })
                const url = URL.createObjectURL(blob)
                const audio = new Audio(url)
                audioRef.current = audio

                const fallback = () => {
                    URL.revokeObjectURL(url)
                    isSpeakingRef.current = false
                    if (fallbackText.trim() && window.speechSynthesis) {
                        window.speechSynthesis.cancel()
                        const utterance = new SpeechSynthesisUtterance(fallbackText)
                        utterance.rate = 0.9
                        utterance.pitch = 0.95
                        utterance.volume = 1
                        utterance.onend = () => {
                            if (enabledRef.current) {
                                setStatus('listening')
                            }
                            resolve()
                        }
                        utterance.onerror = () => {
                            if (enabledRef.current) {
                                setStatus('listening')
                            }
                            resolve()
                        }
                        window.speechSynthesis.speak(utterance)
                        return
                    }
                    if (enabledRef.current) {
                        setStatus('listening')
                    }
                    resolve()
                }

                audio.onended = () => {
                    isSpeakingRef.current = false
                    URL.revokeObjectURL(url)
                    if (enabledRef.current) {
                        setStatus('listening')
                    }
                    resolve()
                }
                audio.onerror = fallback
                audio.play().catch(fallback)
            } catch {
                isSpeakingRef.current = false
                if (fallbackText.trim() && window.speechSynthesis) {
                    speakFallback(fallbackText, () => {
                        if (enabledRef.current) {
                            setStatus('listening')
                        }
                        resolve()
                    })
                    return
                }
                setStatus('listening')
                resolve()
            }
        })
    }, [])

    const processAudio = useCallback(
        async (blob: Blob) => {
        if (blob.size < 1000) {
            setStatus('listening')
            return
        }

        setStatus('processing')
        const form = new FormData()
        form.append('audio', blob, 'speech.webm')

        try {
            const res = await fetch(
                `${API}/api/orchestrator/voice`,
                {
                    method: 'POST',
                    body: form,
                    signal: AbortSignal.timeout(30000)
                }
            )
            
            if (!res.ok) throw new Error('API error')
            
            const data = await res.json()
            
            // Filter empty/noise
            const transcript = (
                data.transcript || ''
            ).trim()
            
            if (!transcript || transcript.length < 2) {
                setStatus('listening')
                return
            }

            // Filter EDITH's own voice echoes and false positives
            const lower = transcript.toLowerCase()
            const noise = [
                'you', 'okay', 'yes', 'no',
                'hmm', 'uh', 'um', 'ah',
                '[music]', '[noise]', '[blank]',
                'haan', 'nahi', 'ok', 'done'
            ]
            if (
                noise.includes(lower) ||
                transcript.length < 3
            ) {
                setStatus('listening')
                return
            }

            setLastTranscript(transcript)
            
            // Detect language from response
            const lang = data.language || 'english'
            setDetectedLanguage(lang)
            
            onResult(
                transcript,
                data.reply || '',
                data.system || 'core',
                lang
            )

            if (data.audio_base64) {
                await playResponse(data.audio_base64, data.reply || transcript)
            } else {
                speakFallback(data.reply || transcript, () => {
                    if (enabledRef.current) {
                        setStatus('listening')
                    }
                })
            }

        } catch (e: any) {
            console.error('Process error:', e)
            if (enabledRef.current) {
                setStatus('listening')
            }
        }
    }, [onResult, playResponse])

    const stopRecording = useCallback(() => {
        if (!isRecordingRef.current) return
        isRecordingRef.current = false
        
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
        }
        if (maxTimerRef.current) {
            clearTimeout(maxTimerRef.current)
        }
        
        if (recorderRef.current?.state === 'recording') {
            recorderRef.current.stop()
        }
    }, [])

    const startRecording = useCallback(() => {
        if (
            isRecordingRef.current ||
            isSpeakingRef.current ||
            !streamRef.current
        ) return

        isRecordingRef.current = true
        recordStartRef.current = Date.now()
        chunksRef.current = []
        setStatus('recording')

        try {
            const mimeType = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/ogg;codecs=opus',
                'audio/mp4',
                ''
            ].find(m => !m || MediaRecorder.isTypeSupported(m))

            const recorder = mimeType
                ? new MediaRecorder(streamRef.current!, {
                    mimeType
                  })
                : new MediaRecorder(streamRef.current!)

            recorderRef.current = recorder

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            recorder.onstop = () => {
                const duration = Date.now() -
                    recordStartRef.current
                
                if (
                    duration >= CONFIG.MIN_SPEECH_MS &&
                    chunksRef.current.length > 0
                ) {
                    const blob = new Blob(
                        chunksRef.current,
                        { type: recorder.mimeType || 'audio/webm' }
                    )
                    processAudio(blob)
                } else {
                    if (
                        !isSpeakingRef.current &&
                        enabledRef.current
                    ) {
                        setStatus('listening')
                    }
                }
                chunksRef.current = []
            }

            recorder.start(100)

            // Max recording time
            maxTimerRef.current = setTimeout(() => {
                if (isRecordingRef.current) {
                    stopRecording()
                }
            }, CONFIG.MAX_RECORD_MS)

        } catch (e) {
            console.error('Recorder error:', e)
            isRecordingRef.current = false
            setStatus('listening')
        }
    }, [processAudio, stopRecording])

    // Volume monitor
    const monitorLoop = useCallback(() => {
        if (
            !analyserRef.current ||
            !enabledRef.current
        ) return

        const data = new Uint8Array(
            analyserRef.current.frequencyBinCount
        )
        analyserRef.current.getByteFrequencyData(data)

        let sum = 0
        // Focus on speech frequencies (85-3000 Hz)
        const speechStart = Math.floor(
            85 / (24000 / data.length)
        )
        const speechEnd = Math.floor(
            3000 / (24000 / data.length)
        )
        const speechData = data.slice(
            speechStart, speechEnd
        )
        
        for (let i = 0; i < speechData.length; i++) {
            sum += speechData[i]
        }
        const avg = sum / speechData.length / 255
        setVolume(avg)

        if (
            avg > CONFIG.VOICE_THRESHOLD &&
            !isSpeakingRef.current &&
            enabledRef.current
        ) {
            if (!isRecordingRef.current) {
                startRecording()
            }
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current)
            }
            silenceTimerRef.current = setTimeout(() => {
                if (isRecordingRef.current) {
                    stopRecording()
                }
            }, CONFIG.SILENCE_MS)
        }

        rafRef.current = requestAnimationFrame(
            monitorLoop
        )
    }, [startRecording, stopRecording])

    const startListening = useCallback(async () => {
        setError('')
        try {
            const stream = await navigator.mediaDevices
                .getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        channelCount: 1,
                        sampleRate: 16000
                    }
                })

            streamRef.current = stream

            const ctx = new AudioContext({
                sampleRate: 16000
            })
            audioCtxRef.current = ctx

            const source = ctx.createMediaStreamSource(stream)
            const analyser = ctx.createAnalyser()
            analyser.fftSize = CONFIG.FFT_SIZE
            analyser.smoothingTimeConstant = 0.4
            source.connect(analyser)
            analyserRef.current = analyser

            setStatus('listening')
            rafRef.current = requestAnimationFrame(
                monitorLoop
            )
        } catch (e: any) {
            const msg = e?.message || 'Mic access denied'
            setError(msg)
            setStatus('error')
        }
    }, [monitorLoop])

    const stopListening = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
        }
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
        }
        if (maxTimerRef.current) {
            clearTimeout(maxTimerRef.current)
        }
        
        stopRecording()
        stopAllAudio()
        
        streamRef.current?.getTracks()
            .forEach(t => t.stop())
        audioCtxRef.current?.close()

        streamRef.current = null
        audioCtxRef.current = null
        analyserRef.current = null
        isRecordingRef.current = false
        isSpeakingRef.current = false
        
        setStatus('idle')
        setVolume(0)
    }, [stopRecording, stopAllAudio])

    useEffect(() => {
        if (enabled) {
            startListening()
        } else {
            stopListening()
        }
        return stopListening
    }, [enabled, startListening, stopListening])

    return {
        status,
        volume,
        error,
        lastTranscript,
        detectedLanguage,
        stopAllAudio
    }
}