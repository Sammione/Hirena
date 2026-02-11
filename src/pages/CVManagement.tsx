import React, { useState, useRef } from 'react';
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
    Check
} from 'lucide-react';
import { cn } from '../utils/cn';
import { analyzeCV, CVAnalysis, rewriteBulletPoint, generateCoverLetter } from '../lib/openai';
import { extractTextFromFile } from '../utils/docs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function CVManagement() {
    const [activeTab, setActiveTab] = useState('My CVs');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<CVAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedBullet, setOptimizedBullet] = useState('');
    const [bulletInput, setBulletInput] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [isGeneratingCL, setIsGeneratingCL] = useState(false);

    const analysisRef = useRef<HTMLDivElement>(null);

    const cvVersions = [
        { name: 'Standard Software Engineer', type: 'Local', status: 'Optimized', updatedAt: '2 hours ago', score: 92 },
        { name: 'Remote Frontend Role', type: 'International', status: 'In Review', updatedAt: 'Yesterday', score: 85 },
    ];

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        setError(null);
        try {
            const text = await extractTextFromFile(file);
            const result = await analyzeCV(text);
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
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">{cv.name}</h3>
                                        <p className="text-sm text-slate-500 mb-4 font-medium">{cv.type} Version • Updated {cv.updatedAt}</p>
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
                                            <button className="flex-1 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-all flex items-center justify-center gap-1.5 border border-slate-100">
                                                <Eye className="w-3.5 h-3.5" /> View
                                            </button>
                                            <button className="flex-1 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-all flex items-center justify-center gap-1.5 border border-slate-100">
                                                <Download className="w-3.5 h-3.5" /> PDF
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
                                            setIsGeneratingCL(true);
                                            try {
                                                const cl = await generateCoverLetter("User CV Context", bulletInput);
                                                setCoverLetter(cl);
                                            } catch (err) {
                                                setError('Failed to generate cover letter.');
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
                        </div>
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
                                    {analysisResult.improvements.slice(0, 3).map((imp, i) => (
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
                            {(analysisResult?.skillGaps || ['Docker', 'AWS', 'Kubernetes']).map((gap, i) => (
                                <span key={i} className="px-2.5 py-1.5 bg-white/10 backdrop-blur-md text-[10px] font-black text-white rounded-lg border border-white/10 group-hover:border-brand-emerald-400 transition-colors">
                                    {gap}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-brand-blue-200 mb-6 font-medium leading-relaxed">
                            Our AI detected these high-value skills are missing from your profile compared to global remote roles.
                        </p>
                        <button className="w-full py-3 bg-brand-emerald-500 hover:bg-brand-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-emerald-500/20 active:scale-95">
                            Generate Learning Plan
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                </div>
            </div>
        </div>
        </div >
    );
}
