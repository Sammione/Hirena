import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
    Ghost,
    Play,
    Square,
    Terminal as TerminalIcon,
    ShieldAlert,
    History,
    Settings2,
    Zap,
    MessageSquare,
    Loader2,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
    Search,
    MapPin,
    Building2,
    Clock
} from 'lucide-react';
import { cn } from '../utils/cn';

type LogEntry = {
    id: string;
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'agent';
};

export default function GhostHunter() {
    const [isActive, setIsActive] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [matchHistory, setMatchHistory] = useState<any[]>([]);
    const [confidence, setConfidence] = useState(85);
    const [whatsappEnabled, setWhatsappEnabled] = useState(false);

    const terminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchSettings();
        addLog('Ghost Hunter initializing...', 'info');
        // Initial setup logs
        setTimeout(() => addLog('Analyzing user CV and market preferences...', 'agent'), 1000);
        setTimeout(() => addLog('Remote node connection established.', 'success'), 2000);
    }, []);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    const fetchSettings = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('profiles')
            .select('whatsapp_alerts, whatsapp_number')
            .eq('id', user.id)
            .single();

        if (profile) {
            setWhatsappEnabled(profile.whatsapp_alerts || false);
        }
    };

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        const newLog: LogEntry = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            message,
            type
        };
        setLogs(prev => [...prev.slice(-49), newLog]);
    };

    const toggleHunter = async () => {
        const newState = !isActive;
        setIsActive(newState);

        if (newState) {
            addLog('Ghost Hunter activated. Beginning autonomous cycle.', 'success');
            simulateScan();
        } else {
            addLog('Ghost Hunter entering standby mode.', 'warning');
            setIsScanning(false);
        }

        // Update DB
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('profiles').update({ whatsapp_alerts: newState }).eq('id', user.id);
        }
    };

    const simulateScan = () => {
        if (isScanning) return;
        setIsScanning(true);
        addLog('Waking up sensors. Connecting to global job boards...', 'agent');

        setTimeout(() => addLog('Scanning Adzuna (Global Remote)...', 'info'), 1500);
        setTimeout(() => addLog('Scanning LinkedIn & Indeed (Lagos/Region)...', 'info'), 3000);
        setTimeout(() => {
            addLog('Match found (92% confidence): Senior Frontend Engineer at TechFlow.', 'success');
            setMatchHistory(prev => [
                {
                    id: Date.now(),
                    company: 'TechFlow',
                    role: 'Senior Frontend Engineer',
                    location: 'Remote (US/UK)',
                    salary: '$120k - $160k',
                    score: 92,
                    date: 'Just now'
                },
                ...prev
            ]);
            if (whatsappEnabled) {
                addLog('WhatsApp alert dispatched to user.', 'agent');
            }
            setIsScanning(false);
        }, 6000);
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header with Pulse */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg",
                            isActive ? "bg-brand-emerald-500 shadow-brand-emerald-500/20" : "bg-slate-200"
                        )}>
                            <Ghost className={cn("w-7 h-7", isActive ? "text-white" : "text-slate-400")} />
                        </div>
                        {isActive && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            Ghost Hunter
                            {isActive && <span className="text-[10px] bg-brand-emerald-100 text-brand-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-widest font-black animate-pulse">Live</span>}
                        </h1>
                        <p className="text-slate-500 font-medium">Your autonomous AI agent hunting jobs in the background.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleHunter}
                        className={cn(
                            "flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl",
                            isActive
                                ? "bg-red-500 text-white shadow-red-500/20 hover:bg-red-600"
                                : "bg-brand-emerald-500 text-white shadow-brand-emerald-500/20 hover:bg-brand-emerald-600"
                        )}
                    >
                        {isActive ? (
                            <><Square className="w-4 h-4 fill-current" /> Deactivate Agent</>
                        ) : (
                            <><Play className="w-4 h-4 fill-current" /> Activate Agent</>
                        )}
                    </button>
                    <button className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-400">
                        <Settings2 className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Command Center */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Live Terminal */}
                    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                        <div className="px-6 py-4 bg-slate-800/50 flex items-center justify-between border-b border-slate-700">
                            <div className="flex items-center gap-2">
                                <TerminalIcon className="w-4 h-4 text-brand-emerald-400" />
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Agent Terminal Out_V1.0</span>
                            </div>
                            <div className="flex gap-1.5 font-mono">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                                <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald-500/20" />
                            </div>
                        </div>
                        <div
                            ref={terminalRef}
                            className="p-6 h-[400px] overflow-y-auto font-mono text-sm space-y-2 scroll-smooth"
                        >
                            {logs.map((log) => (
                                <div key={log.id} className="flex gap-4 group">
                                    <span className="text-slate-600 flex-shrink-0 select-none">[{log.timestamp}]</span>
                                    <span className={cn(
                                        "font-medium",
                                        log.type === 'info' && "text-slate-400",
                                        log.type === 'success' && "text-brand-emerald-400",
                                        log.type === 'warning' && "text-amber-400",
                                        log.type === 'error' && "text-red-400",
                                        log.type === 'agent' && "text-blue-400 italic"
                                    )}>
                                        {log.type === 'agent' && '• '}
                                        {log.message}
                                    </span>
                                </div>
                            ))}
                            {isScanning && (
                                <div className="flex gap-4 animate-pulse">
                                    <span className="text-slate-600 select-none">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                                    <span className="text-brand-emerald-400 font-bold italic">Scanning global nodes...</span>
                                </div>
                            )}
                            <div className="w-2 h-4 bg-brand-emerald-500/50 animate-pulse inline-block ml-16" />
                        </div>
                    </div>

                    {/* Match History */}
                    <div className="card p-8 bg-white border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <History className="w-6 h-6 text-brand-blue-900" />
                                Captured Opportunities
                            </h3>
                            <button className="text-[10px] font-black uppercase tracking-widest text-brand-blue-900 hover:bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 transition-all">Export JSON</button>
                        </div>

                        {matchHistory.length === 0 ? (
                            <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold">No captures yet. Activate the Ghost to begin hunting.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {matchHistory.map((match) => (
                                    <div key={match.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-brand-emerald-500/30 transition-all group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-start gap-5">
                                                <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-brand-emerald-500 group-hover:text-white transition-all shadow-sm">
                                                    <Building2 className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-900 leading-tight mb-1">{match.role}</h4>
                                                    <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
                                                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {match.location}</span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="flex items-center gap-1 text-slate-900 font-bold underline decoration-brand-emerald-500/30Decoration">{match.company}</span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="flex items-center gap-1 text-brand-emerald-600 font-bold">{match.salary}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1.5 justify-end">
                                                        <Zap className="w-4 h-4 text-brand-emerald-500 fill-current" />
                                                        <span className="text-xl font-black text-slate-900">{match.score}%</span>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Match Strength</span>
                                                </div>
                                                <button className="p-4 bg-brand-blue-900 text-white rounded-2xl shadow-lg shadow-brand-blue-900/10 hover:bg-brand-blue-800 hover:scale-105 active:scale-95 transition-all">
                                                    <ArrowUpRight className="w-6 h-6" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-8">
                    {/* Settings Panel */}
                    <div className="card p-8 bg-brand-blue-900 text-white overflow-hidden relative">
                        {/* Decor */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

                        <h3 className="text-lg font-black uppercase tracking-tighter mb-8 flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-brand-emerald-400" />
                            Hunter Parameters
                        </h3>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-black uppercase tracking-widest text-brand-blue-200">Confidence Floor</label>
                                    <span className="text-brand-emerald-400 font-mono font-bold">{confidence}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={confidence}
                                    onChange={(e) => setConfidence(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-emerald-500"
                                />
                                <p className="text-[10px] text-brand-blue-300 italic font-medium">Ghost will ignore matches below this score.</p>
                            </div>

                            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="w-5 h-5 text-brand-emerald-400" />
                                        <span className="text-sm font-bold">WhatsApp Alerts</span>
                                    </div>
                                    <div
                                        onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-all cursor-pointer relative",
                                            whatsappEnabled ? "bg-brand-emerald-500" : "bg-white/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                            whatsappEnabled ? "left-7" : "left-1"
                                        )} />
                                    </div>
                                </div>
                                <p className="text-[10px] text-brand-blue-300 font-medium leading-relaxed">
                                    Send matched opportunities directly to +234... {whatsappEnabled ? 'Active.' : 'Disabled.'}
                                </p>
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                <div className="flex items-center gap-3 text-xs font-bold text-brand-blue-200">
                                    <Clock className="w-4 h-4" />
                                    Scan Interval: Every 4 Hours
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-brand-blue-200">
                                    <CheckCircle2 className="w-4 h-4 text-brand-emerald-400" />
                                    Targeting: Remote & Lagos Tech
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pro Call to Action */}
                    <div className="card p-8 bg-gradient-to-br from-brand-emerald-50 to-white border border-brand-emerald-100 flex flex-col justify-center">
                        <div className="w-12 h-12 bg-brand-emerald-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand-emerald-500/20">
                            <Zap className="w-6 h-6 fill-current" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-2 leading-tight">Ghost Apply</h4>
                        <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                            Upgrade to Hirena Pro and let the Ghost autonomouslly submit applications and follow-up emails for you.
                        </p>
                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                            Go PRO <ShieldAlert className="w-4 h-4 text-brand-emerald-400" />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
