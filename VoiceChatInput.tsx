'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { voiceAssistant } from '@/lib/ai/voiceAssistant';

interface VoiceChatInputProps {
    onQuery: (query: string) => void;
    isProcessing: boolean;
    language: string;
}

export function VoiceChatInput({ onQuery, isProcessing, language }: VoiceChatInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingError, setRecordingError] = useState<string | null>(null);

    const handleVoiceRecord = () => {
        if (isRecording) {
            voiceAssistant.stopListening();
            setIsRecording(false);
        } else {
            setRecordingError(null);
            voiceAssistant.startListening({
                language: {
                    'en': 'en-US',
                    'fr': 'fr-FR',
                    'es': 'es-ES',
                    'de': 'de-DE',
                    'ja': 'ja-JP',
                    'ml': 'ml-IN',
                    'hi': 'hi-IN',
                    'zh': 'zh-CN',
                    'ru': 'ru-RU',
                    'ar': 'ar-SA',
                    'pt': 'pt-BR',
                    'it': 'it-IT'
                }[language] || 'en-US',
                onResult: (text) => {
                    setInputValue(text);
                    setTimeout(() => {
                        onQuery(text);
                        setInputValue('');
                    }, 600);
                },
                onError: (err) => setRecordingError(err),
                onEnd: () => setIsRecording(false)
            });
            setIsRecording(true);
        }
    };

    const handleSubmit = () => {
        if (!inputValue.trim() || isProcessing) return;
        onQuery(inputValue);
        setInputValue('');
    };

    return (
        <div className="w-full max-w-3xl mx-auto mt-8 px-6">
            <div className="relative group">
                <div className="relative flex items-center gap-4 bg-white/40 backdrop-blur-md border border-[#D7CCC8]/30 rounded-full p-2 pr-4 shadow-sm hover:shadow-md transition-all">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Ask any question..."
                            className="w-full bg-transparent border-none py-4 px-6 text-[#000000] placeholder-[#8D6E63]/50 focus:outline-none font-serif font-black text-xl"
                        />
                        {isProcessing && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-5 h-5 text-[#B08968] animate-spin" />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleVoiceRecord}
                        className={`p-4 rounded-full transition-all shadow-lg active:scale-90 ${isRecording ? 'bg-red-500 text-white ring-4 ring-red-100' : 'bg-[#B08968] text-white hover:bg-[#4E342E]'}`}
                        title="Voice Assistant"
                    >
                        {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={!inputValue.trim() || isProcessing}
                        className="p-4 bg-[#000000] text-white rounded-full hover:bg-[#8D6E63] disabled:opacity-20 transition-all shadow-md active:scale-95"
                    >
                        <Send size={24} />
                    </button>
                </div>

                {isRecording && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-12 left-0 right-0 flex justify-center items-center gap-1.5"
                    >
                        {[1, 2, 3, 4, 5].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ height: [8, 24, 8], opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.08 }}
                                className="w-1 bg-[#B08968] rounded-full"
                            />
                        ))}
                        <span className="ml-4 text-[#B08968] text-xs font-bold uppercase tracking-[0.2em] font-serif">Listening...</span>
                    </motion.div>
                )}

                {recordingError && (
                    <p className="absolute -bottom-10 left-0 right-0 text-red-500 text-[10px] text-center font-serif">{recordingError}</p>
                )}
            </div>
        </div>
    );
}
