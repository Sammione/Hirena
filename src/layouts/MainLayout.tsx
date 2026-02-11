import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
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

                {/* Mobile Bottom Navigation Placeholder or Footer */}
                <div className="lg:hidden h-20 bg-white border-t border-slate-200 sticky bottom-0 flex items-center justify-around px-4 z-40">
                    <div className="w-8 h-8 bg-brand-emerald-500 rounded-lg opacity-20"></div>
                    <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                    <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                    <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
}
