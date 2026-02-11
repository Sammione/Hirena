import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function AuthLayout() {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
            <div className="hidden lg:flex flex-col justify-between p-12 bg-brand-blue-900 text-white relative overflow-hidden">
                {/* Abstract design elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-emerald-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-emerald-500/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>

                <Link to="/" className="flex items-center gap-2 relative z-10">
                    <div className="w-8 h-8 bg-brand-emerald-500 rounded flex items-center justify-center">
                        <span className="text-white font-bold">H</span>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">HIRENA</span>
                </Link>

                <div className="relative z-10 space-y-8 max-w-md">
                    <h2 className="text-5xl font-bold leading-tight">Secure your future with <span className="text-brand-emerald-400">HIRENA.</span></h2>
                    <p className="text-brand-blue-200 text-lg leading-relaxed">
                        Join over 12,000 African professionals building their careers with AI-powered intelligence.
                    </p>
                    <div className="flex items-center gap-4 py-6 border-t border-white/10">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-brand-blue-900 bg-slate-200 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" />
                                </div>
                            ))}
                        </div>
                        <p className="text-sm font-medium text-brand-blue-300">
                            <span className="text-white font-bold">400+</span> professionals joined this week.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-2 text-sm text-brand-blue-400 font-medium">
                    <ShieldCheck className="w-4 h-4" /> GDPR Compliant • AES-256 Encryption
                </div>
            </div>

            <div className="flex items-center justify-center p-8 md:p-12 lg:p-16">
                <div className="w-full max-w-md">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
