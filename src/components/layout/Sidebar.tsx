import React from 'react';
import { NavLink } from 'react-router-dom';
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
    ArrowRight
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Briefcase, label: 'Job Discovery', path: '/jobs' },
    { icon: Map, label: 'Career Pathway', path: '/pathway' },
    { icon: FileText, label: 'CV Management', path: '/cv' },
    { icon: User, label: 'Profile', path: '/profile' },
];

export function Sidebar({ onClose, onOpenWhatsApp }: { onClose?: () => void, onOpenWhatsApp?: () => void }) {
    return (
        <aside className="w-64 h-full bg-brand-blue-900 text-slate-300 flex flex-col pt-4 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <svg width="100%" height="100%">
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <div className="px-6 py-4 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <img src="/logo.svg" alt="Hirena Logo" className="w-10 h-10" />
                    <span className="text-white font-bold text-2xl tracking-tight">HIRENA</span>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 relative z-10">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                            isActive
                                ? "bg-brand-emerald-500 text-white shadow-lg shadow-brand-emerald-500/20"
                                : "hover:bg-brand-blue-800 hover:text-white"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 space-y-4 relative z-10">
                {/* WhatsApp Promo */}
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl p-4 relative overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-emerald-500/20 transition-all" onClick={onOpenWhatsApp}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-white font-bold mb-1">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            Live Job Alerts
                        </div>
                        <p className="text-[10px] text-emerald-100 mb-3 leading-tight">Get matched jobs sent instantly to your WhatsApp.</p>
                        <button className="w-full py-2 bg-white text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5">
                            Connect Now <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                <div className="border-t border-brand-blue-800 pt-4">
                    <NavLink
                        to="/settings"
                        onClick={onClose}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                            isActive ? "bg-brand-blue-800 text-white" : "hover:bg-brand-blue-800 hover:text-white"
                        )}
                    >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Settings</span>
                    </NavLink>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 mt-2">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Log Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
