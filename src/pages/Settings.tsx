import React, { useState, useEffect } from 'react';
import {
    Settings,
    Bell,
    Shield,
    Ghost,
    MessageSquare,
    Cpu,
    Globe,
    Zap,
    Loader2,
    CheckCircle2,
    Database,
    Lock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../utils/cn';

export default function SettingsPage() {
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // AI Settings State
    const [confidence, setConfidence] = useState(85);
    const [intensity, setIntensity] = useState('balanced'); // relaxed, balanced, aggressive
    const [whatsappEnabled, setWhatsappEnabled] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (data) {
                setProfile(data);
                setWhatsappEnabled(data.whatsapp_alerts || false);
                setWhatsappNumber(data.whatsapp_number || '');
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .update({
                    whatsapp_alerts: whatsappEnabled,
                    whatsapp_number: whatsappNumber,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;
            alert('Settings updated successfully!');
        } catch (err) {
            console.error('Error saving settings:', err);
            alert('Failed to update settings.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-brand-emerald-500 animate-spin mb-4" />
                <p className="text-slate-500 font-bold">Synchronizing AI parameters...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-brand-blue-900" /> System Settings
                    </h1>
                    <p className="text-slate-500 font-medium">Control your AI agent and notification protocols.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary px-8 py-3 rounded-2xl flex items-center gap-2"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Save Protocol
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Navigation Sidebar */}
                <div className="md:col-span-1 space-y-2">
                    {[
                        { icon: Cpu, label: 'AI Parameters', id: 'ai' },
                        { icon: Bell, label: 'Notifications', id: 'notify' },
                        { icon: Shield, label: 'Account Security', id: 'account' },
                        { icon: Database, label: 'Data & Privacy', id: 'data' }
                    ].map((item) => (
                        <button
                            key={item.id}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                item.id === 'ai' ? "bg-white text-brand-blue-900 shadow-sm border border-slate-200" : "text-slate-500 hover:bg-slate-100"
                            )}
                        >
                            <item.icon className="w-4.5 h-4.5" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-8">
                    {/* AI Configuration */}
                    <div className="card p-8 space-y-8">
                        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                            <div className="w-10 h-10 bg-brand-emerald-500/10 rounded-xl flex items-center justify-center">
                                <Ghost className="w-5 h-5 text-brand-emerald-500" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tighter">Ghost Hunter Logic</h3>
                                <p className="text-xs text-slate-500 font-medium tracking-tight">Configure how your AI agent hunts for roles.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Confidence Threshold</label>
                                    <span className="text-brand-emerald-600 font-black text-sm">{confidence}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="50"
                                    max="100"
                                    value={confidence}
                                    onChange={(e) => setConfidence(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-brand-emerald-500"
                                />
                                <p className="text-[10px] text-slate-400 font-medium">The Ghost will only alert you for matches with a score above this limit.</p>
                            </div>

                            <div className="space-y-4 pt-4">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Hunting Intensity</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['relaxed', 'balanced', 'aggressive'].map((lvl) => (
                                        <button
                                            key={lvl}
                                            onClick={() => setIntensity(lvl)}
                                            className={cn(
                                                "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                intensity === lvl
                                                    ? "bg-brand-blue-900 text-white border-brand-blue-900 shadow-lg shadow-brand-blue-900/10"
                                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                            )}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notification Protocols */}
                    <div className="card p-8 space-y-8">
                        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                            <div className="w-10 h-10 bg-brand-blue-900/5 rounded-xl flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-brand-blue-900" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tighter">Notification Protocols</h3>
                                <p className="text-xs text-slate-500 font-medium tracking-tight">Stay synchronized with the Ghost.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 leading-none mb-1">WhatsApp Integration</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Get matched jobs sent to your phone.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-all relative",
                                        whatsappEnabled ? "bg-brand-emerald-500" : "bg-slate-300"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                        whatsappEnabled ? "left-7" : "left-1"
                                    )} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Target Phone Number</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        placeholder="+234..."
                                        className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-emerald-500/10 focus:border-brand-emerald-500 outline-none"
                                        value={whatsappNumber}
                                        onChange={(e) => setWhatsappNumber(e.target.value)}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Globe className="w-4 h-4 text-slate-300" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="card p-8 border-red-100 bg-red-50/30">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-500">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tighter">Security & Privacy</h3>
                                <p className="text-xs text-slate-500 font-medium tracking-tight">Manage your account permanence.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">Logout of All Sessions</button>
                            <button className="px-6 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600">Delete My Data</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
