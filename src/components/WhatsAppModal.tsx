import React, { useState } from 'react';
import { X, MessageCircle, CheckCircle2, Phone, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface WhatsAppModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WhatsAppModal({ isOpen, onClose }: WhatsAppModalProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('processing');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('profiles')
                .update({
                    whatsapp_number: phoneNumber,
                    whatsapp_alerts: true
                })
                .eq('id', user.id);

            if (error) throw error;

            setStep('success');
        } catch (err) {
            console.error('WhatsApp connection failed:', err);
            setStep('input');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="bg-brand-emerald-500 p-8 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <MessageCircle className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Hirena Job Bot</h2>
                        <p className="text-brand-emerald-100 font-medium">Get instant job alerts on WhatsApp.</p>
                    </div>
                    {/* Decor */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-blue-900/20 rounded-full blur-2xl translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="p-8">
                    {step === 'input' && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block">WhatsApp Number</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-slate-200 pr-3">
                                        <span className="text-xl">🇳🇬</span>
                                        <span className="text-slate-500 font-bold text-sm">+234</span>
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="812 345 6789"
                                        className="w-full pl-28 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                    <ShieldIcon className="w-3 h-3 text-brand-emerald-500" />
                                    We promise no spam. Only relevant jobs.
                                </p>
                            </div>

                            <button type="submit" className="w-full bg-brand-blue-900 text-white py-4 rounded-xl font-bold hover:bg-brand-blue-800 transition-all shadow-lg shadow-brand-blue-900/20 active:scale-[0.98] flex items-center justify-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                Connect WhatsApp
                            </button>
                        </form>
                    )}

                    {step === 'processing' && (
                        <div className="text-center py-8 space-y-4">
                            <Loader2 className="w-12 h-12 text-brand-emerald-500 animate-spin mx-auto" />
                            <p className="font-bold text-slate-900">Connecting to WhatsApp...</p>
                            <p className="text-sm text-slate-500">Please wait while we set up your bot.</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-4 space-y-6 animate-in slide-in-from-bottom-4">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 animate-bounce">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-slate-900">One Last Step!</h3>
                                <p className="text-slate-500 font-medium px-4 text-sm leading-relaxed">
                                    To start receiving alerts, you need to send a message to our bot. This confirms your number is active.
                                </p>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mx-4">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Message to send:</p>
                                <p className="text-sm font-bold text-slate-700">"START HIRENA ALERTS"</p>
                            </div>

                            <div className="flex flex-col gap-3 px-4">
                                <a
                                    href={`https://wa.me/15551783237?text=START%20HIRENA%20ALERTS`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-brand-emerald-500 text-white py-4 rounded-xl font-bold hover:bg-brand-emerald-600 transition-all shadow-lg shadow-brand-emerald-500/20 flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Open WhatsApp to Confirm
                                </a>
                                <button onClick={onClose} className="w-full text-slate-400 py-2 rounded-xl text-sm font-medium hover:text-slate-600 transition-all">
                                    I'll do it later
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const ShieldIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
);
