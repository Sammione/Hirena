import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import CareerAI from '../components/CareerAI';

export function MainLayout() {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar - hidden on mobile, shown on lg */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
                    <Outlet />
                </main>

                <CareerAI />

                {/* Mobile Bottom Navigation Placeholder or Footer */}
                <div className="lg:hidden h-20 bg-white border-t border-slate-200 sticky bottom-0 flex items-center justify-around px-4">
                    {/* Add icons here for mobile navigation if needed */}
                    <div className="w-8 h-8 bg-brand-emerald-500 rounded-lg"></div>
                    <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                    <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                    <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
}
