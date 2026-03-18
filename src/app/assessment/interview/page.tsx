"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, MicOff, Video, VideoOff, PhoneOff, Sparkles, User as UserIcon, Send, Type, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function InterviewPage() {
    const [context, setContext] = useState<any>(null);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // AI & Interview State
    const [hasStarted, setHasStarted] = useState(false);
    const [messages, setMessages] = useState<{sender: string, text: string}[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentDifficulty, setCurrentDifficulty] = useState(5); // Start at standard mid-level
    const [aiState, setAiState] = useState<"initializing" | "thinking" | "speaking" | "listening" | "finished">("initializing");
    const [isEvaluating, setIsEvaluating] = useState(false);

    // Dictation State
    const [transcript, setTranscript] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const isRecordingRef = useRef(false);
    
    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        // Load context from previous step
        const savedContext = sessionStorage.getItem("interviewContext");
        if (savedContext) {
            setContext(JSON.parse(savedContext));
        } else {
            // Unlikely, but fallback if direct navigated
            window.location.href = "/assessment";
        }
    }, []);

    // Re-bind video stream safely during rapid re-renders
    useEffect(() => {
        if (videoRef.current && stream && isVideoOn) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, isVideoOn, aiState, hasStarted]);

    useEffect(() => {
        // Initialize Webcam
        const initWebcam = async () => {
            try {
                const userStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                setStream(userStream);
                streamRef.current = userStream;
            } catch (err: any) {
                console.warn("Media device warning (both):", err);
                
                // Fallback attempt: Try just audio if camera is locked/missing
                try {
                    const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    toast.success("Accessed microphone successfully, but camera is unavailable/locked.");
                    setStream(audioOnlyStream);
                    streamRef.current = audioOnlyStream;
                } catch (audioErr: any) {
                    console.warn("Audio fallback failed:", audioErr);
                    
                    if (err.name === 'NotFoundError' || err.message.includes('Requested device not found')) {
                        toast.error("Browser cannot find your camera or mic. Check Windows Privacy settings or close other apps.");
                    } else if (err.name === 'NotAllowedError') {
                        toast.error("Camera/Mic access was denied by your browser permissions.");
                    } else if (err.name === 'NotReadableError') {
                        toast.error("Camera/Mic is currently being used by another application (like Zoom/Teams).");
                    } else {
                        toast.error("Could not access camera/microphone. Please check permissions.");
                    }
                }
            }
        };

        if (isVideoOn) {
            initWebcam();
        }

        // Initialize Speech Synthesis
        if (typeof window !== "undefined") {
            synthRef.current = window.speechSynthesis;
        }

        if (typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        currentTranscript += event.results[i][0].transcript + ' ';
                    }
                }
                
                if (currentTranscript.trim().length > 0) {
                     setTranscript(prev => {
                         const prefix = prev.trim().length > 0 ? prev.trim() + " " : "";
                         return prefix + currentTranscript.trim();
                     });
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                if (event.error !== 'no-speech') {
                    console.warn("Speech recognition info:", event.error);
                }
                if (event.error === 'not-allowed') {
                    toast.error("Microphone permission denied.");
                    setIsRecording(false);
                    isRecordingRef.current = false;
                }
            };

            recognitionRef.current.onend = () => {
                // Keep trying to record if they haven't explicitly stopped it
                if (isRecordingRef.current) {
                    try { recognitionRef.current.start(); } catch (e) { }
                }
            };
        }

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (synthRef.current) {
                synthRef.current.cancel();
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, transcript]);

    const startInterview = () => {
        setHasStarted(true);
        if (synthRef.current) {
            // Wake up speech synthesis manually on user click to get around browser blocks
            synthRef.current.speak(new SpeechSynthesisUtterance(""));
        }
        fetchNextQuestion();
    };

    const fetchNextQuestion = async () => {
        setAiState("thinking");
        try {
            const res = await fetch("/api/interview/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    context,
                    history,
                    currentQuestionIndex,
                    currentDifficulty
                })
            });
            const data = await res.json();
            
            if (!res.ok) {
                // If user is not logged in, auth fails, etc.
                throw new Error(data.error || "Failed to generate question.");
            }

            if (data.isFinished) {
                submitInterview();
                return;
            }

            if (data.newDifficulty !== undefined) {
                 setCurrentDifficulty(data.newDifficulty);
            }

            setCurrentQuestion(data.question);
            setMessages(prev => [...prev, { sender: 'Aura.ai', text: data.question }]);
            speakQuestion(data.question);

        } catch (error: any) {
            console.error("Error fetching question", error);
            toast.error(error.message || "Failed to generate the next question.");
            setAiState("listening"); // fail gracefully
        }
    };

    const speakQuestion = (text: string) => {
        if (!synthRef.current) {
            setAiState("listening"); // fallback if no TTS
            return;
        }
        
        synthRef.current.cancel(); // kill any active speech
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        // Find a decent english voice if possible
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US') && v.name.includes('Female'));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => setAiState("speaking");
        utterance.onend = () => {
            setAiState("listening");
            // Auto start recording their answer if mic is on
            if (isMicOn && !isRecording && hasStarted) {
                toggleRecording();
            }
        };

        synthRef.current.speak(utterance);
    };

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            toast.error("Speech recognition is not supported in your browser. (Try Chrome or Edge)");
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
            isRecordingRef.current = false;
            toast.success("Stopped listening", { id: 'dictation-toast', duration: 1500 });
        } else {
            try {
                recognitionRef.current.start();
                setIsRecording(true);
                isRecordingRef.current = true;
                toast.success("Listening...", { id: 'dictation-toast', duration: 2000, icon: '🎙️' });
            } catch (error) {
                console.warn("Error starting recognition", error);
                setIsRecording(true);
                isRecordingRef.current = true;
            }
        }
    };

    const submitAnswer = () => {
        if (transcript.trim().length < 2) {
            toast.error("Please provide an answer first.");
            return;
        }

        // Stop recording
        if (isRecording && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
            isRecordingRef.current = false;
        }
        
        if (synthRef.current) {
             synthRef.current.cancel();
        }

        // Add to history
        setMessages(prev => [...prev, { sender: 'You', text: transcript }]);
        const updatedHistory = [...history, { question: currentQuestion, answer: transcript }];
        setHistory(updatedHistory);
        
        // Reset and Trigger next
        setTranscript("");
        setCurrentQuestionIndex(prev => prev + 1);
        
        setTimeout(() => getNext(updatedHistory), 0); 
    };

    const getNext = async (currentHist: any[]) => {
        setAiState("thinking");
        try {
            const res = await fetch("/api/interview/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    context,
                    history: currentHist,
                    currentQuestionIndex: currentQuestionIndex + 1,
                    currentDifficulty
                })
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch question.");
            }

            if (data.isFinished) {
                submitInterview(currentHist);
                return;
            }

            if (data.newDifficulty !== undefined) {
                 setCurrentDifficulty(data.newDifficulty);
            }

            setCurrentQuestion(data.question);
            setMessages(prev => [...prev, { sender: 'Aura.ai', text: data.question }]);
            speakQuestion(data.question);

        } catch (error: any) {
            console.error("Error fetching question", error);
            toast.error(error.message || "Failed to fetch next question.");
            setAiState("listening");
        }
    };

    const submitInterview = async (finalHist = history) => {
        setAiState("finished");
        setIsEvaluating(true);
        toast.success("Interview completed! Generating your report...", { duration: 4000 });

        try {
            const res = await fetch("/api/interview/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    context,
                    history: finalHist,
                    finalDifficulty: currentDifficulty
                })
            });
            
            const data = await res.json();
            if (data.success) {
                sessionStorage.removeItem("interviewContext");
                if (data.report) {
                     sessionStorage.setItem("fallbackReport", JSON.stringify(data.report));
                }
                window.location.href = `/assessment/report?id=${data.assessmentId}`;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast.error("Failed to generate report.");
            setIsEvaluating(false);
            setAiState("listening"); // Revert
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => {
                track.enabled = !isVideoOn;
            });
            setIsVideoOn(!isVideoOn);
        }
    };

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !isMicOn;
            });
            setIsMicOn(!isMicOn);
            if (isRecording && isMicOn) {
                 toggleRecording();
            }
        }
    };

    const endInterview = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        window.location.href = "/assessment";
    };

    if (!context) return null;

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
            {/* Header */}
            <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={endInterview}
                        className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">Leave Interview</span>
                    </button>
                    <div className="h-4 w-px bg-slate-800"></div>
                    <span className="text-slate-300 text-sm font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-400" />
                        Aura AI Interviewer
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs font-medium text-slate-300">
                        {context.domains[0]} • {context.experience}
                    </div>
                </div>
            </header>

            {/* Main Stage */}
            <main className="flex-1 p-4 lg:p-6 flex flex-col lg:flex-row gap-6 h-[calc(100vh-4rem)] overflow-hidden">
                
                {/* Left Column: Videos (Fixed Width on Desktop) */}
                <div className="w-full lg:w-[400px] flex flex-col gap-6 flex-shrink-0 h-full overflow-y-auto pr-1 pb-4">
                    
                    {/* AI View (Top) */}
                    <div className="h-[280px] lg:h-[320px] min-h-[280px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 relative shadow-xl flex flex-col items-center justify-center shrink-0">
                        {/* Decorative aura */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-slate-900 to-violet-500/10 opacity-50"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/20 blur-[80px] rounded-full animate-pulse"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-6 transition-all duration-700 ${aiState === 'speaking' ? 'bg-gradient-to-br from-indigo-400 to-violet-500 scale-110 shadow-indigo-500/50 ring-4 ring-indigo-500/30' : 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700'}`}>
                                <Sparkles className={`h-10 w-10 ${aiState === 'speaking' ? 'text-white' : 'text-slate-500'}`} />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Aura</h2>
                            
                            {aiState === "thinking" || aiState === "initializing" ? (
                                <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                                    <span className="flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                    </span>
                                    <span className="text-xs font-medium">Generating response...</span>
                                </div>
                            ) : aiState === "finished" ? (
                                <div className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 text-xs font-medium">
                                    Interview Complete
                                </div>
                            ) : (
                                <div className="text-slate-400 text-xs font-medium bg-slate-950/50 px-3 py-1 rounded-md backdrop-blur-sm shadow-xl">
                                    AI Interviewer
                                </div>
                            )}
                        </div>
                        
                        <div className="absolute bottom-4 left-4 flex items-center gap-2">
                            {aiState === "speaking" && (
                                <div className="flex gap-1 items-center h-3">
                                    <div className="w-1 bg-indigo-500 h-full animate-[bounce_1s_infinite_0ms]"></div>
                                    <div className="w-1 bg-indigo-500 h-2/3 animate-[bounce_1s_infinite_200ms]"></div>
                                    <div className="w-1 bg-indigo-500 h-full animate-[bounce_1s_infinite_400ms]"></div>
                                    <div className="w-1 bg-indigo-500 h-1/2 animate-[bounce_1s_infinite_600ms]"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* User View (Bottom) */}
                    <div className="h-[280px] lg:h-[320px] min-h-[280px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 relative shadow-xl flex flex-col shrink-0">
                        <div className="flex-1 relative bg-slate-950 flex items-center justify-center border-b border-slate-800">
                            {isVideoOn ? (
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    playsInline 
                                    muted 
                                    className="absolute inset-0 w-full h-full object-cover mirror"
                                    style={{ transform: "scaleX(-1)" }} // mirror effect
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-slate-500">
                                    <UserIcon className="h-12 w-12 mb-3 opacity-50" />
                                    <span className="text-xs font-medium">Camera is off</span>
                                </div>
                            )}
                            
                            <div className="absolute bottom-3 left-3 text-white text-xs font-medium bg-slate-950/60 px-2 py-1 rounded backdrop-blur-sm border border-slate-700/50">
                                You
                            </div>
                        </div>

                        {/* Controls Bar */}
                        <div className="h-16 bg-slate-900 flex items-center justify-center gap-3 px-4 shrink-0">
                            <button 
                                onClick={toggleMic}
                                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                            >
                                {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                            </button>
                            
                            <button 
                                onClick={toggleVideo}
                                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${isVideoOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                            >
                                {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                            </button>

                            <button 
                                onClick={endInterview}
                                className="h-10 px-4 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium flex items-center justify-center gap-2 transition-all ml-2"
                            >
                                <PhoneOff className="h-4 w-4" />
                                <span className="text-xs hidden sm:inline">End</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Chat Interface */}
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col relative overflow-hidden h-full">
                    {!hasStarted ? (
                        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center h-full">
                            <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                                <MessageSquare className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Ready to begin?</h2>
                            <p className="text-slate-400 max-w-md mb-8">
                                Ensure your environment is quiet. Clicking start will allow the AI interviewer to speak and listen for your replies.
                            </p>
                            <button 
                                onClick={startInterview}
                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-lg shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all transform hover:scale-105 flex items-center gap-3"
                            >
                                <Sparkles className="h-6 w-6" /> Start AI Interview
                            </button>
                        </div>
                    ) : null}

                    {/* Chat History Header */}
                    <div className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center px-6 shrink-0">
                        <MessageSquare className="w-5 h-5 text-indigo-400 mr-3" />
                        <h3 className="font-semibold text-slate-200">Conversation History</h3>
                    </div>

                    {/* Chat Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                        {messages.length === 0 && hasStarted && aiState === "thinking" && (
                            <div className="flex justify-center text-slate-500 py-10 animate-pulse">
                                Aura is preparing the first question...
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex w-full ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                                    <span className="text-xs font-medium text-slate-500 mb-1.5 px-1">{msg.sender}</span>
                                    <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed ${
                                        msg.sender === 'You' 
                                        ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-900/20' 
                                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm shadow-md'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Live Transcript Bubble */}
                        {isRecording && transcript && (
                            <div className="flex w-full justify-end">
                                <div className="flex flex-col items-end max-w-[85%]">
                                    <span className="text-xs font-medium text-slate-500 mb-1.5 px-1 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                        You (Speaking...)
                                    </span>
                                    <div className="px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed bg-indigo-600/40 text-slate-200 rounded-tr-sm border border-indigo-500/30">
                                        {transcript}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-1" />
                    </div>

                    {/* Bottom Input Area */}
                    <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <textarea 
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                placeholder={isRecording ? "Listening... (You can also type here)" : "Type your answer or click the mic to speak..."}
                                disabled={aiState === "finished"}
                                className="flex-1 h-[72px] sm:h-auto min-h-[56px] max-h-[120px] bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none outline-none disabled:opacity-50 text-[15px]"
                            />
                            
                            <div className="flex sm:flex-col gap-2 shrink-0">
                                <button
                                    onClick={toggleRecording}
                                    disabled={aiState === "finished" || !hasStarted}
                                    className={`flex-1 sm:h-auto sm:py-2 px-3 rounded-xl flex items-center justify-center transition-all ${
                                        isRecording 
                                        ? 'bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                                    } disabled:opacity-50`}
                                    title={isRecording ? "Stop Dictation" : "Start Dictation"}
                                >
                                    {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                    <span className="ml-2 sm:hidden font-medium">{isRecording ? "Stop" : "Speak"}</span>
                                </button>
                                
                                <button
                                    onClick={submitAnswer}
                                    disabled={transcript.trim().length === 0 || aiState === "finished" || aiState === "thinking" || isEvaluating || !hasStarted}
                                    className="flex-[2] sm:h-auto sm:py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-indigo-600 shadow-lg shadow-indigo-600/20"
                                    title="Submit Answer"
                                >
                                    {isEvaluating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                    <span className="ml-2 sm:hidden font-medium">Submit</span>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}
