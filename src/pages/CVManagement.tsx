import React, { useState } from 'react';
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
    Loader2
} from 'lucide-react';
import { cn } from '../utils/cn';
import { analyzeCV, CVAnalysis } from '../lib/openai';
import { extractTextFromPDF } from '../utils/pdf';

export default function CVManagement() {
    const [activeTab, setActiveTab] = useState('My CVs');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<CVAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);

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
            let text = '';
            if (file.type === 'application/pdf') {
                text = await extractTextFromPDF(file);
            } else if (file.type === 'text/plain') {
                text = await file.text();
            } else {
                throw new Error('Unsupported file type. Please upload a PDF or TXT file.');
            }

            const result = await analyzeCV(text);
            setAnalysisResult(result);
        } catch (err: any) {
            console.error('Analysis failed:', err);
            setError(err.message || 'Failed to analyze CV. Please try again.');
        } finally {
            setIsAnalyzing(false);
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
                    <label className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-brand-emerald-500/20 cursor-pointer transition-all hover:scale-105 active:scale-95">
                        <Plus className="w-5 h-5" /> Import & Analyze CV
                        <input type="file" className="hidden" accept=".pdf,.txt" onChange={handleFileUpload} />
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
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex border-b border-slate-200">
                        {['My CVs', 'Templates', 'Analytics'].map((tab) => (
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cvVersions.map((cv, i) => (
                            <div key={i} className="card p-6 flex flex-col justify-between group cursor-pointer hover:border-brand-emerald-300 transition-all">
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
                                    <p className="text-sm text-slate-500 mb-4">{cv.type} Version • Updated {cv.updatedAt}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 font-medium">ATS Score</span>
                                        <span className="text-brand-emerald-600 font-bold">{cv.score}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-emerald-500" style={{ width: `${cv.score}%` }}></div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <button className="flex-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-md text-xs font-bold text-slate-600 transition-all flex items-center justify-center gap-1.5">
                                            <Eye className="w-3 h-3" /> View
                                        </button>
                                        <button className="flex-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-md text-xs font-bold text-slate-600 transition-all flex items-center justify-center gap-1.5">
                                            <Download className="w-3 h-3" /> PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isAnalyzing ? (
                            <div className="card p-6 border-brand-emerald-200 bg-brand-emerald-50/30 flex flex-col items-center justify-center text-center py-12 animate-pulse">
                                <Loader2 className="w-10 h-10 text-brand-emerald-500 animate-spin mb-4" />
                                <p className="font-bold text-slate-900">Analyzing CV...</p>
                                <p className="text-xs text-slate-500 mt-1">Our AI is scanning for optimizations.</p>
                            </div>
                        ) : (
                            <label className="card p-6 border-dashed border-2 flex flex-col items-center justify-center text-center py-12 hover:bg-slate-50 transition-all cursor-pointer group relative">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-emerald-50 group-hover:text-brand-emerald-500 transition-all mb-4">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <p className="font-bold text-slate-900">Import CV</p>
                                <p className="text-xs text-slate-500 mt-1 max-w-[150px]">Upload DOCX or PDF and let AI optimize it.</p>
                                <input type="file" className="hidden" accept=".pdf,.txt" onChange={handleFileUpload} />
                            </label>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card p-6 border-brand-blue-900 shadow-xl shadow-brand-blue-900/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-brand-emerald-50 rounded-lg">
                                <Zap className="w-5 h-5 text-brand-emerald-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">AI Optimization</h3>
                        </div>

                        <div className="space-y-5">
                            {analysisResult ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="p-3 bg-slate-50 rounded-xl text-center">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">ATS Score</p>
                                            <p className="text-2xl font-black text-brand-emerald-600">{analysisResult.score}%</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl text-center">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Readiness</p>
                                            <p className="text-2xl font-black text-brand-blue-900">{analysisResult.readinessScore}%</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Key Suggestions</h4>
                                        {analysisResult.improvements.slice(0, 3).map((improvement, i) => (
                                            <div key={i} className="flex gap-3">
                                                <div className="flex-shrink-0 mt-1">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                                    {improvement}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            Quantify your impact in your last role (e.g., "Increased sales by 20%").
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <AlertCircle className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            Add "Kubernetes" as your skill match is high for recent job saves.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            disabled={!analysisResult}
                            className={cn(
                                "w-full mt-8 btn-primary py-4 rounded-xl flex items-center justify-center gap-2",
                                !analysisResult && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {analysisResult ? "Apply All AI Fixes" : "Upload CV to Optimize"} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="card p-6 bg-slate-50">
                        <h4 className="text-sm font-bold text-slate-900 mb-4">Skill Gaps Identified</h4>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {(analysisResult?.skillGaps || ['Docker', 'AWS', 'Soft Skills']).map((gap, i) => (
                                <span key={i} className="px-2 py-1 bg-white border border-slate-200 text-[10px] font-bold text-slate-600 rounded">
                                    {gap}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                            These priority skills are missing from your CV but are high in demand for your target roles.
                        </p>
                        <button className="w-full text-sm font-bold text-brand-blue-900 hover:text-brand-blue-700 transition-all py-2 border border-brand-blue-900/20 rounded-lg">
                            Create Learning Path
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
