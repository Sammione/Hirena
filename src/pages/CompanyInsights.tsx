import React, { useState } from 'react';
import { Search, Building2, Globe, Newspaper, HelpCircle, Lightbulb, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { getCompanyInsights } from '../lib/openai';
import { cn } from '../utils/cn';

export default function CompanyInsights() {
    const [companyName, setCompanyName] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [insights, setInsights] = useState<string | null>(null);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!companyName.trim()) return;

        setIsSearching(true);
        try {
            const result = await getCompanyInsights(companyName);
            setInsights(result);
        } catch (error) {
            console.error('Failed to get insights:', error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <header className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                    <Building2 className="w-3 h-3" /> Corporate Intelligence
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Company Deep-Dive AI</h1>
                <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
                    Master your interview by knowing more about the company than the recruiter does.
                </p>
            </header>

            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSearch} className="flex gap-2 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                    <div className="flex-1 flex items-center gap-3 px-4">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g. Google, Jumia, Flutterwave..."
                            className="w-full py-3 bg-transparent outline-none font-bold text-slate-700"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSearching || !companyName.trim()}
                        className="bg-brand-blue-900 text-white px-8 py-3 rounded-xl font-black hover:bg-brand-blue-800 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isSearching ? 'Analyzing...' : 'Deep Dive'}
                    </button>
                </form>
            </div>

            {!insights && !isSearching ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                    {[
                        { icon: Globe, label: 'Culture & Values', desc: 'Understand their "Why" and what makes them unique.' },
                        { icon: Newspaper, label: 'Recent News', desc: 'Stay updated with their latest funding, products, or shifts.' },
                        { icon: HelpCircle, label: 'Interview Prep', desc: 'Specific questions they usually ask candidates.' }
                    ].map((feature, i) => (
                        <div key={i} className="card p-6 border-slate-100 hover:border-indigo-200 transition-all bg-white/50 backdrop-blur-sm">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">{feature.label}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            ) : isSearching ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                        <Building2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-500" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-slate-900">Scouring Data Sources</h3>
                        <p className="text-slate-500 font-medium animate-pulse">Pulling news, glassdoor reviews, and verified interview patterns...</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="card border-indigo-100 shadow-2xl shadow-indigo-100/50 bg-white overflow-hidden">
                        <div className="bg-slate-900 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500 rounded-lg">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-white font-bold tracking-tight">Intelligence Report: {companyName}</span>
                            </div>
                        </div>
                        <div className="p-8 prose prose-indigo max-w-none">
                            <div className="whitespace-pre-wrap text-slate-700 font-medium leading-relaxed">
                                {insights}
                            </div>
                        </div>
                        <div className="p-6 bg-indigo-50 border-t border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                    <Lightbulb className="w-5 h-5 text-indigo-600" />
                                </div>
                                <p className="text-xs font-bold text-indigo-900">
                                    Pro-Tip: Use these insights to customize your "Why this company?" answer.
                                </p>
                            </div>
                            <button
                                onClick={() => window.print()}
                                className="text-xs font-black uppercase tracking-widest text-indigo-700 hover:text-indigo-900 transition-colors flex items-center gap-2"
                            >
                                Save Report <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
