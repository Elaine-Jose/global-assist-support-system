import React from 'react';
import { MessageCircle, Phone, Mail, Twitter, Facebook, Instagram } from 'lucide-react';

export function FooterInfo() {
    return (
        <footer className="w-full py-20 px-6 bg-[#FFFDF9] border-t border-[#D7CCC8]/30 text-[#4E342E]">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 mb-16">

                <div className="flex flex-col items-center group">
                    <div className="mb-6 p-4 bg-[#FDF5E6] rounded-2xl group-hover:bg-[#4E342E] group-hover:text-white transition-all duration-300 shadow-sm">
                        <MessageCircle className="w-10 h-10" />
                    </div>
                    <h3 className="font-serif font-black text-xl mb-1 uppercase tracking-wider">24/7 Live Chat</h3>
                </div>

                <div className="flex flex-col items-center group">
                    <div className="mb-6 p-4 bg-[#FDF5E6] rounded-2xl group-hover:bg-[#4E342E] group-hover:text-white transition-all duration-300 shadow-sm">
                        <Phone className="w-10 h-10" />
                    </div>
                    <h3 className="font-serif font-black text-xl mb-1 uppercase tracking-wider">Phone Support</h3>
                </div>

                <div className="flex flex-col items-center group">
                    <div className="mb-6 p-4 bg-[#FDF5E6] rounded-2xl group-hover:bg-[#4E342E] group-hover:text-white transition-all duration-300 shadow-sm">
                        <Mail className="w-10 h-10" />
                    </div>
                    <h3 className="font-serif font-black text-xl mb-1 uppercase tracking-wider">Email Assistance</h3>
                </div>
            </div>

            <div className="border-t border-[#D7CCC8]/20 pt-10 flex flex-col md:flex-row justify-between items-center text-xs text-[#8D6E63] font-serif font-bold tracking-widest uppercase">
                <p>© 2026 Global Assist - Privacy Policy - Terms of Service</p>
                <div className="flex space-x-4 mt-4 md:mt-0">
                    <Twitter className="w-4 h-4 cursor-pointer hover:text-white" />
                    <Facebook className="w-4 h-4 cursor-pointer hover:text-white" />
                    <Instagram className="w-4 h-4 cursor-pointer hover:text-white" />
                </div>
            </div>
        </footer>
    );
}
