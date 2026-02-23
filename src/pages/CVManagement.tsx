import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    FileText,
    Upload,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Download,
    Eye,
    Plus,
    Zap,
    Loader2,
    Sparkles,
    Check,
    ChevronRight,
    Play,
    Trash2
} from 'lucide-react';
import { cn } from '../utils/cn';
import {
    analyzeCV,
    CVAnalysis,
    rewriteBulletPoint,
    generateCoverLetter,
    createCareerRoadmap,
    CareerRoadmap
} from '../lib/openai';
import { extractTextFromFile } from '../utils/docs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function CVManagement() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('My CVs');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<CVAnalysis | null>(null);
    const [learningPlan, setLearningPlan] = useState<CareerRoadmap | null>(null);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateLearningPlan = async () => {
        if (!analysisResult?.skillGaps?.length) {
            alert("No skill gaps detected to generate a plan for!");
            return;
        }

        setIsGeneratingPlan(true);
        try {
            const plan = await createCareerRoadmap(
                `Bridge the core skill gaps: ${analysisResult.skillGaps.join(', ')}`,
                []
            );
            setLearningPlan(plan);
            // Scroll to the roadmap section
            setTimeout(() => {
                const roadmapEl = document.getElementById('learning-roadmap');
                roadmapEl?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (err) {
            console.error('Plan generation failed:', err);
            setError('Failed to generate learning plan.');
        } finally {
            setIsGeneratingPlan(false);
        }
    };
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedBullet, setOptimizedBullet] = useState('');
    const [bulletInput, setBulletInput] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [isGeneratingCL, setIsGeneratingCL] = useState(false);

    useEffect(() => {
        if (location.state?.jobDetails) {
            setBulletInput(location.state.jobDetails);
            setActiveTab('Expert Tools');
        }
    }, [location.state]);

    const analysisRef = useRef<HTMLDivElement>(null);

    const [cvVersions, setCvVersions] = useState<any[]>([]);

    useEffect(() => {
        fetchCVs();
    }, []);

    const fetchCVs = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase.from('cv_analyses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching CVs:', error);
        } else {
            setCvVersions(data || []);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        setError(null);
        try {
            const text = await extractTextFromFile(file);
            const result = await analyzeCV(text);

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error: saveError } = await supabase.from('cv_analyses').insert({
                    user_id: user.id,
                    cv_text: text,
                    score: result.score,
                    readiness_score: result.readinessScore,
                    sections: result.sections,
                    strengths: result.strengths,
                    improvements: result.improvements,
                    skill_gaps: result.skillGaps
                });

                if (saveError) throw saveError;
                fetchCVs(); // Refresh the list
            }

            setAnalysisResult(result);
        } catch (err: any) {
            console.error('Analysis failed:', err);
            setError(err.message || 'Failed to analyze CV. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleOptimizeBullet = async () => {
        if (!bulletInput.trim()) return;
        setIsOptimizing(true);
        try {
            const optimized = await rewriteBulletPoint(bulletInput);
            setOptimizedBullet(optimized);
        } catch (err) {
            setError('Failed to optimize bullet point.');
        } finally {
            setIsOptimizing(false);
        }
    };

    const downloadFullReport = async () => {
        if (!analysisRef.current) return;
        const canvas = await html2canvas(analysisRef.current);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('Hirena-CV-Analysis.pdf');
    };

    const handleSelectCV = (cv: any) => {
        setLearningPlan(null); // Clear previous plan
        setAnalysisResult({
            score: cv.score,
            readinessScore: cv.readiness_score,
            sections: cv.sections,
            strengths: cv.strengths,
            improvements: cv.improvements,
            skillGaps: cv.skill_gaps
        });
        // Scroll to analysis if on mobile
        if (window.innerWidth < 1024) {
            analysisRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleDownloadCV = (cv: any) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text('Hirena CV Intelligence Report', 20, 20);
        doc.setFontSize(12);
        doc.text(`Date: ${new Date(cv.created_at).toLocaleDateString()}`, 20, 30);
        doc.text(`ATS Score: ${cv.score}%`, 20, 40);
        doc.text(`Readiness Score: ${cv.readiness_score}%`, 20, 50);

        doc.setFontSize(16);
        doc.text('Top Improvements:', 20, 70);
        doc.setFontSize(10);
        const improvements = cv.improvements?.slice(0, 10).join('\n\n• ') || 'None';
        const splitImprovements = doc.splitTextToSize('• ' + improvements, 170);
        doc.text(splitImprovements, 20, 80);

        doc.addPage();
        doc.setFontSize(16);
        doc.text('Original CV Text:', 20, 20);
        doc.setFontSize(8);
        const splitText = doc.splitTextToSize(cv.cv_text || '', 180);
        doc.text(splitText, 15, 30);

        doc.save(`Hirena_Analysis_${new Date(cv.created_at).getTime()}.pdf`);
    };

    const handleDeleteCV = async (cvId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const isConfirmed = window.confirm("Are you sure you want to delete this CV analysis? This action cannot be undone.");
        if (!isConfirmed) return;

        try {
            const { error } = await supabase
                .from('cv_analyses')
                .delete()
                .eq('id', cvId)
                .eq('user_id', user.id);

            if (error) throw error;

            // Update UI
            setCvVersions(prev => prev.filter(cv => cv.id !== cvId));

            // Clear current analysis if it was the one deleted
            // Since we don't store the ID in analysisResult, we'll just keep it or the user can select another.
            // If the list becomes empty, clear it.
            if (cvVersions.length <= 1) {
                setAnalysisResult(null);
                setLearningPlan(null);
            }

        } catch (err: any) {
            console.error('Delete failed:', err);
            setError(err.message || 'Failed to delete CV analysis.');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">CV Management</h1>
                    <p className="text-slate-500">Optimize your resume for local and global opportunities.</p>
                </div>
                <div className="flex gap-3">
                    <label className="bg-brand-emerald-500 hover:bg-brand-emerald-600 text-white flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-brand-emerald-500/20 cursor-pointer transition-all hover:scale-105 active:scale-95 font-bold">
                        <Plus className="w-5 h-5" /> Import & Analyze CV
                        <input type="file" className="hidden" accept=".pdf,.docx,.doc,.txt" onChange={handleFileUpload} />
                    </label>
                </div>
            </header>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex border-b border-slate-200">
                        {['My CVs', 'Expert Tools', 'Templates'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-6 py-3 text-sm font-bold border-b-2 transition-all",
                                    activeTab === tab
                                        ? "border-brand-emerald-500 text-brand-emerald-600"
                                        : "border-transparent text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'My CVs' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-300">
                            {cvVersions.map((cv, i) => (
                                <div key={i} className="card p-6 flex flex-col justify-between group cursor-pointer hover:border-brand-emerald-300 transition-all border-slate-200">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-brand-blue-900 group-hover:bg-brand-emerald-500 group-hover:text-white transition-all">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded",
                                                cv.status === 'Optimized' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                                            )}>
                                                {cv.status}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">CV Analysis #{cvVersions.length - i}</h3>
                                        <p className="text-sm text-slate-500 mb-4 font-medium">Auto-saved Version • {new Date(cv.created_at).toLocaleDateString()}</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">ATS Score</span>
                                            <span className="text-brand-emerald-600 font-black">{cv.score}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-brand-emerald-500 transition-all duration-1000" style={{ width: `${cv.score}%` }}></div>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectCV(cv);
                                                }}
                                                className="flex-1 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-all flex items-center justify-center gap-1.5 border border-slate-100"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> View
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownloadCV(cv);
                                                }}
                                                className="flex-1 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-all flex items-center justify-center gap-1.5 border border-slate-100"
                                            >
                                                <Download className="w-3.5 h-3.5" /> PDF
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCV(cv.id);
                                                }}
                                                className="px-3 py-2.5 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-bold text-red-600 transition-all flex items-center justify-center gap-1.5 border border-red-100"
                                                title="Delete Analysis"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isAnalyzing ? (
                                <div className="card p-6 border-brand-emerald-200 bg-brand-emerald-50/30 flex flex-col items-center justify-center text-center py-12">
                                    <div className="relative">
                                        <Loader2 className="w-12 h-12 text-brand-emerald-500 animate-spin mb-4" />
                                        <Sparkles className="w-5 h-5 text-brand-emerald-400 absolute top-0 right-0 animate-bounce" />
                                    </div>
                                    <p className="font-bold text-slate-900">AI Recruiter Scanning...</p>
                                    <p className="text-xs text-slate-500 mt-2 font-medium">Checking for 150+ international ATS keywords.</p>
                                </div>
                            ) : (
                                <label className="card p-6 border-dashed border-2 border-slate-300 flex flex-col items-center justify-center text-center py-12 hover:bg-white hover:border-brand-emerald-500 transition-all cursor-pointer group relative bg-slate-50/50">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-emerald-500 group-hover:text-white group-hover:scale-110 transition-all mb-4 shadow-sm">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="font-black text-slate-900 uppercase text-xs tracking-widest">Import CV</p>
                                    <p className="text-xs text-slate-500 mt-2 font-medium max-w-[180px]">Drop PDF or DOCX to unlock AI insights.</p>
                                    <input type="file" className="hidden" accept=".pdf,.docx,.doc,.txt" onChange={handleFileUpload} />
                                </label>
                            )}
                        </div>
                    )}

                    {activeTab === 'Expert Tools' && (
                        <>
                            <div className="card p-8 border-slate-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-brand-blue-50 rounded-2xl">
                                        <Zap className="w-6 h-6 text-brand-blue-900" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">AI Bullet Optimizer</h3>
                                        <p className="text-sm text-slate-500 font-medium">Turn boring sentences into high-impact accomplishments.</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <textarea
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-blue-500/20 focus:border-brand-blue-500 outline-none min-h-[100px] text-slate-700 font-medium transition-all"
                                        placeholder="e.g. I was responsible for fixing bugs and managing the server..."
                                        value={bulletInput}
                                        onChange={(e) => setBulletInput(e.target.value)}
                                    />
                                    <button
                                        onClick={handleOptimizeBullet}
                                        disabled={isOptimizing || !bulletInput}
                                        className="bg-brand-blue-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-blue-800 transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                        Optimize Point
                                    </button>

                                    {optimizedBullet && (
                                        <div className="mt-6 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl relative group animate-in slide-in-from-top-2">
                                            <div className="flex items-center gap-2 mb-3 text-emerald-600">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">AI Optimized Version</span>
                                            </div>
                                            <p className="text-slate-800 font-bold leading-relaxed pr-8">{optimizedBullet}</p>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(optimizedBullet);
                                                }}
                                                className="absolute top-6 right-6 p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all"
                                                title="Copy to clipboard"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="card p-8 border-slate-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-brand-emerald-50 rounded-2xl">
                                        <FileText className="w-6 h-6 text-brand-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">AI Cover Letter Generator</h3>
                                        <p className="text-sm text-slate-500 font-medium">Create a tailored cover letter in seconds.</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <textarea
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-emerald-500/20 focus:border-brand-emerald-500 outline-none min-h-[120px] text-slate-700 font-medium transition-all"
                                        placeholder="Paste the job requirements or role description here..."
                                        onChange={(e) => setBulletInput(e.target.value)} // Re-using state for demo or create new if needed
                                    />
                                    <button
                                        onClick={async () => {
                                            if (!bulletInput) return;
                                            setIsGeneratingCL(true);
                                            setError(null);
                                            try {
                                                const { data: { user } } = await supabase.auth.getUser();
                                                let cvToUse = "User looking for a role.";

                                                if (user) {
                                                    const { data } = await supabase
                                                        .from('cv_analyses')
                                                        .select('cv_text')
                                                        .eq('user_id', user.id)
                                                        .order('created_at', { ascending: false })
                                                        .limit(1)
                                                        .single();

                                                    if (data) cvToUse = data.cv_text;
                                                }

                                                const cl = await generateCoverLetter(cvToUse, bulletInput);
                                                setCoverLetter(cl);
                                            } catch (err: any) {
                                                console.error('CL generation failed:', err);
                                                setError(err.message || 'Failed to generate cover letter.');
                                            } finally {
                                                setIsGeneratingCL(false);
                                            }
                                        }}
                                        disabled={isGeneratingCL || !bulletInput}
                                        className="bg-brand-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-emerald-600 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-brand-emerald-500/20"
                                    >
                                        {isGeneratingCL ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                        Generate Tailored Letter
                                    </button>

                                    {coverLetter && (
                                        <div className="mt-6 p-8 bg-slate-50 border border-slate-200 rounded-2xl relative animate-in slide-in-from-bottom-2">
                                            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-4">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generated Letter</span>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(coverLetter)}
                                                    className="text-xs font-bold text-brand-emerald-600 hover:text-brand-emerald-700 flex items-center gap-1"
                                                >
                                                    <Check className="w-3 h-3" /> Copy Text
                                                </button>
                                            </div>
                                            <div className="prose prose-sm max-w-none">
                                                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed font-bold">{coverLetter}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="space-y-6">
                    <div ref={analysisRef} className="card p-6 border-slate-200 shadow-xl shadow-slate-900/5 bg-white relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-emerald-50 rounded-xl">
                                    <Zap className="w-5 h-5 text-brand-emerald-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">AI Feedback</h3>
                            </div>
                            {analysisResult && (
                                <button onClick={downloadFullReport} className="p-2 text-slate-400 hover:text-brand-emerald-500 transition-all" title="Download Audit Report">
                                    <Download className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-6">
                            {analysisResult ? (
                                <>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl text-center border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ATS Score</p>
                                            <p className="text-3xl font-black text-brand-emerald-600">{analysisResult.score}%</p>
                                        </div>
                                        <div className="p-4 bg-brand-blue-900 rounded-2xl text-center">
                                            <p className="text-[10px] font-black text-brand-blue-200 uppercase tracking-widest mb-2">Readiness</p>
                                            <p className="text-3xl font-black text-white">{analysisResult.readinessScore}%</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Analysis Breakdown</h4>
                                        <div className="space-y-3">
                                            {Object.entries(analysisResult.sections || {}).map(([key, data]: [string, any]) => (
                                                <div key={key} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <span className="text-xs font-bold text-slate-700 capitalize">{key}</span>
                                                        <span className="text-[10px] font-black text-brand-emerald-600">{data.score}%</span>
                                                    </div>
                                                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-2">
                                                        <div className="h-full bg-brand-emerald-500" style={{ width: `${data.score}%` }}></div>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">"{data.feedback}"</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Improvements</h4>
                                        {analysisResult.improvements.slice(0, 3).map((imp: any, i: number) => (
                                            <div key={i} className="flex gap-3 items-start">
                                                <div className="p-1 bg-emerald-50 rounded-md mt-0.5">
                                                    <Sparkles className="w-3 h-3 text-emerald-600" />
                                                </div>
                                                <p className="text-xs text-slate-600 font-bold leading-relaxed">{imp}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                                        <FileText className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <h4 className="text-slate-900 font-bold mb-2">No Analysis Active</h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        Upload your CV to see a detailed audit of your impact, presentation, and industry keywords.
                                    </p>
                                </div>
                            )}
                        </div>
                        {/* Background Decor */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-emerald-500/5 rounded-full blur-3xl"></div>
                    </div>

                    <div className="card p-6 bg-brand-blue-900 text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-sm font-black uppercase tracking-widest mb-4 text-brand-emerald-400">Skill Gaps</h4>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {analysisResult?.skillGaps && analysisResult.skillGaps.length > 0 ? (
                                    analysisResult.skillGaps.map((gap: any, i: number) => (
                                        <span key={i} className="px-2.5 py-1.5 bg-white/10 backdrop-blur-md text-[10px] font-black text-white rounded-lg border border-white/10 group-hover:border-brand-emerald-400 transition-colors">
                                            {gap}
                                        </span>
                                    ))
                                ) : analysisResult ? (
                                    <span className="text-xs text-brand-emerald-400 font-bold italic">No gaps detected! You're ready.</span>
                                ) : (
                                    ['Docker', 'AWS', 'Kubernetes'].map((gap: any, i: number) => (
                                        <span key={i} className="px-2.5 py-1.5 bg-white/10 backdrop-blur-md text-[10px] font-black text-white/30 rounded-lg border border-white/5">
                                            {gap}
                                        </span>
                                    ))
                                )}
                            </div>
                            <p className="text-xs text-brand-blue-200 mb-6 font-medium leading-relaxed">
                                {analysisResult?.skillGaps?.length
                                    ? `Our AI detected these ${analysisResult.skillGaps.length} skills are missing compared to roles in ${analysisResult.sections?.keywords?.score < 50 ? 'global tech' : 'top companies'}.`
                                    : "Upload your CV to identify high-value skills missing from your profile."
                                }
                            </p>
                            <button
                                onClick={handleGenerateLearningPlan}
                                disabled={isGeneratingPlan || !analysisResult?.skillGaps?.length}
                                className="w-full py-3 bg-brand-emerald-500 hover:bg-brand-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                            >
                                {isGeneratingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                {isGeneratingPlan ? "Building Your Path..." : "Generate Learning Plan"}
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    </div>

                    {learningPlan && (
                        <div id="learning-roadmap" className="card p-6 bg-white border-2 border-brand-emerald-500/20 shadow-xl animate-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-brand-emerald-50 rounded-xl">
                                    <Sparkles className="w-5 h-5 text-brand-emerald-500" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900">Your Learning Roadmap</h3>
                            </div>

                            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                {learningPlan.milestones.map((ms, idx) => (
                                    <div key={idx} className="relative pl-10">
                                        <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-brand-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-brand-emerald-500/20 border-4 border-white z-10">
                                            {idx + 1}
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-brand-emerald-300 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-900 text-sm leading-tight">{ms.title}</h4>
                                                <span className="text-[10px] font-black text-brand-emerald-600 bg-brand-emerald-50 px-2 py-0.5 rounded uppercase">{ms.estimatedDuration}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mb-3 leading-relaxed">{ms.description}</p>

                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {ms.skillsToLearn.map(skill => (
                                                    <span key={skill} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded uppercase">{skill}</span>
                                                ))}
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Top Resources</p>
                                                {ms.resources.map((res, ridx) => (
                                                    <a
                                                        key={ridx}
                                                        href={res.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-brand-emerald-500 group/link transition-all"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-1.5 bg-slate-50 rounded-lg group-hover/link:bg-brand-emerald-50 transition-all">
                                                                <Play className="w-3 h-3 text-slate-400 group-hover/link:text-brand-emerald-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-700 group-hover/link:text-brand-emerald-700">{res.title}</p>
                                                                <p className="text-[9px] font-medium text-slate-400">{res.platform}</p>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover/link:text-brand-emerald-500 transition-all" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-4 bg-brand-blue-900/5 rounded-2xl border border-brand-blue-900/10">
                                <p className="text-[10px] font-bold text-brand-blue-900 uppercase tracking-widest mb-2">Expert Advice</p>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                                    "{learningPlan.summary}"
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
