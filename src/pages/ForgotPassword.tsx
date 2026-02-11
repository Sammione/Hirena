import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
    const [submitted, setSubmitted] = useState(false);

    if (submitted) {
        return (
            <div className="space-y-8 animate-in zoom-in duration-300 text-center">
                <div className="w-20 h-20 bg-brand-emerald-50 rounded-full flex items-center justify-center mx-auto text-brand-emerald-500">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <header className="space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900">Check your email</h1>
                    <p className="text-slate-500 font-medium">We've sent a password reset link to <br /><span className="text-slate-900 font-bold">chidubem.o@hirena.me</span></p>
                </header>
                <div className="pt-4">
                    <Link to="/login" className="text-brand-emerald-600 font-bold hover:text-brand-emerald-700 flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Reset Password</h1>
                <p className="text-slate-500 font-medium">Enter your email and we'll send you a recovery link.</p>
            </header>

            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Work Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="email"
                            placeholder="name@company.com"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-emerald-500/10 focus:border-brand-emerald-500 transition-all font-medium"
                        />
                    </div>
                </div>

                <button type="submit" className="w-full py-4 bg-brand-blue-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-blue-800 transition-all shadow-xl shadow-brand-blue-900/10 text-lg">
                    Send Recovery Link <ArrowRight className="w-5 h-5" />
                </button>
            </form>

            <p className="text-center text-sm font-medium text-slate-500">
                Remember your password? <Link to="/login" className="text-brand-emerald-600 font-bold hover:text-brand-emerald-700">Go back</Link>
            </p>
        </div>
    );
}
