import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, ArrowRight, Github } from 'lucide-react';

export default function Login() {
    const { register, handleSubmit } = useForm();

    const onSubmit = (data: any) => {
        console.log(data);
        // Redirect to dashboard mock
        window.location.href = '/dashboard';
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Sign in</h1>
                <p className="text-slate-500 font-medium">Enter your details to access your dashboard.</p>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm text-slate-700">
                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="google" /> Google
                </button>
                <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm text-slate-700">
                    <Github className="w-4 h-4" /> Github
                </button>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-100"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or continue with</span>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Work Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="name@company.com"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-emerald-500/10 focus:border-brand-emerald-500 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-sm font-bold text-slate-700">Password</label>
                        <Link to="/forgot-password" title="Forgot password" className="text-xs font-bold text-brand-emerald-600 hover:text-brand-emerald-700">Forgot?</Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            {...register('password')}
                            type="password"
                            placeholder="••••••••"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-emerald-500/10 focus:border-brand-emerald-500 transition-all font-medium"
                        />
                    </div>
                </div>

                <button type="submit" className="w-full py-4 bg-brand-blue-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-blue-800 transition-all shadow-xl shadow-brand-blue-900/10 text-lg">
                    Sign in to Hirena <ArrowRight className="w-5 h-5" />
                </button>
            </form>

            <p className="text-center text-sm font-medium text-slate-500">
                New here? <Link to="/register" className="text-brand-emerald-600 font-bold hover:text-brand-emerald-700">Create an account</Link>
            </p>
        </div>
    );
}
