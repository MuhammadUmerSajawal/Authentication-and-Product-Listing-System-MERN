import React from 'react';
import { FaTwitter, FaFacebookF, FaInstagram, FaGithub } from 'react-icons/fa';
import { SiVisa, SiMastercard, SiPaypal, SiApplepay, SiGooglepay } from 'react-icons/si';

const Footer = () => {
    return (
        <footer className="bg-white pt-20 pb-10 border-t border-gray-100 font-sans">
            <div className="max-w-[1600px] max-h-[400px] mx-auto px-6 sm:px-10 lg:px-16">
                <div className="flex flex-wrap justify-between gap-y-16 mb-20">
                    {/* Brand Section */}
                    <div className="w-full lg:w-[320px]">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-full font-bold text-xl shadow-sm">
                                N
                            </div>
                            <span className="text-3xl font-black tracking-tight text-black">Nextgen</span>
                        </div>
                        <p className="text-gray-500 text-[15px] leading-relaxed mb-10 max-w-[280px]">
                            We have clothes that suits your style and which you're proud to wear. From women to men.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-black hover:bg-slate-500 hover:text-white transition-all no-underline shadow-sm" aria-label="Twitter">
                                <FaTwitter size={18} />
                            </a>
                            <a href="#" className="flex items-center justify-center w-10 h-10 rounded-full bg-black text-white border border-black no-underline shadow-md" aria-label="Facebook">
                                <FaFacebookF size={18} />
                            </a>
                            <a href="#" className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-black hover:bg-slate-500 hover:text-white transition-all no-underline shadow-sm" aria-label="Instagram">
                                <FaInstagram size={18} />
                            </a>
                            <a href="#" className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-black hover:bg-slate-500 hover:text-white transition-all no-underline shadow-sm" aria-label="GitHub">
                                <FaGithub size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Columns Section */}
                    <div className="flex flex-1 flex-wrap justify-between gap-10 lg:gap-4 max-w-[900px]">
                        <div className="min-w-[150px]">
                            <h4 className="text-[15px] font-bold tracking-[0.15em] text-black mb-8 uppercase">Company</h4>
                            <ul className="list-none p-0 m-0 space-y-5">
                                <li><a href="#" className="text-gray-500 text-[15px] no-underline hover:text-black transition-colors block">About</a></li>
                                <li><a href="#" className="text-gray-500 text-[15px] no-underline hover:text-black transition-colors block">Features</a></li>
                                <li><a href="#" className="text-gray-500 text-[15px] no-underline hover:text-black transition-colors block">Works</a></li>
                                <li><a href="#" className="text-gray-500 text-[15px] no-underline hover:text-black transition-colors block">Career</a></li>
                            </ul>
                        </div>

                        <div className="min-w-[150px]">
                            <h4 className="text-[15px] font-bold tracking-[0.15em] text-black mb-8 uppercase">Help</h4>
                            <ul className="list-none p-0 m-0 space-y-5">
                                <li><a href="#" className="text-gray-500 text-[15px] no-underline hover:text-black transition-colors block">Customer Support</a></li>
                                <li><a href="#" className="text-gray-500 text-[15px] no-underline hover:text-black transition-colors block">Delivery Details</a></li>
                                <li><a href="#" className="text-gray-500 text-[15px] no-underline hover:text-black transition-colors block">Terms & Conditions</a></li>
                                <li><a href="#" className="text-gray-500 text-[15px] no-underline hover:text-black transition-colors block">Privacy Policy</a></li>
                            </ul>
                        </div>

                        <div className="min-w-[150px]">
                            <h4 className="text-[15px] font-bold tracking-[0.15em] text-black mb-8 uppercase">Faq</h4>
                            <ul className="list-none p-0 m-0 space-y-5">
                                <li><a href="#" className="text-gray-500 text-[15px] no-underline hover:text-black transition-colors block">Account</a></li>
                                <li><a href="#" className="text-gray-500 text-[15px] no-underline hover:text-black transition-colors block">Manage Deliveries</a></li>
                                <li><a href="#" className="text-gray-500 text-[15px] no-underline hover:text-black transition-colors block">Orders</a></li>
                                <li><a href="#" className="text-gray-500 text-[15px] no-underline hover:text-black transition-colors block">Payments</a></li>
                            </ul>
                        </div>

                        <div className="min-w-[150px]">
                            <h4 className="text-[15px] font-bold tracking-[0.15em] text-black mb-8 uppercase">Resources</h4>
                            <ul className="list-none p-0 m-0 space-y-5">
                                <li><a href="#" className="text-gray-500 text-[15px] no-underline hover:text-black transition-colors block">Free eBooks</a></li>
                                <li><a href="#" className="text-gray-500 text-[15px] no-underline hover:text-black transition-colors block">Development Tutorial</a></li>
                                <li><a href="#" className="text-gray-500 text-[15px] no-underline hover:text-black transition-colors block">How to - Blog</a></li>
                                <li><a href="#" className="text-gray-500 text-[15px] no-underline hover:text-black transition-colors block">Youtube Playlist</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                    <p className="text-gray-400 text-sm font-medium m-0">Nextgen © 2004, All Rights Reserved</p>
                    <div className="flex items-center gap-4">
                        <div className="bg-white border border-gray-100 rounded-xl py-4 px-6 shadow-sm hover:shadow-md transition-all flex items-center justify-center h-16 w-24 cursor-pointer">
                            <SiVisa className="text-[#1A1F71] text-2xl" />
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl py-4 px-6 shadow-sm hover:shadow-md transition-all flex items-center justify-center h-16 w-24 cursor-pointer">
                            <SiMastercard className="text-[#EB001B] text-2xl" />
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl py-4 px-6 shadow-sm hover:shadow-md transition-all flex items-center justify-center h-16 w-24 cursor-pointer">
                            <SiPaypal className="text-[#003087] text-2xl" />
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl py-4 px-6 shadow-sm hover:shadow-md transition-all flex items-center justify-center h-16 w-24 cursor-pointer">
                            <SiApplepay className="text-black text-2xl" />
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl py-4 px-6 shadow-sm hover:shadow-md transition-all flex items-center justify-center h-16 w-24 cursor-pointer">
                            <SiGooglepay className="text-[#4285F4] text-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
