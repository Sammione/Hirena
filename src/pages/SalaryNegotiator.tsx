import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { generateNegotiationStrategy } from '../lib/openai';
import {
    DollarSign,
    MessageSquare,
    ShieldCheck,
    ArrowRight,
    Zap,
    Loader2,
    Sparkles,
    FileText,
    Copy,
    CheckCircle2
} from 'lucide-react';
import { cn } from '../utils/cn';

export default function SalaryNegotiator() {
    const [offerDetails, setOfferDetails] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [strategy, setStrategy] = useState<string | null>(null);
    const [userCV, setUserCV] = useState<string>('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadUserCV();
    }, []);

    const loadUserCV = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('cv_analyses')
            .select('cv_text')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (data) setUserCV(data.cv_text);
    };

    const handleGenerate = async () => {
        if (!offerDetails) return;
        setIsGenerating(true);
        try {
            const context = userCV || "Qualified candidate with strong industry background.";
            const result = await generateNegotiationStrategy(offerDetails, context);
            setStrategy(result);
        } catch (err) {
            console.error('Failed to generate strategy:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        if (strategy) {
            navigator.clipboard.writeText(strategy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <header className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-emerald-50 text-brand-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-emerald-100">
                    <DollarSign className="w-3 h-3" /> Money Mindset
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Salary Negotiator AI</h1>
                <p className="text-slate-500 font-medium text-lg">Never leave money on the table. Science-backed negotiation scripts.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-6 border-slate-200 shadow-xl shadow-slate-200/50">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-brand-emerald-500" /> Offer Details
                        </h3>
                        <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">
                            Paste the offer details (salary, benefits, role) or the job description to get a tailored strategy.
                        </p>
                        <textarea
                            value={offerDetails}
                            onChange={(e) => setOfferDetails(e.target.value)}
                            placeholder="e.g. Senior Developer at FinTech Co. Offered $120k + 10% bonus. Market rate is $140k..."
                            className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-emerald-500/10 focus:border-brand-emerald-500 outline-none font-medium text-sm transition-all resize-none"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !offerDetails}
                            className="w-full mt-4 py-4 bg-brand-blue-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-brand-blue-800 transition-all shadow-xl shadow-brand-blue-900/20 disabled:opacity-50"
                        >
                            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                            {isGenerating ? 'Analyzing Market Data...' : 'Generate My Strategy'}
                        </button>
                    </div>

                    <div className="card p-6 bg-brand-emerald-50 border-brand-emerald-100">
                        <div className="flex gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm h-fit">
                                <ShieldCheck className="w-6 h-6 text-brand-emerald-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-brand-blue-900 mb-1">Confidential & Private</h4>
                                <p className="text-xs text-brand-blue-900/60 leading-relaxed font-medium">
                                    Your negotiation data is processed privately and never shared with employers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    {!strategy ? (
                        <div className="h-full min-h-[500px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center group bg-white/50 backdrop-blur-sm">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <DollarSign className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-400 mb-2">Strategy Awaits</h3>
                            <p className="text-slate-400 text-sm max-w-xs font-medium">
                                Fill in the offer details on the left to see your personalized negotiation path.
                            </p>
                        </div>
                    ) : (
                        <div className="card border-brand-emerald-500/30 overflow-hidden shadow-2xl shadow-brand-emerald-500/10 animate-in zoom-in-95 duration-500">
                            <div className="bg-slate-900 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-brand-emerald-500 rounded-lg">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-white font-bold tracking-tight">Your Strategy Book</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={copyToClipboard}
                                        className="p-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 text-xs font-bold"
                                    >
                                        {copied ? <CheckCircle2 className="w-4 h-4 text-brand-emerald-400" /> : <Copy className="w-4 h-4" />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                            <div className="p-8 prose prose-slate max-w-none bg-white">
                                <div className="space-y-6 text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                                    {strategy}
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Email Script Included</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Verbal Script Included</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
