"use client"

import { useState, useRef, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { emergencyAssistantGuidance } from "@/ai/flows/emergency-assistant-guidance"
import { textToSpeech } from "@/ai/flows/text-to-speech"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, User, Loader2, Info, HeartPulse, Trash2, Mic, MapPin, ExternalLink, Volume2, MicOff, Bell, ArrowRight, ShieldCheck, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/Logo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface SuggestedResource {
  name: string;
  type: string;
  address: string;
  googleMapsUrl: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  category?: string;
  suggestedResources?: SuggestedResource[];
  audioUrl?: string;
  showEmergencyPanel?: boolean;
}

const CHAT_HISTORY_KEY = "axon_ai_chat_history";
const INITIAL_AI_MESSAGE = "I am AXON-AI, your resilient emergency companion. I am here to provide calm, actionable guidance during critical situations. How can I support you right now?";

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
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const cached = localStorage.getItem(CHAT_HISTORY_KEY);
    if (cached) {
      try {
        setMessages(JSON.parse(cached));
      } catch (e) {
        setMessages([{ role: 'assistant', content: INITIAL_AI_MESSAGE }]);
      }
    } else {
      setMessages([{ role: 'assistant', content: INITIAL_AI_MESSAGE }]);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
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
    setMessages([{ role: 'assistant', content: "I'm standing by. Describe your situation and I will provide the safest immediate steps." }]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
    if (audioRef.current) audioRef.current.pause();
  };

  const handleSubmit = async (e: React.FormEvent | string) => {
    const userMessage = typeof e === 'string' ? e : query.trim();
    if (typeof e !== 'string') e.preventDefault();
    
    if (!userMessage || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await emergencyAssistantGuidance({ query: userMessage });
      
      const isUrgent = response.category === 'medical' || response.category === 'disaster' || response.category === 'safety' ||
                       response.guidance.toLowerCase().includes('sos') || 
                       response.guidance.toLowerCase().includes('emergency') ||
                       response.guidance.toLowerCase().includes('safety');

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.guidance,
        category: response.category,
        suggestedResources: response.suggestedResources,
        showEmergencyPanel: isUrgent
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Offline assistance is active. Please remain calm and prioritize your immediate safety." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeech = async (msgIndex: number, text: string) => {
    if (isSpeakingId === msgIndex) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsSpeakingId(null);
      }
      return;
    }

    const message = messages[msgIndex];
    try {
      let audioUrl = message.audioUrl;
      if (!audioUrl) {
        setIsLoading(true);
        const ttsResponse = await textToSpeech(text);
        audioUrl = ttsResponse.media;
        setMessages(prev => {
          const updated = [...prev];
          updated[msgIndex] = { ...updated[msgIndex], audioUrl };
          return updated;
        });
      }

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsSpeakingId(msgIndex);
        audioRef.current.onended = () => setIsSpeakingId(null);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Voice link limited", description: "Continuing with text-based intelligence." });
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: "destructive", title: "Protocol Not Supported", description: "Native speech interface is unavailable." });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => setQuery(event.results[0][0].transcript);
    recognition.start();
  };

  const quickActions = [
    { label: "Nearby Aid", icon: MapPin, query: "Show me nearby medical aid and pharmacies" },
    { label: "First Aid Steps", icon: HeartPulse, query: "Provide immediate first aid steps for an emergency" },
    { label: "Safety Protocol", icon: ShieldCheck, query: "What is the safest protocol for my current area?" },
    { label: "Disaster Ready", icon: Bell, query: "How do I prepare for a local disaster situation?" },
  ];

  return (
    <div className="flex flex-col h-screen bg-background text-foreground transition-colors duration-500">
      <audio ref={audioRef} hidden />
      <header className="p-4 border-b flex items-center justify-between bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <div>
            <h1 className="font-black font-headline text-lg tracking-tighter text-primary uppercase leading-none">Axon Assist</h1>
            <div className="flex items-center gap-2 mt-1">
              {!isOnline ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-accent/10 rounded-full">
                  <WifiOff className="h-2 w-2 text-accent" />
                  <span className="text-[8px] text-accent font-black uppercase tracking-widest">Offline Assistance Active</span>
                </div>
              ) : (
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black opacity-50">Resilient Intelligence Active</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <Button variant="ghost" size="icon" onClick={clearChat} className="h-8 w-8 text-muted-foreground hover:text-accent">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-8 pb-6">
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex gap-3 mb-4">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold uppercase tracking-tight">
              I am here to provide immediate support. For professional assistance, please prioritize contacting emergency services (911/112).
            </p>
          </div>

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`h-9 w-9 rounded-xl shrink-0 flex items-center justify-center shadow-md ${msg.role === 'user' ? 'bg-muted border' : 'bg-primary'}`}>
                  {msg.role === 'user' ? <User className="h-5 w-5" /> : <Logo className="h-6 w-6" />}
                </div>
                <div className="flex flex-col gap-3">
                  <div className={`p-4 rounded-[1.5rem] text-[14px] leading-relaxed whitespace-pre-line font-medium shadow-sm border ${
                    msg.role === 'user' ? 'bg-primary text-white border-primary rounded-tr-none' : 'bg-card border-border rounded-tl-none'
                  }`}>
                    {msg.content}
                    {msg.role === 'assistant' && (
                      <div className="flex justify-end mt-2 pt-2 border-t border-border/5">
                        <Button 
                          variant="ghost" size="icon" onClick={() => toggleSpeech(i, msg.content)}
                          className={`h-8 w-8 rounded-full ${isSpeakingId === i ? 'bg-accent text-white scale-110' : 'text-muted-foreground hover:text-primary'}`}
                        >
                          <Volume2 className={`h-4 w-4 ${isSpeakingId === i ? 'animate-pulse' : ''}`} />
                        </Button>
                      </div>
                    )}
                  </div>

                  {msg.role === 'assistant' && msg.showEmergencyPanel && (
                    <Card className="border-accent/40 border-2 bg-accent/[0.03] overflow-hidden rounded-[2rem] shadow-xl animate-in zoom-in-95 duration-500">
                      <CardHeader className="p-5 pb-3 bg-accent/5 border-b border-accent/10">
                        <CardTitle className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                          <Bell className="h-3 w-3" />
                          Emergency Action Panel
                        </CardTitle>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1">Quick actions are ready.</p>
                      </CardHeader>
                      <CardContent className="p-4 grid gap-3">
                        <Link href="/sos" className="w-full">
                          <Button className="w-full justify-between bg-accent hover:bg-accent/90 text-white font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl px-5 shadow-lg shadow-accent/20">
                            <span className="flex items-center gap-3">
                              <span className="text-lg">🚨</span>
                              Activate SOS
                            </span>
                            <ArrowRight className="h-4 w-4 opacity-50" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" className="w-full justify-start gap-3 border-accent/20 hover:bg-accent/5 text-accent font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl px-5"
                          onClick={() => toast({ title: "Intelligence Shared", description: "GPS coordinates sent to rescue hubs." })}
                        >
                          <span className="text-lg">📍</span>
                          Share Live Location
                        </Button>
                        <Button 
                          variant="outline" className="w-full justify-start gap-3 border-primary/20 hover:bg-primary/5 text-primary font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl px-5"
                          onClick={() => toast({ title: "Contacts Notified", description: "Emergency network alerted via Resilient Mesh." })}
                        >
                          <span className="text-lg">👨‍👩‍👧</span>
                          Notify Contacts
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                  
                  {msg.role === 'assistant' && msg.suggestedResources && msg.suggestedResources.length > 0 && (
                    <div className="grid gap-2 mt-1">
                      {msg.suggestedResources.map((resource, idx) => (
                        <Button 
                          key={idx} variant="outline" size="sm" onClick={() => window.open(resource.googleMapsUrl, '_blank')}
                          className="justify-between h-auto py-4 px-5 border-primary/10 bg-primary/[0.03] hover:bg-primary/[0.06] rounded-2xl group"
                        >
                          <div className="flex items-center gap-4">
                            <MapPin className="h-4 w-4 text-primary" />
                            <div className="text-left">
                              <p className="text-xs font-black uppercase tracking-tight">{resource.name}</p>
                              <p className="text-[9px] text-muted-foreground font-black uppercase mt-1 opacity-70">{resource.type} • {resource.address}</p>
                            </div>
                          </div>
                          <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start items-center gap-3 px-2 py-4">
              <div className="flex gap-2 items-center text-primary font-black">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                <span className="text-[9px] uppercase tracking-widest ml-2 opacity-60 font-black">Synchronizing Intelligence</span>
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && !isLoading && (
          <div className="p-4 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4">
            {quickActions.map((action, idx) => (
              <Button 
                key={idx} variant="outline" onClick={() => handleSubmit(action.query)}
                className="justify-start gap-4 h-auto py-5 text-left border-primary/10 hover:bg-primary/5 rounded-[1.5rem] bg-card shadow-sm"
              >
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <action.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-tight leading-tight">{action.label}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-background/80 backdrop-blur-md border-t pb-20 md:pb-24">
        <div className="flex gap-3 max-w-screen-xl mx-auto items-center">
          <Button 
            variant="outline" size="icon" onClick={startListening}
            className={cn(
              "h-14 w-14 rounded-2xl border-primary/10 transition-all",
              isListening ? "bg-accent text-white border-accent scale-105 shadow-lg" : "text-primary hover:bg-primary/5"
            )}
          >
            {isListening ? <MicOff className="h-6 w-6 animate-pulse" /> : <Mic className="h-6 w-6" />}
          </Button>
          <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
            <Input 
              placeholder={isListening ? "Listening..." : "Describe emergency..."} 
              value={query} onChange={(e) => setQuery(e.target.value)} disabled={isLoading}
              className="flex-1 rounded-2xl border-primary/10 focus-visible:ring-primary h-14 px-6 text-[15px] font-medium shadow-inner"
            />
            <Button type="submit" disabled={isLoading || !query.trim()} className="rounded-2xl w-14 h-14 p-0 bg-primary hover:bg-primary/90 shadow-lg transition-all active:scale-90">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
            </Button>
          </form>
        </div>
      </div>

      <Navigation />
    </div>
  )
}