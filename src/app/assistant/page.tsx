"use client"

import { useState, useRef, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { emergencyAssistantGuidance } from "@/ai/flows/emergency-assistant-guidance"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Bot, User, Loader2, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/Logo"

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AssistantPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "I am AXON-AI. Describe your emergency or ask for first-aid instructions." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = query.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await emergencyAssistantGuidance({ query: userMessage });
      setMessages(prev => [...prev, { role: 'assistant', content: response.guidance }]);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please follow standard emergency procedures or use the offline SOS features." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 border-b flex items-center justify-between bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <div>
            <h1 className="font-bold font-headline text-lg">AI Assistant</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Protocol Version 4.0</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">Emergency Support</Badge>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 pb-24"
      >
        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex gap-3 mb-6">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Guidance provided by this assistant is informational. Always contact emergency services (911/112) first if possible.
          </p>
        </div>

        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-muted' : 'bg-primary'}`}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Logo className="h-5 w-5" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-card border rounded-tl-none shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-2 items-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs">Processing emergency guidance...</span>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-16 md:bottom-20 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-screen-xl mx-auto">
          <Input 
            placeholder="Type your emergency query..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 rounded-full border-primary/20 focus-visible:ring-primary h-12 px-6"
          />
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="rounded-full w-12 h-12 p-0 bg-primary hover:bg-primary/90"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>

      <Navigation />
    </div>
  )
}
