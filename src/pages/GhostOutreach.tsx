import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Ghost,
    Search,
    Building2,
    Users,
    Zap,
    MessageSquare,
    Copy,
    Check,
    Globe,
    ArrowUpRight,
    Loader2,
    ShieldAlert,
    Sparkles,
    Send
} from 'lucide-react';
import { cn } from '../utils/cn';
import { generateGhostOutreach, fetchCompanyIntelligence } from '../lib/openai';

export default function GhostOutreach() {
    const [companyName, setCompanyName] = useState('');
    const [hiringManager, setHiringManager] = useState({ name: '', role: '', profile: '' });
    const [recentNews, setRecentNews] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [outreachDraft, setOutreachDraft] = useState('');
    const [copied, setCopied] = useState(false);
    const [cvText, setCvText] = useState('');

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: cvData } = await supabase
            .from('cv_analyses')
            .select('cv_text')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (cvData?.cv_text) setCvText(cvData.cv_text);
    };

    const handleSearch = async () => {
        if (!companyName) return;
        setIsSearching(true);
        setOutreachDraft(''); // Reset
        try {
            const data = await fetchCompanyIntelligence(companyName);
            setHiringManager(data.manager);
            setRecentNews(data.news);
        } catch (err) {
            console.error('Intelligence fetch failed:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleGenerateOutreach = async () => {
        setIsGenerating(true);
        try {
            const draft = await generateGhostOutreach(cvText, companyName, hiringManager.name, recentNews);
            setOutreachDraft(draft);
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(outreachDraft);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/20">
                        <Users className="text-white w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            Network Intelligence
                            <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Phantom</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Bypass the ATS. Infiltrate the decision-maker's inbox.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Search Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card p-8 border-slate-200 bg-white">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                            <Search className="w-4 h-4" /> Target Acquisition
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Target Company</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="e.g. Google, TechFlow"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-bold text-sm transition-all"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        disabled={isSearching || !companyName}
                                        className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50"
                                    >
                                        {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {companyName && hiringManager.name && (
                        <div className="card p-8 bg-slate-900 text-white relative overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Decision Maker Detected</h3>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/20">
                                    {hiringManager.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h4 className="font-black text-lg text-white leading-tight">{hiringManager.name}</h4>
                                    <p className="text-slate-400 text-xs font-bold">{hiringManager.role}</p>
                                </div>
                            </div>

                            <a
                                href={hiringManager.profile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all mb-4"
                            >
                                <Globe className="w-4 h-4" /> View LinkedIn Profile
                            </a>
                        </div>
                    )}
                </div>

                {/* Intelligence & Outreach */}
                <div className="lg:col-span-2 space-y-6">
                    {companyName && recentNews ? (
                        <div className="space-y-6">
                            <div className="card p-8 bg-white border border-slate-100 flex gap-6 items-start animate-in slide-in-from-right-4">
                                <div className="p-3 bg-purple-50 rounded-2xl">
                                    <Zap className="w-6 h-6 text-purple-600 fill-current" />
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-1">High-Signal Hook</h3>
                                    <p className="text-slate-900 font-bold leading-relaxed">{recentNews}</p>
                                </div>
                            </div>

                            <div className="card p-1 bg-gradient-to-br from-purple-500 to-brand-blue-500 rounded-3xl">
                                <div className="bg-white rounded-[23px] p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-2">
                                            <Send className="w-5 h-5 text-purple-600" />
                                            <h3 className="text-xl font-black text-slate-900">The "Ghost" Outreach</h3>
                                        </div>
                                        <button
                                            onClick={handleGenerateOutreach}
                                            disabled={isGenerating}
                                            className="bg-purple-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all flex items-center gap-2"
                                        >
                                            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                            {outreachDraft ? 'Regenerate Draft' : 'Construct Message'}
                                        </button>
                                    </div>

                                    {outreachDraft ? (
                                        <div className="space-y-6 animate-in fade-in duration-500">
                                            <div className="relative group">
                                                <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl relative">
                                                    <p className="text-slate-800 font-bold leading-relaxed whitespace-pre-wrap pr-10">
                                                        {outreachDraft}
                                                    </p>
                                                    <button
                                                        onClick={handleCopy}
                                                        className="absolute top-4 right-4 p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm"
                                                    >
                                                        {copied ? <Check className="w-5 h-5 text-brand-emerald-500" /> : <Copy className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:flex-row gap-4">
                                                <div className="flex-1 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-3">
                                                    <ShieldAlert className="w-5 h-5 text-purple-600" />
                                                    <p className="text-[10px] font-bold text-purple-900">
                                                        PRO TIP: Sending this Tuesday between 8 AM and 9 AM recruiter local time increases response by 42%.
                                                    </p>
                                                </div>
                                                <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all active:scale-[0.98]">
                                                    Open LinkedIn Message
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center">
                                            <MessageSquare className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                                            <p className="text-slate-400 font-bold text-lg max-w-sm mx-auto">
                                                Our agent will draft a peer-to-peer message that links your achievements to their recent news.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100">
                                <Users className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3">Initiate Profile Hunt</h3>
                            <p className="text-slate-400 font-medium max-w-xs leading-relaxed">
                                Enter a target company on the left. The Phantom agent will scan for the decision maker and recent corporate triggers.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Phantom Upgrade Call */}
            {!companyName && (
                <div className="card p-12 bg-gradient-to-br from-purple-900 to-slate-900 text-white rounded-[40px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-[0.95]">
                                The Private Network <br />
                                <span className="text-purple-400">On Autopilot.</span>
                            </h2>
                            <p className="text-slate-300 font-medium text-lg leading-relaxed">
                                Phantom users get access to the "Executive Shadow" — our agent that finds personal emails and drafts deep-research messages that bypass human screening.
                            </p>
                        </div>
                        <div className="w-full md:w-auto">
                            <button className="w-full md:w-auto px-10 py-5 bg-purple-500 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-purple-500/30 hover:bg-purple-600 transition-all active:scale-95">
                                Unlock Ghost Outreach
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
