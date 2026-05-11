"use client"

import { useState, useRef, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { emergencyAssistantGuidance } from "@/ai/flows/emergency-assistant-guidance"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Bot, User, Loader2, Info, HeartPulse, ShieldAlert, Zap, AlertTriangle, Trash2, Mic } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/Logo"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  role: 'user' | 'assistant';
  content: string;
  category?: 'first-aid' | 'survival' | 'safety' | 'other';
}

const CHAT_HISTORY_KEY = "axon_ai_chat_history";
const INITIAL_AI_MESSAGE = "I am AXON-AI. When networks fail, I respond. Describe your situation for instant rescue protocols.";

export default function AssistantPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cached = localStorage.getItem(CHAT_HISTORY_KEY);
    if (cached) {
      try {
        setMessages(JSON.parse(cached));
      } catch (e) {
        setMessages([{ 
          role: 'assistant', 
          content: INITIAL_AI_MESSAGE 
        }]);
      }
    } else {
      setMessages([{ 
        role: 'assistant', 
        content: INITIAL_AI_MESSAGE 
      }]);
    }
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
    const initialMessage: Message[] = [{ 
      role: 'assistant', 
      content: "Protocol reset. How can I assist you now?" 
    }];
    setMessages(initialMessage);
    localStorage.removeItem(CHAT_HISTORY_KEY);
  };

  const handleSubmit = async (e: React.FormEvent | string) => {
    const userMessage = typeof e === 'string' ? e : query.trim();
    if (typeof e !== 'string') e.preventDefault();
    
    if (!userMessage || isLoading) return;

    const newMessages = [...messages, { role: 'user', content: userMessage } as Message];
    setMessages(newMessages);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await emergencyAssistantGuidance({ query: userMessage });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.guidance,
        category: response.category 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Network link disrupted. Falling back to local survival protocols. Please remain calm." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: "CPR Protocol", icon: HeartPulse, query: "Show me step-by-step CPR instructions" },
    { label: "Earthquake Tips", icon: Zap, query: "What to do during an earthquake?" },
    { label: "Bleeding Control", icon: AlertTriangle, query: "How to stop severe bleeding?" },
    { label: "Hazard Safety", icon: ShieldAlert, query: "What are the essential safety steps for gas leaks?" },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 border-b flex items-center justify-between bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <div>
            <h1 className="font-black font-headline text-lg tracking-tighter text-primary uppercase">AXON ASSIST</h1>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black opacity-70">Intelligent Response Active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <Button variant="ghost" size="icon" onClick={clearChat} className="h-8 w-8 text-muted-foreground hover:text-accent">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black tracking-tight">
            ENCRYPTED
          </Badge>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-6 pb-6"
        >
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex gap-3 mb-6">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold uppercase tracking-tight">
              AI guidance is for emergency reference. Priority 1: Contact professional services (911/112).
            </p>
          </div>

          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`h-9 w-9 rounded-xl shrink-0 flex items-center justify-center shadow-md ${
                  msg.role === 'user' ? 'bg-muted border border-border' : 'bg-primary'
                }`}>
                  {msg.role === 'user' ? <User className="h-5 w-5" /> : <Logo className="h-6 w-6" />}
                </div>
                <div className={`p-4 rounded-2xl text-[14px] leading-relaxed whitespace-pre-line font-medium ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none shadow-xl' 
                    : 'bg-card border rounded-tl-none shadow-md'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="flex gap-3 items-center text-primary font-black">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-[10px] uppercase tracking-[0.2em]">Compiling Guidance...</span>
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && !isLoading && (
          <div className="p-4 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-bottom-4">
            {quickActions.map((action, idx) => (
              <Button 
                key={idx} 
                variant="outline" 
                className="justify-start gap-3 h-auto py-4 text-left border-primary/10 hover:bg-primary/5 hover:border-primary/30 rounded-2xl bg-card shadow-sm"
                onClick={() => handleSubmit(action.query)}
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <action.icon className="h-4 w-4 text-primary shrink-0" />
                </div>
                <span className="text-xs font-black uppercase tracking-tight leading-tight">{action.label}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-background/80 backdrop-blur-md border-t pb-20 md:pb-24">
        <div className="flex gap-3 max-w-screen-xl mx-auto items-center">
          <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-primary/10 text-primary">
            <Mic className="h-6 w-6" />
          </Button>
          <form 
            onSubmit={handleSubmit} 
            className="flex-1 flex gap-2"
          >
            <Input 
              placeholder="Describe situation..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-2xl border-primary/10 focus-visible:ring-primary h-14 px-6 text-base font-medium shadow-inner"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !query.trim()} 
              className="rounded-2xl w-14 h-14 p-0 bg-primary hover:bg-primary/90 shadow-xl"
            >
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
            </Button>
          </form>
        </div>
      </div>

      <Navigation />
    </div>
  )
}
