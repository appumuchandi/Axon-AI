"use client"

import Link from "next/link"
import { Shield, Zap, MessageSquare, ShieldAlert, ChevronRight, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Logo } from "@/components/Logo"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-6 flex justify-between items-center border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="text-2xl font-black font-headline tracking-tighter text-primary">AXON-AI</span>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" className="font-bold text-primary hover:bg-primary/5">Enter App</Button>
        </Link>
      </header>

      <main className="flex-1 max-w-screen-xl mx-auto px-6 py-12 space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-8 pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            Reliable AI Emergency Companion
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tight leading-[1] text-foreground">
            The Intelligence <br />
            <span className="text-primary">That Saves Lives</span> <br />
            When Networks Fail.
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            AXON-AI provides trust-driven, offline-first emergency intelligence. Professional first-aid guidance and high-speed SOS triggers built for resilience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-10 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                Open Dashboard
              </Button>
            </Link>
            <Link href="/sos">
              <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl text-lg font-bold border-accent text-accent hover:bg-accent/5">
                SOS Rapid Response
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid md:grid-cols-3 gap-8">
          <Card className="bg-card border-none shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold font-headline">AI Assistant</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Step-by-step first-aid and survival instructions powered by models trained for emergency response.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-none shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                <ShieldAlert className="text-accent h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold font-headline">SOS System</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                High-priority SOS trigger with salmon-coded alerts for maximum visibility during crises.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-none shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Shield className="text-primary h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold font-headline">Offline Ready</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your medical profile and critical survival data stay on your device, even without infrastructure.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Resilience Section */}
        <section className="bg-primary text-white rounded-[2.5rem] p-10 md:p-20 flex flex-col md:flex-row items-center gap-16 overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="flex-1 space-y-8 relative z-10">
            <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tight">Built for Resilience</h2>
            <p className="text-primary-foreground/90 text-xl leading-relaxed">
              When standard infrastructure fails, AXON-AI thrives. Using persistent local caching and optimized tech, we ensure intelligence stays online when you need it most.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/15 px-6 py-3 rounded-xl text-base font-bold flex items-center gap-3">
                <Shield className="h-5 w-5" /> Verified Security
              </div>
              <div className="bg-white/15 px-6 py-3 rounded-xl text-base font-bold flex items-center gap-3">
                <Activity className="h-5 w-5" /> Mesh Persistence
              </div>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md">
             <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 space-y-6 shadow-2xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                  <div className="w-4 h-4 rounded-full bg-accent animate-pulse" />
                  <span className="text-sm font-bold uppercase tracking-widest">Protocol Status: ACTIVE</span>
                </div>
                <div className="space-y-4">
                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-white rounded-full transition-all duration-1000" />
                  </div>
                  <div className="flex justify-between text-xs font-bold opacity-80 uppercase tracking-tighter">
                    <span>TRUST LAYER</span>
                    <span>ENCRYPTED</span>
                  </div>
                </div>
                <div className="pt-8 flex justify-center">
                   <div className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center animate-pulse duration-[2000ms]">
                      <Logo className="h-10 w-10 opacity-90" />
                   </div>
                </div>
             </div>
          </div>
        </section>
      </main>

      <footer className="p-12 border-t bg-card mt-24">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Logo className="h-6 w-6 opacity-80" />
            <span className="font-bold text-muted-foreground uppercase tracking-widest text-xs">AXON-AI © 2024</span>
          </div>
          <div className="flex gap-10 text-sm font-semibold text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Emergency Centers</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy Protocol</Link>
            <Link href="#" className="hover:text-primary transition-colors">Documentation</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}