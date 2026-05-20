"use client"

import { useState, useRef, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { emergencyAssistantGuidance } from "@/ai/flows/emergency-assistant-guidance"
import { textToSpeech } from "@/ai/flows/text-to-speech"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, User, Loader2, Trash2, Mic, MapPin, ExternalLink, Volume2, MicOff, WifiOff, Stethoscope, ChevronRight, ShieldAlert } from "lucide-react"
import { Logo } from "@/components/Logo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Message {
  role: 'user' | 'assistant';
  content: string;
  category?: string;
  suggestedResources?: any[];
  followUpQuestions?: string[];
  audioUrl?: string;
  isOfflineResponse?: boolean;
  timestamp: string;
}

const CHAT_HISTORY_KEY = "axon_ai_chat_history_v5";
const INITIAL_AI_MESSAGE = "I am AXON-AI, your emergency intelligence companion. Describe your symptoms or the disaster situation, and I will provide immediate survival protocols.";

export default function AssistantPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    
    const cached = localStorage.getItem(CHAT_HISTORY_KEY);
    if (cached) {
      try {
        setMessages(JSON.parse(cached));
      } catch (e) {
        setMessages([{ role: 'assistant', content: INITIAL_AI_MESSAGE, timestamp: new Date().toLocaleTimeString() }]);
      }
    } else {
      setMessages([{ role: 'assistant', content: INITIAL_AI_MESSAGE, timestamp: new Date().toLocaleTimeString() }]);
    }

    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: INITIAL_AI_MESSAGE, timestamp: new Date().toLocaleTimeString() }]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
  };

  const getLocalGuidanceFallback = (q: string) => {
    const query = q.toLowerCase();
    
    // Medical - Cardiac / Chest Pain
    if (query.includes('chest') || query.includes('heart') || query.includes('pain')) {
      return {
        guidance: "Chest pain protocol initiated. Please try to remain as calm and still as possible.\n\n1. Sit down immediately and avoid any physical activity.\n2. Loosen tight clothing around the neck and waist.\n3. If symptoms worsen, activate SOS.",
        category: "medical",
        followUpQuestions: ["Is the pain spreading to your arm or jaw?", "Are you having difficulty breathing?", "Do you feel dizzy or sweaty?"]
      };
    }

    // Medical - Breathing
    if (query.includes('breath') || query.includes('choke')) {
      return {
        guidance: "Airway obstruction protocol: If choking and cannot speak, perform abdominal thrusts immediately. If struggling to breathe, sit upright and keep the neck straight.",
        category: "medical",
        followUpQuestions: ["Is the person turning blue?", "Are they conscious?", "Is this an allergic reaction?"]
      };
    }

    // Disaster - Fire
    if (query.includes('fire') || query.includes('smoke')) {
      return {
        guidance: "Fire protocol: Evacuate immediately. Stay low to the ground to avoid smoke inhalation. Feel doors with the back of your hand before opening. Do not use elevators.",
        category: "safety",
        followUpQuestions: ["Are you trapped in a room?", "Can you smell gas leaks?", "Are there injuries?"]
      };
    }

    // Disaster - Seismic
    if (query.includes('quake') || query.includes('earthquake')) {
      return {
        guidance: "Seismic event active: Drop, Cover, and Hold On. Stay away from windows and heavy furniture. Stay indoors until shaking stops.",
        category: "disaster",
        followUpQuestions: ["Do you smell gas?", "Is there structural damage?", "Are there aftershocks?"]
      };
    }

    // Unconscious
    if (query.includes('unconscious') || query.includes('passed out')) {
      return {
        guidance: "Unresponsive victim protocol: Check for breathing and a pulse. If breathing, place them on their side (recovery position). If NOT breathing, prepare for chest compressions.",
        category: "medical",
        followUpQuestions: ["Is the victim breathing?", "How long have they been unresponsive?", "Is there a head injury?"]
      };
    }

    return {
      guidance: "I am ready to assist. Please describe the emergency (e.g., 'chest pain', 'bleeding', 'fire') so I can provide the relevant protocol immediately.",
      category: "safety",
      followUpQuestions: ["Medical Emergency", "Fire/Smoke", "Natural Disaster", "Personal Safety"]
    };
  };

  const handleSubmit = async (e: React.FormEvent | string) => {
    const userMessage = typeof e === 'string' ? e : query.trim();
    if (typeof e !== 'string') e.preventDefault();
    if (!userMessage || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date().toLocaleTimeString() }]);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await emergencyAssistantGuidance({ query: userMessage });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.guidance,
        category: response.category,
        followUpQuestions: response.followUpQuestions,
        suggestedResources: response.suggestedResources,
        timestamp: new Date().toLocaleTimeString(),
        isOfflineResponse: !navigator.onLine
      }]);
    } catch (error) {
      const local = getLocalGuidanceFallback(userMessage);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: local.guidance, 
        category: local.category, 
        followUpQuestions: local.followUpQuestions,
        isOfflineResponse: true,
        timestamp: new Date().toLocaleTimeString() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeech = async (msgIndex: number, text: string) => {
    if (!isOnline) {
      toast({ variant: "destructive", title: "Cloud Link Limited", description: "Voice synthesis requires a grid connection." });
      return;
    }
    if (isSpeakingId === msgIndex) {
      audioRef.current?.pause();
      setIsSpeakingId(null);
      return;
    }
    try {
      setIsLoading(true);
      const { media } = await textToSpeech(text);
      if (audioRef.current) {
        audioRef.current.src = media;
        audioRef.current.play();
        setIsSpeakingId(msgIndex);
        audioRef.current.onended = () => setIsSpeakingId(null);
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Audio Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground transition-all">
      <audio ref={audioRef} hidden />
      <header className="p-5 border-b flex items-center justify-between bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Logo className="h-9 w-9" />
          <div>
            <h1 className="font-black text-lg tracking-tighter text-primary uppercase leading-none">Axon Assist</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={cn("h-1.5 w-1.5 rounded-full", isOnline ? "bg-green-500" : "bg-accent animate-pulse")} />
              <span className="text-[7px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                {isOnline ? "Grid Link Stable" : "Resilient Local Mode Active"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={clearChat} className="h-10 w-10 text-muted-foreground hover:text-accent rounded-xl">
            <Trash2 className="h-5 w-5" />
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-10 pb-20 no-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={cn(
                  "h-10 w-10 rounded-2xl shrink-0 flex items-center justify-center shadow-md",
                  msg.role === 'user' ? 'bg-secondary border' : 'bg-primary'
                )}>
                  {msg.role === 'user' ? <User className="h-6 w-6" /> : <Logo className="h-7 w-7" />}
                </div>
                <div className="flex flex-col gap-3">
                  <div className={cn(
                    "p-6 rounded-[2rem] text-[15px] leading-relaxed font-semibold shadow-sm relative whitespace-pre-wrap",
                    msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-card border rounded-tl-none',
                    msg.isOfflineResponse && "border-accent/30 bg-accent/5"
                  )}>
                    {msg.content}
                    <div className="text-[8px] uppercase tracking-widest opacity-40 mt-3 font-black text-right">
                      {msg.timestamp}
                    </div>
                    {msg.isOfflineResponse && (
                      <div className="absolute -top-2 -right-2 bg-accent text-white p-1 rounded-full shadow-lg">
                        <WifiOff className="h-3 w-3" />
                      </div>
                    )}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-muted/10">
                        <Link href="/sos">
                          <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-widest text-accent hover:bg-accent/10">
                            <ShieldAlert className="h-3 w-3 mr-2" /> Activate SOS
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" size="icon" onClick={() => toggleSpeech(i, msg.content)}
                          className={cn("h-10 w-10 rounded-full transition-all", isSpeakingId === i ? 'bg-primary text-white scale-110' : 'text-muted-foreground hover:bg-primary/10')}
                        >
                          <Volume2 className={cn("h-5 w-5", isSpeakingId === i && "animate-pulse")} />
                        </Button>
                      </div>
                    )}
                  </div>

                  {msg.role === 'assistant' && msg.followUpQuestions && (
                    <div className="flex flex-wrap gap-2 animate-in fade-in duration-700">
                      {msg.followUpQuestions.map((q, idx) => (
                        <Button 
                          key={idx} variant="outline" size="sm" onClick={() => handleSubmit(q)}
                          className="rounded-full px-5 h-10 text-[10px] font-black uppercase border-primary/20 hover:bg-primary/5 text-primary bg-card/50"
                        >
                          <Stethoscope className="h-3.5 w-3.5 mr-2 opacity-50" />
                          {q}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start items-center gap-4 px-2">
              <div className="flex gap-2 items-center text-primary font-black animate-pulse">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-[10px] uppercase tracking-widest ml-2">Analyzing Survival Intent</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-background/80 backdrop-blur-xl border-t pb-24">
        <div className="max-w-screen-xl mx-auto flex gap-4">
          <Button 
            variant="outline" size="icon" onClick={() => setIsListening(!isListening)}
            className={cn("h-14 w-14 rounded-2xl border-primary/10 transition-all", isListening && "bg-accent text-white border-accent animate-pulse scale-110 shadow-lg")}
          >
            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          <form onSubmit={handleSubmit} className="flex-1 flex gap-3">
            <Input 
              placeholder={isListening ? "Listening..." : "Describe emergency or symptoms..."} 
              value={query} onChange={(e) => setQuery(e.target.value)} disabled={isLoading}
              className="flex-1 rounded-2xl border-primary/10 focus-visible:ring-primary h-14 px-6 text-[15px] font-semibold bg-card/50"
            />
            <Button type="submit" disabled={isLoading || !query.trim()} className="rounded-2xl w-14 h-14 p-0 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
            </Button>
          </form>
        </div>
      </div>

      <Navigation />
    </div>
  )
}
