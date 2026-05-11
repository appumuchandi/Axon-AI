"use client"

import { useState, useRef, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { emergencyAssistantGuidance } from "@/ai/flows/emergency-assistant-guidance"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Bot, User, Loader2, Info, HeartPulse, ShieldAlert, Zap, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/Logo"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  role: 'user' | 'assistant';
  content: string;
  category?: 'first-aid' | 'survival' | 'safety' | 'other';
}

export default function AssistantPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "I am AXON-AI. Describe your emergency or select a category below for instant protocols." 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent | string) => {
    const userMessage = typeof e === 'string' ? e : query.trim();
    if (typeof e !== 'string') e.preventDefault();
    
    if (!userMessage || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
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
        content: "Network disrupted. Please follow standard emergency procedures or use the offline SOS features in the main menu." 
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
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">AXON Intelligence v4.0</p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary text-primary bg-primary/5">
          RESCUE-ENABLED
        </Badge>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-6 pb-4"
        >
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 flex gap-3 mb-6">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Information provided is for emergency reference only. Always call 911/112 first if you are in immediate danger.
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
                <span className="text-xs uppercase tracking-widest">Generating Rescue Protocol...</span>
              </div>
            </div>
          )}
        </div>

        {messages.length === 1 && !isLoading && (
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
            placeholder="Describe emergency (e.g. 'How to treat a burn?')..." 
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