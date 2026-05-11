
"use client"

import { useState, useRef, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { emergencyAssistantGuidance } from "@/ai/flows/emergency-assistant-guidance"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Bot, User, Loader2, Info, HeartPulse, ShieldAlert, Zap, AlertTriangle, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/Logo"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  role: 'user' | 'assistant';
  content: string;
  category?: 'first-aid' | 'survival' | 'safety' | 'other';
}

const CHAT_HISTORY_KEY = "axon_ai_chat_history";

export default function AssistantPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize from local cache
  useEffect(() => {
    const cached = localStorage.getItem(CHAT_HISTORY_KEY);
    if (cached) {
      try {
        setMessages(JSON.parse(cached));
      } catch (e) {
        setMessages([{ 
          role: 'assistant', 
          content: "I am AXON-AI. Describe your emergency or select a category below for instant protocols." 
        }]);
      }
    } else {
      setMessages([{ 
        role: 'assistant', 
        content: "I am AXON-AI. Describe your emergency or select a category below for instant protocols." 
      }]);
    }
  }, []);

  // Save to cache whenever messages change
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
      content: "Protocol reset. I am AXON-AI. How can I assist you now?" 
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
        content: "Network disrupted. Please follow standard emergency procedures. Your medical profile and previous guidance remain accessible offline." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: "CPR Instructions", icon: HeartPulse, query: "Show me step-by-step CPR instructions" },
    { label: "Earthquake Safety", icon: Zap, query: "What to do during an earthquake?" },
    { label: "Stop Bleeding", icon: AlertTriangle, query: "How to stop severe bleeding?" },
    { label: "Evacuation Prep", icon: ShieldAlert, query: "What are the essential evacuation safety steps?" },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 border-b flex items-center justify-between bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <div>
            <h1 className="font-black font-headline text-lg tracking-tight text-primary">AI ASSISTANT</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Local-First Cache Active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <Button variant="ghost" size="icon" onClick={clearChat} className="h-8 w-8 text-muted-foreground hover:text-accent">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Badge variant="outline" className="border-primary text-primary bg-primary/5 text-[9px]">
            PERSISTENT
          </Badge>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-6 pb-4"
        >
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 flex gap-3 mb-6">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Protocols are saved locally. Information provided is for emergency reference only. Call 911/112 first if in danger.
            </p>
          </div>

          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center shadow-sm ${
                  msg.role === 'user' ? 'bg-muted border' : 'bg-primary'
                }`}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Logo className="h-6 w-6" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none shadow-lg' 
                    : 'bg-card border rounded-tl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="flex gap-3 items-center text-primary font-bold">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-xs uppercase tracking-widest">Compiling Local Protocol...</span>
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
                className="justify-start gap-2 h-auto py-3 text-left border-primary/20 hover:bg-primary/5 hover:border-primary"
                onClick={() => handleSubmit(action.query)}
              >
                <action.icon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-bold leading-tight">{action.label}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-background/80 backdrop-blur-md border-t pb-20 md:pb-24">
        <form 
          onSubmit={handleSubmit} 
          className="flex gap-2 max-w-screen-xl mx-auto items-center"
        >
          <Input 
            placeholder="Describe emergency situation..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 rounded-2xl border-primary/20 focus-visible:ring-primary h-14 px-6 text-base"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !query.trim()} 
            className="rounded-2xl w-14 h-14 p-0 bg-primary hover:bg-primary/90 shadow-lg"
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
          </Button>
        </form>
      </div>

      <Navigation />
    </div>
  )
}
