import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Register() {
    const { register, handleSubmit } = useForm();

    const onSubmit = (data: any) => {
        console.log(data);
        window.location.href = '/dashboard';
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
                <p className="text-slate-500 font-medium">Start your career intelligence journey today.</p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            {...register('name')}
                            type="text"
                            placeholder="Chidubem Okafor"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-emerald-500/10 focus:border-brand-emerald-500 transition-all font-medium"
                        />
                    </div>
                </div>

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
                    <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
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

                <div className="flex items-start gap-3 px-1 pt-2">
                    <input type="checkbox" className="mt-1 rounded border-slate-300 text-brand-emerald-500 focus:ring-brand-emerald-500" required />
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        By signing up, I agree to the <a href="#" title="Privacy" className="text-brand-blue-900 font-bold underline">Terms of Service</a> and <a href="#" title="Privacy" className="text-brand-blue-900 font-bold underline">Privacy Policy</a>.
                    </p>
                </div>

                <button type="submit" className="w-full py-4 bg-brand-blue-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-blue-800 transition-all shadow-xl shadow-brand-blue-900/10 text-lg">
                    Create Free Account <ArrowRight className="w-5 h-5" />
                </button>
            </form>

            <div className="p-4 bg-brand-emerald-50 rounded-xl flex gap-3 text-brand-emerald-700">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs font-bold leading-tight">Your data is encrypted and will never be shared without your explicit consent.</p>
            </div>

            <p className="text-center text-sm font-medium text-slate-500">
                Already have an account? <Link to="/login" className="text-brand-emerald-600 font-bold hover:text-brand-emerald-700">Sign in</Link>
            </p>
        </div>
    );
}
