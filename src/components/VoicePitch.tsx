import React, { useState, useRef, useEffect } from 'react';
import { Mic, Pause, Play, Square, Loader2, Sparkles, AudioWaveform } from 'lucide-react';
import { cn } from '../utils/cn';

export function VoicePitch() {
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timerRef = useRef<number | null>(null);

    // Simulated waveform animation
    useEffect(() => {
        if (!isRecording || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        let animationFrame: number;
        const bars = 30;
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#10B981'; // Emerald 500
            const barWidth = width / bars;

            for (let i = 0; i < bars; i++) {
                const barHeight = Math.random() * height * 0.8;
                const x = i * barWidth;
                const y = (height - barHeight) / 2;
                ctx.fillRect(x, y, barWidth - 2, barHeight);
            }
            animationFrame = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationFrame);
    }, [isRecording]);

    const handleRecord = () => {
        if (isRecording) {
            clearInterval(timerRef.current!);
            setIsRecording(false);
            setRecordedUrl('mock-url'); // Simulate saved recording
        } else {
            setIsRecording(true);
            setDuration(0);
            timerRef.current = window.setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="card p-6 bg-slate-900 text-white relative overflow-hidden group">
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">

                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                    <Mic className={cn("w-8 h-8 text-brand-emerald-400 transition-all", isRecording && "animate-pulse text-red-400")} />
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold">Elevator Pitch</h3>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto">
                        Record a 60-second intro for recruiters. {isRecording ? "Recording..." : "Stand out with your voice."}
                    </p>
                </div>

                {isRecording ? (
                    <div className="w-full h-16 bg-slate-800 rounded-xl overflow-hidden relative">
                        <canvas ref={canvasRef} width={300} height={64} className="w-full h-full opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-red-400 font-mono font-bold animate-pulse">{formatTime(duration)}</span>
                        </div>
                    </div>
                ) : recordedUrl ? (
                    <div className="w-full bg-slate-800 p-4 rounded-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
                        <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 bg-brand-emerald-500 rounded-lg hover:bg-brand-emerald-600 transition-all">
                            {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                        </button>
                        <div className="h-1 bg-slate-700 rounded-full flex-1 overflow-hidden">
                            <div className="h-full bg-brand-emerald-500 w-1/3 animate-pulse"></div>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{formatTime(duration || 45)}</span>
                    </div>
                ) : (
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-0 transition-all duration-300"></div>
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        onClick={handleRecord}
                        className={cn(
                            "px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95",
                            isRecording
                                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/50"
                                : "bg-brand-emerald-500 text-white hover:bg-brand-emerald-600 shadow-brand-emerald-500/20"
                        )}
                    >
                        {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
                        {isRecording ? "Stop Recording" : recordedUrl ? "Re-record Pitch" : "Start Recording"}
                    </button>
                </div>
            </div>

            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-emerald-500/20 transition-all duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 group-hover:bg-purple-500/20 transition-all duration-1000"></div>
        </div>
    );
}
