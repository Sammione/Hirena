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
    Briefcase
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Briefcase, label: 'Job Discovery', path: '/jobs' },
    { icon: Map, label: 'Career Pathway', path: '/pathway' },
    { icon: FileText, label: 'CV Management', path: '/cv' },
    { icon: User, label: 'Profile', path: '/profile' },
];

export function Sidebar() {
    return (
        <aside className="w-64 h-screen bg-brand-blue-900 text-slate-300 flex flex-col fixed left-0 top-0 z-50">
            <div className="p-6 flex items-center gap-3">
                <img src="/logo.svg" alt="Hirena Logo" className="w-10 h-10" />
                <span className="text-white font-bold text-2xl tracking-tight">HIRENA</span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
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

            <div className="p-4 border-t border-brand-blue-800">
                <NavLink
                    to="/settings"
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
        </aside>
    );
}
