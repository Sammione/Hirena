import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Filter, ChevronRight, Star, Zap, Loader2, Sparkles, Ghost, Navigation } from 'lucide-react';
import { cn } from '../utils/cn';
import { matchSkillsToJob, optimizeCVForJob } from '../lib/openai';
import { searchJobs, Job } from '../lib/jobs';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';

export default function JobDiscovery() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(false);
    const [isPaginating, setIsPaginating] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All');
    const [matchingJobId, setMatchingJobId] = useState<string | null>(null);
    const [optimizingJobId, setOptimizingJobId] = useState<string | null>(null);
    const [matchResults, setMatchResults] = useState<Record<string, any>>({});
    const [userCV, setUserCV] = useState<string>('');
    const [whatsappEnabled, setWhatsappEnabled] = useState(false);
    const [locationQuery, setLocationQuery] = useState('');
    const lastSearchRef = useRef<string>('');

    useEffect(() => {
        const init = async () => {
            await loadUserCV();

            // Check session cache first
            const cachedJobs = sessionStorage.getItem('hirena_last_jobs');
            const cachedQuery = sessionStorage.getItem('hirena_last_query');
            const cachedLocation = sessionStorage.getItem('hirena_last_location');
            const cachedPage = sessionStorage.getItem('hirena_last_page');

            if (cachedJobs && cachedQuery) {
                setJobs(JSON.parse(cachedJobs));
                setSearchQuery(cachedQuery);
                if (cachedLocation) setLocationQuery(cachedLocation);
                setCurrentPage(Number(cachedPage || 1));
                lastSearchRef.current = cachedQuery;
            } else {
                const { role, location } = await loadUserProfile();
                handleSearch(role || 'React Developer', false, location || '');
            }
        };
        init();
    }, []);

    const loadUserProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { role: null, location: null };

        const { data } = await supabase
            .from('profiles')
            .select('target_role, whatsapp_alerts, location')
            .eq('id', user.id)
            .single();

        if (data?.whatsapp_alerts !== undefined) {
            setWhatsappEnabled(data.whatsapp_alerts);
        }
        if (data?.location) {
            setLocationQuery(data.location);
        }
        if (data?.target_role) {
            setSearchQuery(data.target_role);
            return { role: data.target_role, location: data.location || '' };
        }
        return { role: null, location: data?.location || '' };
    };

    const toggleGhostHunter = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const newVal = !whatsappEnabled;
        setWhatsappEnabled(newVal);
        await supabase
            .from('profiles')
            .update({ whatsapp_alerts: newVal })
            .eq('id', user.id);
    };

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

    const handleSearch = async (queryOverride?: string, isLoadMore = false, locationOverride?: string) => {
        const query = queryOverride || searchQuery;
        const location = locationOverride !== undefined ? locationOverride : locationQuery;
        if (!query) return;

        // If it's a new search, reset everything
        if (!isLoadMore) {
            setIsLoadingJobs(true);
            setCurrentPage(1);
            lastSearchRef.current = query;
        } else {
            setIsPaginating(true);
        }

        try {
            const pageToFetch = isLoadMore ? currentPage + 1 : 1;
            const results = await searchJobs(query, pageToFetch, location);

            const updatedJobs = isLoadMore ? [...jobs, ...results] : results;
            setJobs(updatedJobs);

            if (isLoadMore) {
                setCurrentPage(pageToFetch);
            }

            // Save to session cache
            sessionStorage.setItem('hirena_last_jobs', JSON.stringify(updatedJobs));
            sessionStorage.setItem('hirena_last_query', query);
            sessionStorage.setItem('hirena_last_location', location);
            sessionStorage.setItem('hirena_last_page', (isLoadMore ? pageToFetch : 1).toString());
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoadingJobs(false);
            setIsPaginating(false);
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

    const handleOptimizeCV = async (job: Job) => {
        if (!userCV) {
            alert('Please upload your CV on the CV Management or Profile page first!');
            return;
        }

        setOptimizingJobId(job.id);
        try {
            const jobDescription = `${job.title} at ${job.company}. ${job.description}`;
            const optimizedText = await optimizeCVForJob(userCV, jobDescription);

            // Create PDF
            const doc = new jsPDF();
            const splitText = doc.splitTextToSize(optimizedText, 180);
            doc.setFontSize(11);
            doc.text(splitText, 15, 20);
            doc.save(`Hirena_Optimized_CV_${job.company.replace(/\s+/g, '_')}.pdf`);

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10B981', '#3B82F6']
            });

        } catch (error) {
            console.error('Optimization failed:', error);
            alert('CV Optimization failed. Please try again.');
        } finally {
            setOptimizingJobId(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Job Discovery</h1>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
                        {/* Role Search */}
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-brand-emerald-500/20 transition-all">
                            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Role (e.g. React Developer)..."
                                className="bg-transparent outline-none text-sm font-medium text-slate-700 w-52"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        {/* Location Search */}
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-brand-emerald-500/20 transition-all">
                            <Navigation className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Location (e.g. Lagos, Remote)..."
                                className="bg-transparent outline-none text-sm font-medium text-slate-700 w-52"
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            {locationQuery && (
                                <button
                                    onClick={() => { setLocationQuery(''); handleSearch(undefined, false, ''); }}
                                    className="text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold"
                                    title="Clear location"
                                >✕</button>
                            )}
                        </div>
                        {/* Search Button */}
                        <button
                            onClick={() => handleSearch()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-brand-emerald-600 transition-all shadow-lg shadow-brand-emerald-500/20 active:scale-95"
                        >
                            <Search className="w-4 h-4" />
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
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="card p-6 border-slate-200 animate-pulse">
                                    <div className="flex gap-5">
                                        <div className="w-16 h-16 bg-slate-200 rounded-xl" />
                                        <div className="flex-1 space-y-4">
                                            <div className="h-6 bg-slate-200 rounded w-1/3" />
                                            <div className="h-4 bg-slate-100 rounded w-1/4" />
                                            <div className="h-20 bg-slate-50 rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-slate-500 font-medium">No results found. Try a different search term.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {jobs.map((job) => (
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
                                                <div className="flex flex-wrap gap-2">
                                                    {job.description.split('.').slice(0, 3).map(skillCandidate => {
                                                        const words = skillCandidate.trim().split(' ');
                                                        const word = words[words.length - 1];
                                                        if (word.length > 3 && word.length < 15) {
                                                            return (
                                                                <span key={word} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
                                                                    {word}
                                                                </span>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMatch(job);
                                                        }}
                                                        disabled={matchingJobId === job.id}
                                                        className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                                                    >
                                                        {matchingJobId === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-brand-emerald-500" />}
                                                        Match with AI
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOptimizeCV(job);
                                                        }}
                                                        disabled={optimizingJobId === job.id}
                                                        className="flex items-center gap-2 bg-brand-emerald-50 text-brand-emerald-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-emerald-100 transition-all disabled:opacity-50 border border-brand-emerald-100/50"
                                                    >
                                                        {optimizingJobId === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-brand-emerald-500" />}
                                                        Optimize CV
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/cv', { state: { jobTitle: job.title, jobDetails: job.description } });
                                                        }}
                                                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all font-sans"
                                                    >
                                                        Tailor Letter
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

                            {jobs.length > 0 && (
                                <div className="pt-8 flex justify-center">
                                    <button
                                        onClick={() => handleSearch(undefined, true)}
                                        disabled={isPaginating}
                                        className="flex items-center gap-3 bg-white border-2 border-slate-100 text-slate-600 px-10 py-4 rounded-2xl font-bold hover:border-brand-emerald-500 hover:text-brand-emerald-600 hover:bg-brand-emerald-50/30 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isPaginating ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Loading More Jobs...
                                            </>
                                        ) : (
                                            <>
                                                Explore More Jobs
                                                <ChevronRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className={cn(
                        "card p-6 relative overflow-hidden shadow-2xl transition-all duration-500",
                        whatsappEnabled
                            ? "bg-brand-blue-900 text-white shadow-brand-blue-900/30"
                            : "bg-white border-2 border-dashed border-slate-200"
                    )}>
                        <div className="relative z-10">
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center mb-5",
                                whatsappEnabled ? "bg-white/10" : "bg-slate-100"
                            )}>
                                <Ghost className={cn("w-6 h-6", whatsappEnabled ? "text-brand-emerald-400" : "text-slate-400")} />
                            </div>
                            <h3 className={cn("text-xl font-bold mb-2", !whatsappEnabled && "text-slate-900")}>
                                👻 Ghost Hunter
                            </h3>
                            <p className={cn(
                                "text-sm font-medium leading-relaxed mb-5",
                                whatsappEnabled ? "text-brand-blue-200" : "text-slate-500"
                            )}>
                                {whatsappEnabled
                                    ? "Active! Your AI agent is hunting for high-match jobs 24/7 and will WhatsApp you instantly when it finds one."
                                    : "Activate your AI agent. It hunts for 90%+ match jobs around the clock and sends you a WhatsApp alert — even while you sleep."
                                }
                            </p>
                            <button
                                onClick={toggleGhostHunter}
                                className={cn(
                                    "w-full py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95",
                                    whatsappEnabled
                                        ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                                        : "bg-brand-blue-900 hover:bg-brand-blue-800 text-white shadow-brand-blue-900/20"
                                )}
                            >
                                <Ghost className="w-4 h-4" />
                                {whatsappEnabled ? "Deactivate Hunter" : "Activate Ghost Hunter"}
                            </button>
                        </div>
                        {whatsappEnabled && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        )}
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
