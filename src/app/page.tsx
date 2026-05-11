"use client"

import Link from "next/link"
import { Shield, Zap, MessageSquare, ShieldAlert, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-6 flex justify-between items-center border-b bg-card">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-primary h-8 w-8" />
          <span className="text-2xl font-black font-headline tracking-tighter text-primary">AXON-AI</span>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" className="font-bold">Enter App</Button>
        </Link>
      </header>

      <main className="flex-1 max-w-screen-xl mx-auto px-6 py-12 space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-6 pt-12">
          <div className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            Offline-First Emergency Support
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tight leading-[0.9] text-foreground">
            Intelligence That <br />
            <span className="text-primary">Stays Online</span> <br />
            When You Go Offline.
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            AXON-AI is a next-generation emergency platform providing AI-powered first-aid, survival guidance, and SOS alerting even in low-network disaster zones.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-10 rounded-xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                Launch Dashboard
              </Button>
            </Link>
            <Link href="/sos">
              <Button size="lg" variant="outline" className="h-14 px-10 rounded-xl text-lg font-bold border-accent text-accent hover:bg-accent/5">
                Trigger SOS Mode
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid md:grid-cols-3 gap-8">
          <Card className="bg-card border-none shadow-xl shadow-black/5 hover:translate-y-[-4px] transition-all">
            <CardContent className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-headline">AI Assistant</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Step-by-step first-aid and survival instructions powered by advanced emergency-trained models.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-none shadow-xl shadow-black/5 hover:translate-y-[-4px] transition-all">
            <CardContent className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                <ShieldAlert className="text-accent h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-headline">SOS Emergency</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Rapid SOS triggers with automatic GPS location sharing and emergency contact notification.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-none shadow-xl shadow-black/5 hover:translate-y-[-4px] transition-all">
            <CardContent className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Zap className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-headline">Offline Persistence</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Critical medical profiles and guidance stay accessible even without an internet connection.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Resilience Section */}
        <section className="bg-primary text-white rounded-[2rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="flex-1 space-y-6 relative z-10">
            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tight">Built for Resilience</h2>
            <p className="text-primary-foreground text-lg leading-relaxed">
              When standard infrastructure fails, AXON-AI thrives. Using local data caching and optimized Genkit flows, we ensure you have guidance when every second counts.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                <Shield className="h-4 w-4" /> Secure Data
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                <Zap className="h-4 w-4" /> Fast Performance
              </div>
            </div>
          </div>
          <div className="flex-1 w-full max-w-sm">
             <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-6 space-y-4 shadow-2xl">
                <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">Protocol Status: ACTIVE</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-white rounded-full" />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>CONNECTIVITY</span>
                    <span>MESH STABLE</span>
                  </div>
                </div>
                <div className="pt-4 flex justify-center">
                   <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center animate-pulse">
                      <ShieldAlert className="h-8 w-8 text-white" />
                   </div>
                </div>
             </div>
          </div>
        </section>
      </main>

      <footer className="p-8 border-t bg-card mt-24">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-muted-foreground h-5 w-5" />
            <span className="font-bold text-muted-foreground">AXON-AI © 2024</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Emergency Centers</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy Protocol</Link>
            <Link href="#" className="hover:text-primary transition-colors">Open Data</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}