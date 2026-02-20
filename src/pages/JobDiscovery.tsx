import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Filter, ChevronRight, Star, Zap, Loader2, Sparkles } from 'lucide-react';
import { mockJobs } from '../data/mockData';
import { cn } from '../utils/cn';
import { matchSkillsToJob } from '../lib/openai';
import { searchJobs, Job } from '../lib/jobs';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export default function JobDiscovery() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(false);
    const [searchQuery, setSearchQuery] = useState('React Developer');
    const [filter, setFilter] = useState('All');
    const [matchingJobId, setMatchingJobId] = useState<string | null>(null);
    const [matchResults, setMatchResults] = useState<Record<string, any>>({});
    const [userCV, setUserCV] = useState<string>('');

    useEffect(() => {
        loadUserCV();
        handleSearch();
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

        if (data) {
            setUserCV(data.cv_text);
        }
    };

    const handleSearch = async () => {
        setIsLoadingJobs(true);
        try {
            const results = await searchJobs(searchQuery);
            setJobs(results);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoadingJobs(false);
        }
    };

    const handleMatch = async (job: Job) => {
        setMatchingJobId(job.id);
        try {
            const cvText = userCV || "Expert Developer looking for new opportunities.";
            const jobDescription = `${job.title} at ${job.company}. ${job.description}`;

            const result = await matchSkillsToJob(cvText, jobDescription);
            setMatchResults(prev => ({ ...prev, [job.id]: result }));

            // Trigger confetti if high match
            if (result.match_percentage > 80) {
                const end = Date.now() + 1000;
                const colors = ['#10B981', '#ffffff'];

                (function frame() {
                    confetti({
                        particleCount: 2,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: colors
                    });
                    confetti({
                        particleCount: 2,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: colors
                    });

                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                }());
            }

        } catch (error) {
            console.error('Matching failed:', error);
        } finally {
            setMatchingJobId(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Job Discovery</h1>
                    <div className="flex items-center gap-2 mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-brand-emerald-500/20 transition-all">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search roles (e.g. React Developer)..."
                            className="bg-transparent outline-none text-sm font-medium text-slate-700 w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            onClick={handleSearch}
                            className="text-xs font-bold text-brand-emerald-600 hover:text-brand-emerald-700 ml-2"
                        >
                            Search
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all font-medium text-slate-700">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
                        {['All', 'Remote', 'On-site', 'Hybrid'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                    filter === f ? "bg-brand-emerald-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {isLoadingJobs ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <Loader2 className="w-10 h-10 text-brand-emerald-500 animate-spin mb-4" />
                            <p className="text-slate-500 font-bold">Fetching live jobs for you...</p>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-slate-500 font-medium">No results found. Try a different search term.</p>
                        </div>
                    ) : jobs.map((job) => (
                        <div key={job.id} onClick={() => window.open(job.url, '_blank')} className="card p-6 border-slate-200 hover:border-brand-emerald-300 hover:shadow-xl hover:shadow-brand-emerald-500/5 transition-all group overflow-hidden relative cursor-pointer">
                            {matchResults[job.id] && (
                                <div className="absolute top-0 right-0 px-4 py-1 bg-brand-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl shadow-sm">
                                    AI Verified
                                </div>
                            )}

                            <div className="flex gap-5">
                                <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                                    <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-emerald-600 transition-colors">{job.title}</h3>
                                            <p className="text-slate-500 font-medium">{job.company}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className={cn(
                                                "px-3 py-1 rounded-full text-xs font-black inline-block",
                                                matchResults[job.id] ? "bg-brand-emerald-500 text-white" : "bg-brand-emerald-50 text-brand-emerald-700"
                                            )}>
                                                {matchResults[job.id]?.match_percentage || '??'}% Match
                                            </div>
                                            <p className="text-sm font-bold text-slate-900 mt-2">{job.salary}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" /> {job.location}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Briefcase className="w-4 h-4" /> {job.type}
                                        </div>
                                        <div className="ml-auto text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            Posted {job.posted}
                                        </div>
                                    </div>

                                    {matchResults[job.id] && (
                                        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-in slide-in-from-top-2">
                                            <div className="flex items-center gap-2 mb-3 text-brand-emerald-600">
                                                <Sparkles className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-widest">AI Matching Analysis</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-bold text-emerald-600 uppercase mb-2">Matching Skills</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {matchResults[job.id].matching_skills?.map((s: string) => (
                                                            <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-brand-blue-900 uppercase mb-2">Missing Skills</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {matchResults[job.id].missing_skills?.map((s: string) => (
                                                            <span key={s} className="px-2 py-0.5 bg-brand-blue-50 text-brand-blue-900 text-[10px] font-bold rounded">
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between pt-6 border-t border-slate-50 gap-4">
                                        <div className="flex gap-2">
                                            {['React', 'TypeScript', 'Node.js'].map(skill => (
                                                <span key={skill} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMatch(job);
                                                }}
                                                disabled={matchingJobId === job.id}
                                                className="flex items-center gap-2 bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                                            >
                                                {matchingJobId === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-brand-emerald-500" />}
                                                Match with AI
                                            </button>
                                            <button
                                                onClick={() => navigate('/cv')}
                                                className="flex items-center gap-2 bg-white border border-brand-emerald-500 text-brand-emerald-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-emerald-50 transition-all"
                                            >
                                                Tailor CV
                                            </button>
                                            <button className="flex items-center gap-2 bg-brand-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-blue-800 transition-all shadow-lg shadow-brand-blue-900/10">
                                                Apply Now <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="card p-6 bg-brand-blue-900 text-white relative overflow-hidden shadow-2xl shadow-brand-blue-900/20">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                                <Star className="w-6 h-6 text-brand-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">AI Insights</h3>
                            <p className="text-brand-blue-200 text-sm font-medium leading-relaxed mb-6">
                                Based on your current skill set, we estimate a 25% increase in match probability if you learn <b>Amazon S3</b>.
                            </p>
                            <button className="w-full py-3 bg-brand-emerald-500 hover:bg-brand-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]">
                                Improve Match Score
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    </div>

                    <div className="card p-6 border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Saved Searches</h3>
                        <div className="space-y-4">
                            {['Frontend Lagos', 'Remote Product Design', 'Data Entry Kenya'].map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:border-brand-emerald-300 hover:bg-white transition-all group">
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-brand-blue-900 transition-colors">{s}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-emerald-500 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
