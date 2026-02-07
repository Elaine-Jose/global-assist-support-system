import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Wifi, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export function StatusBar() {
    const [latency, setLatency] = useState(12);

    useEffect(() => {
        const interval = setInterval(() => {
            setLatency(Math.floor(Math.random() * (45 - 10 + 1) + 10));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-[#FFFDF9]/90 backdrop-blur-md border-t border-[#D7CCC8]/30 text-xs text-[#8D6E63] py-2 px-6 flex justify-between items-center z-50 uppercase tracking-widest font-serif font-bold"
        >
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-emerald-600">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                    <span>System Operational</span>
                </div>
                <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-3 h-3 text-[#B08968]" />
                    <span>Secure Connection</span>
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <Cpu className="w-3 h-3 text-[#B08968]" />
                    <span>AI Model: Active</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Wifi className="w-3 h-3 text-[#8D6E63]" />
                    <span className="w-12 text-right">{latency}ms</span>
                </div>
            </div>
        </motion.div>
    );
}
