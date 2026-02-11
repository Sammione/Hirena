import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex-1 max-w-xl hidden md:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search jobs, skills, or courses..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-emerald-500/20 focus:border-brand-emerald-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-emerald-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-all">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900 leading-none">Chidubem Okafor</p>
                        <p className="text-xs text-brand-emerald-600 font-medium">Pro Member</p>
                    </div>
                    <div className="w-9 h-9 bg-brand-blue-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        CO
                    </div>
                </div>
            </div>
        </header>
    );
}
