import React from 'react';
import { motion } from 'framer-motion';
import { Globe2 } from 'lucide-react';

export function HeroSection() {
    return (
        <div className="relative w-full h-[550px] flex items-center justify-center overflow-hidden bg-[#FFFDF9]">
            {/* Luxurious Professional Background */}
            <div className="absolute inset-0 bg-[#FFFDF9]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#D7CCC8_0%,_transparent_50%)] opacity-40"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_#B08968_0%,_transparent_40%)] opacity-20"></div>

                {/* Subtle Paper Texture/Pattern */}
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(#000000 0.5px, transparent 0.5px)',
                    backgroundSize: '40px 40px',
                    opacity: 0.05
                }}></div>

                {/* Elegant Geometric Accents */}
                <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-[#D7CCC8]/10 to-transparent skew-x-12 transform origin-top-right"></div>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#8D6E63]/30 bg-[#8D6E63]/5 text-[#8D6E63] text-xs font-serif font-bold mb-8 uppercase tracking-[0.2em]"
                >
                    <Globe2 size={14} />
                    <span>Cross-Border Communication Excellence</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-9xl font-serif font-black text-[#000000] mb-10 leading-[1.05] tracking-tighter"
                >
                    Bridging Worlds <br />
                    <span className="italic font-normal text-[#8D6E63]">Through Speech</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl md:text-2xl text-[#8D6E63] font-serif max-w-2xl mx-auto italic leading-relaxed"
                >
                    "Experience support without boundaries, where every language finds its voice."
                </motion.p>

                {/* Quality Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 flex justify-center items-center gap-8 text-[#8D6E63] text-[10px] font-bold uppercase tracking-[0.3em]"
                >
                    <div className="flex flex-col items-center">
                        <span>ISO 9001 Certified</span>
                    </div>
                    <div className="w-1 h-1 bg-[#8D6E63] rounded-full"></div>
                    <div className="flex flex-col items-center">
                        <span>24/7 Global Access</span>
                    </div>
                    <div className="w-1 h-1 bg-[#8D6E63] rounded-full"></div>
                    <div className="flex flex-col items-center">
                        <span>AI Recognition</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

