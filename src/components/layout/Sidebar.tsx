import React from 'react';
import { NavLink } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    LayoutDashboard,
    Search,
    Map,
    FileText,
    User,
    Settings,
    LogOut,
    Briefcase,
    X,
    ArrowRight,
    DollarSign,
    Building2,
    History,
    Ghost,
    Users
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navigation = {
    HUNTING: [
        { icon: Ghost, label: 'Ghost Hunter', path: '/ghost-hunter' },
        { icon: Users, label: 'Network Intelligence', path: '/outreach' },
        { icon: Briefcase, label: 'Job Discovery', path: '/jobs' },
        { icon: Building2, label: 'Company Deep-Dive', path: '/company-insights' },
    ],
    STRATEGY: [
        { icon: History, label: 'Career Time Machine', path: '/pathway' },
        { icon: DollarSign, label: 'Salary Negotiator', path: '/negotiator' },
    ],
    ASSETS: [
        { icon: FileText, label: 'CV Management', path: '/cv' },
        { icon: User, label: 'Profile', path: '/profile' },
    ]
};

export function Sidebar({ onClose, onOpenWhatsApp }: { onClose?: () => void, onOpenWhatsApp?: () => void }) {
    return (
        <aside className="w-64 h-full bg-slate-950 text-slate-400 flex flex-col pt-4 relative overflow-hidden ring-1 ring-white/5">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

            <div className="px-6 py-4 mb-4 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => window.location.href = '/'}>
                    <div className="w-9 h-9 bg-brand-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-emerald-500/20 group-hover:rotate-12 transition-transform">
                        <Ghost className="text-white w-5 h-5" />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white uppercase italic">Hirena</span>
                </div>
                {onClose && (
                    <button onClick={onClose} className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-white">
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            <div className="px-6 mb-6">
                <div className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-3">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 bg-brand-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">Ghost Agent</p>
                        <p className="text-[11px] font-bold text-slate-200 leading-none">ACTIVE & HUNTING</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-8 overflow-y-auto relative z-10 scrollbar-hide">
                {Object.entries(navigation).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                        <h3 className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">
                            {category}
                        </h3>
                        {items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) => cn(
                                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group",
                                    isActive
                                        ? "bg-gradient-to-r from-brand-emerald-500/10 to-brand-emerald-500/5 text-brand-emerald-400 border border-brand-emerald-500/20 shadow-lg shadow-brand-emerald-500/5"
                                        : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]"
                                )}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <item.icon className={cn("w-4.5 h-4.5 transition-transform group-hover:scale-110", isActive && "text-brand-emerald-400")} />
                                            <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                        </div>
                                        {isActive && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="p-4 mt-auto space-y-4 relative z-10">
                <div className="border-t border-white/5 pt-4">
                    <NavLink
                        to="/settings"
                        onClick={onClose}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                            isActive ? "text-white bg-white/5" : "text-slate-500 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Settings className="w-4.5 h-4.5" />
                        <span className="text-sm font-bold tracking-tight">Settings</span>
                    </NavLink>
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            localStorage.clear();
                            window.location.href = '/login';
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all duration-300 mt-1"
                    >
                        <LogOut className="w-4.5 h-4.5" />
                        <span className="text-sm font-bold tracking-tight">Log Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
