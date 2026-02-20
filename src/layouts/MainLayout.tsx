import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import {
    LayoutDashboard,
    Briefcase,
    Map,
    FileText,
    User,
    MessageCircle
} from 'lucide-react';
import CareerAI from '../components/CareerAI';
import { WhatsAppModal } from '../components/WhatsAppModal';
import { cn } from '../utils/cn';

export function MainLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
            <WhatsAppModal isOpen={isWhatsAppOpen} onClose={() => setIsWhatsAppOpen(false)} />

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Desktop + Mobile Drawer */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-[70] w-64 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <Sidebar
                    onClose={() => setIsMobileMenuOpen(false)}
                    onOpenWhatsApp={() => {
                        setIsMobileMenuOpen(false);
                        setIsWhatsAppOpen(true);
                    }}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0">
                <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
                <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
                    <Outlet />
                </main>

                <CareerAI />

                {/* Mobile Bottom Navigation */}
                <div className="lg:hidden h-16 bg-white border-t border-slate-200 sticky bottom-0 flex items-center justify-around px-2 z-[50] shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                    {[
                        { icon: LayoutDashboard, path: '/dashboard', label: 'Home' },
                        { icon: Briefcase, path: '/jobs', label: 'Jobs' },
                        { icon: Map, path: '/pathway', label: 'Path' },
                        { icon: FileText, path: '/cv', label: 'CV' },
                        { icon: User, path: '/profile', label: 'Profile' },
                    ].map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300 relative",
                                isActive ? "text-brand-emerald-600" : "text-slate-400"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute top-0 w-8 h-1 bg-brand-emerald-500 rounded-b-full animate-in slide-in-from-top-1" />
                                    )}
                                    <item.icon className={cn("w-5 h-5", isActive && "animate-bounce-subtle")} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
}
