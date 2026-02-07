'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { detectLanguage, translateText, LANGUAGE_MAP } from '@/lib/ai/translation';
import { queryKnowledgeBase } from '@/lib/ai/knowledgeBase';
import { LanguageSelector } from './LanguageSelector';

interface Message {
    id: string;
    role: 'user' | 'bot';
    text: string;
    originalText?: string; // What the user actually typed/saw
    translatedText?: string; // What the system processed
    language?: string;
    metrics?: {
        translationTime: number;
        processingTime: number;
        bandwidthSaved: string;
    };
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [userLanguage, setUserLanguage] = useState('en');
    const [modelLoading, setModelLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isProcessing) return;

        const userText = inputValue;
        setInputValue('');
        setIsProcessing(true);

        const messageId = Date.now().toString();

        // 1. Add User Message (Optimistic)
        const userMsg: Message = {
            id: messageId,
            role: 'user',
            text: userText,
            language: userLanguage,
        };
        setMessages((prev) => [...prev, userMsg]);

        const startTime = performance.now();

        try {
            // 2. Translation (Inbound) -> English
            // NOTE: In a real app, detection runs here. We use the selector for explicit control in this demo.
            const targetLang = 'eng_Latn';
            const sourceLang = LANGUAGE_MAP[userLanguage] || 'eng_Latn';

            let englishQuery = userText;
            if (userLanguage !== 'en') {
                setModelLoading(true);
                englishQuery = await translateText(userText, sourceLang, targetLang);
                setModelLoading(false);
            }

            const translationTime = performance.now() - startTime;

            // 3. Knowledge Base Lookup
            const kbStartTime = performance.now();
            const englishAnswer = await queryKnowledgeBase(englishQuery);
            const processingTime = performance.now() - kbStartTime;

            // 4. Translation (Outbound) -> User Language
            let finalAnswer = englishAnswer;
            if (userLanguage !== 'en') {
                setModelLoading(true);
                finalAnswer = await translateText(englishAnswer, targetLang, sourceLang);
                setModelLoading(false);
            }

            // 5. Add Bot Response
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                text: finalAnswer,
                originalText: englishAnswer, // The internal English logic
                metrics: {
                    translationTime: Math.round(translationTime),
                    processingTime: Math.round(processingTime),
                    bandwidthSaved: '85%' // Simulated metric for cached/local model
                }
            };
            setMessages((prev) => [...prev, botMsg]);

        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                text: "I'm having trouble connecting to my language circuits. Please try again.",
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsProcessing(false);
            setModelLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-4xl bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg backdrop-blur">
                        <Bot className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-white font-semibold text-lg">Global Support AI</h2>
                        <p className="text-xs text-blue-300">Powered by On-Device Transformers</p>
                    </div>
                </div>
                <LanguageSelector currentLanguage={userLanguage} onLanguageChange={setUserLanguage} />
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                        <Sparkles className="w-12 h-12 text-blue-400 animate-pulse" />
                        <p className="text-white/60 text-sm">Select a language and ask a question.<br />"Where is my order?" in French, perhaps?</p>
                    </div>
                )}

                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={cn(
                                "flex w-full",
                                msg.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            <div className={cn(
                                "flex max-w-[80%] rounded-2xl p-4 shadow-lg backdrop-blur-sm",
                                msg.role === 'user'
                                    ? "bg-blue-600/80 text-white rounded-br-none"
                                    : "bg-white/10 text-white border border-white/5 rounded-bl-none"
                            )}>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>

                                    {msg.metrics && (
                                        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-white/10 text-[10px] text-white/50 font-mono">
                                            <span className="flex items-center">
                                                <Sparkles className="w-3 h-3 mr-1" />
                                                Lat: {msg.metrics.processingTime}ms
                                            </span>
                                            <span>Trans: {msg.metrics.translationTime}ms</span>
                                            {msg.originalText && (
                                                <span className="italic block w-full mt-1">Processed as: "{msg.originalText}"</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Loading Indicator */}
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-white/5 p-4 rounded-2xl rounded-bl-none flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                            <span className="text-xs text-white/60">
                                {modelLoading ? "Translating with Neural Model..." : "Accessing Knowledge Base..."}
                            </span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/20 border-t border-white/10">
                <div className="flex items-center space-x-2 bg-white/5 rounded-xl border border-white/10 p-2 focus-within:border-blue-500/50 transition-colors">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={modelLoading ? "Loading models..." : `Type in ${LANGUAGES.find(l => l.code === userLanguage)?.name}...`}
                        className="flex-1 bg-transparent text-white px-3 py-2 focus:outline-none placeholder:text-white/30"
                        disabled={isProcessing}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isProcessing || !inputValue.trim()}
                        className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-white/30">
                        AI runs locally in your browser via WebAssembly + WebGPU (Simulated for Demo)
                    </p>
                </div>
            </div>
        </div>
    );
}

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
];
