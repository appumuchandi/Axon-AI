"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/Navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  Activity, 
  WifiOff,
  Wifi,
  RadioTower,
  Cpu,
  MapPin,
  Waves,
  AlertTriangle,
  Sparkles,
  Zap,
  HeartPulse,
  Flame,
  Stethoscope,
  ChevronRight,
  Wind
} from "lucide-react"
import { generatePreparednessInsights, type GeneratePreparednessInsightsOutput } from "@/ai/flows/generate-preparedness-insights"
import { Skeleton } from "@/components/ui/skeleton"
import { Logo } from "@/components/Logo"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ThemeToggle"

const INTELLIGENCE_MODES = [
  { id: "Resilience", label: "🛡 Resilience", icon: Shield, topic: "Offline Survival Protocols" },
  { id: "Seismic", label: "🌍 Seismic", icon: Activity, topic: "Earthquake Immediate Response" },
  { id: "Flood", label: "🌊 Flood", icon: Wind, topic: "Severe Flood & Water Safety" },
  { id: "Medical", label: "❤️ Medical", icon: HeartPulse, topic: "Emergency Medical Triage" },
]

export default function Dashboard() {
  const [insights, setInsights] = useState<GeneratePreparednessInsightsOutput | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [activeMode, setActiveMode] = useState("Resilience");
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    }
  }, []);

  const getLocalInsightsFallback = (modeId: string) => {
    const fallbacks: Record<string, any> = {
      Seismic: {
        insights: [
          { title: "Drop, Cover, Hold", content: "Identify a sturdy table. Stay away from windows and high cabinets.", type: "tip" },
          { title: "Gas Leak Check", content: "If you smell gas, shut off the main valve immediately and open windows.", type: "warning" },
          { title: "Aftershock Risk", content: "Be prepared for subsequent shaking. Structural integrity may be compromised.", type: "fact" },
          { title: "Offline Mesh Link", content: "Local device sync is active. SOS can be dispatched via SMS/native apps.", type: "action" }
        ]
      },
      Medical: {
        insights: [
          { title: "Bleeding Control", content: "Apply firm direct pressure. Do not remove original bandage if soaked.", type: "tip" },
          { title: "CPR Awareness", content: "Check breathing. If absent, start compressions mid-chest (100-120 bpm).", type: "action" },
          { title: "Shock Prevention", content: "Keep victim warm and lying down. Elevate legs if no limb injury.", type: "fact" },
          { title: "Airway Clearance", content: "Tilt head back slightly to ensure open airway if victim is unconscious.", type: "warning" }
        ]
      },
      Flood: {
        insights: [
          { title: "Elevated Ground", content: "Move to the highest floor possible. Do not climb into closed attics.", type: "tip" },
          { title: "Current Danger", content: "Just 6 inches of moving water can knock you off your feet.", type: "warning" },
          { title: "Contamination Alert", content: "Avoid contact with floodwater; it may contain sewage or toxins.", type: "fact" },
          { title: "Power Protocol", content: "Turn off electricity at the main breaker if water reaches outlets.", type: "action" }
        ]
      },
      Resilience: {
        insights: [
          { title: "Local Cache Active", content: "All core medical profiles and emergency contacts are stored on-device.", type: "tip" },
          { title: "72-Hour Supply", content: "Ensure 1 gallon of water per person per day is available for 3 days.", type: "warning" },
          { title: "Offline Mapping", content: "Your last known GPS coordinates and profile are cached for SOS use.", type: "fact" },
          { title: "Low Power Mesh", content: "Connectivity is limited. Use text/SMS over voice to save power.", type: "action" }
        ]
      }
    };
    return fallbacks[modeId] || fallbacks.Resilience;
  };

  const fetchInsights = async (modeId: string) => {
    setIsLoadingInsights(true);
    const mode = INTELLIGENCE_MODES.find(m => m.id === modeId);
    
    if (!navigator.onLine) {
      setTimeout(() => {
        setInsights(getLocalInsightsFallback(modeId));
        setIsLoadingInsights(false);
      }, 400);
      return;
    }

    try {
      const result = await generatePreparednessInsights({ topic: mode?.topic });
      setInsights(result);
    } catch (error) {
      setInsights(getLocalInsightsFallback(modeId));
    } finally {
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchInsights(activeMode);
  }, [activeMode]);

  return (
    <div className="min-h-screen pb-28 bg-background transition-colors duration-500">
      <header className="px-6 pt-8 pb-6 bg-card/80 backdrop-blur-xl border-b sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-2xl">
              <Logo className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-primary leading-none">Axon Dashboard</h1>
              <div className="flex items-center gap-1.5 mt-1">
                {isOnline ? (
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-green-500">Grid Link Stable</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(250,128,114,0.5)]" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-accent">Resilient Mode Active</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="px-6 mt-8 max-w-screen-xl mx-auto space-y-10">
        <section className="grid grid-cols-3 gap-3">
          {[
            { label: "Mesh Net", icon: isOnline ? Wifi : WifiOff, val: isOnline ? "Synced" : "Local", color: isOnline ? "text-primary" : "text-accent" },
            { label: "GPS Fix", icon: MapPin, val: "Locked", color: "text-primary" },
            { label: "AI Brain", icon: Cpu, val: "Resilient", color: "text-primary" },
          ].map((item, i) => (
            <div key={i} className="bg-card border border-primary/5 p-5 rounded-[2rem] flex flex-col items-center justify-center gap-1 shadow-sm">
              <item.icon className={cn("h-5 w-5 mb-1", item.color)} />
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{item.label}</span>
              <span className={cn("text-[10px] font-black uppercase", item.color)}>{item.val}</span>
            </div>
          ))}
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 px-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Intelligence Layers</h2>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {INTELLIGENCE_MODES.map((mode) => (
              <Button
                key={mode.id} 
                variant={activeMode === mode.id ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveMode(mode.id)}
                className={cn(
                  "rounded-full px-6 h-11 font-black text-[10px] uppercase transition-all duration-300 border-2",
                  activeMode === mode.id 
                    ? "bg-primary shadow-xl border-primary scale-105" 
                    : "border-primary/10 text-muted-foreground hover:border-primary/30"
                )}
              >
                <mode.icon className="h-4 w-4 mr-2" />
                {mode.label}
              </Button>
            ))}
          </div>
          
          <div className="grid gap-5 md:grid-cols-2">
            {isLoadingInsights ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-[2.5rem]" />)
            ) : (
              insights?.insights.map((insight: any, idx: number) => (
                <Card key={idx} className="bg-card border-none hover:shadow-xl transition-all shadow-md group rounded-[2.5rem] overflow-hidden">
                  <div className={cn(
                    "h-1.5 w-full",
                    insight.type === 'warning' ? "bg-accent" : insight.type === 'action' ? "bg-green-500" : "bg-primary"
                  )} />
                  <CardHeader className="p-7 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted/30 rounded-xl">
                          {insight.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-accent" /> : <Shield className="h-4 w-4 text-primary" />}
                        </div>
                        <CardTitle className="text-sm font-black text-foreground uppercase">{insight.title}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-[8px] font-black uppercase bg-muted/50">
                        {insight.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-7 pt-2">
                    <p className="text-[13px] text-muted-foreground leading-relaxed font-semibold">{insight.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        <section className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 flex items-center gap-6">
          <div className="bg-primary/10 p-4 rounded-2xl shrink-0">
            <RadioTower className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase">Resilient Sync Protocol</h3>
            <p className="text-xs text-muted-foreground font-semibold">
              Your identity and survival data are locked to this device. In case of total grid failure, AXON-AI remains functional.
            </p>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  )
}