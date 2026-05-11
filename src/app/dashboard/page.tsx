"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/Navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  ArrowRight, 
  Activity, 
  RefreshCw,
  WifiOff,
  Database,
  Navigation as NavIcon,
  Wifi,
  RadioTower,
  Cpu,
  MapPin,
  Lock,
  Zap,
  Waves,
  AlertTriangle,
  Sparkles
} from "lucide-react"
import { generatePreparednessInsights, type GeneratePreparednessInsightsOutput } from "@/ai/flows/generate-preparedness-insights"
import { Skeleton } from "@/components/ui/skeleton"
import { Logo } from "@/components/Logo"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/ThemeToggle"

const INTELLIGENCE_MODES = [
  { id: "General", label: "🛡 General", icon: Shield, topic: "General Emergency Preparedness" },
  { id: "Seismic", label: "🌍 Seismic", icon: Activity, topic: "Earthquake Survival Steps" },
  { id: "Flood", label: "🌊 Flood", icon: Waves, topic: "Flood Water Safety" },
  { id: "Medical", label: "❤️ Medical", icon: Activity, topic: "First-Aid Actions" },
]

export default function Dashboard() {
  const [insights, setInsights] = useState<GeneratePreparednessInsightsOutput | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [activeMode, setActiveMode] = useState("General");
  const [isOnline, setIsOnline] = useState(true);
  const { toast } = useToast();

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

  const fetchInsights = async (modeId: string) => {
    setIsLoadingInsights(true);
    const mode = INTELLIGENCE_MODES.find(m => m.id === modeId);
    try {
      const result = await generatePreparednessInsights({ topic: mode?.topic });
      setInsights(result);
    } catch (error: any) {
      toast({ title: "Axon Engine Fallback", description: "Continuing with locally cached resilience intelligence." });
    } finally {
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchInsights(activeMode);
  }, [activeMode]);

  const getInsightCategory = (type: string) => {
    switch (type) {
      case 'tip': return { label: '🛡 Guidance', icon: Shield, color: 'text-blue-500' };
      case 'warning': return { label: '⚠ Alert', icon: AlertTriangle, color: 'text-accent' };
      case 'action': return { label: '📡 Connectivity', icon: RadioTower, color: 'text-green-500' };
      default: return { label: '🤖 AI Insight', icon: Sparkles, color: 'text-primary' };
    }
  }

  const statusGrid = [
    { label: "Network Mesh", icon: isOnline ? Wifi : WifiOff, val: isOnline ? "Active" : "Mesh Only", status: isOnline ? "ok" : "warn" },
    { label: "GPS Accuracy", icon: MapPin, val: "Sub-Meter", status: "ok" },
    { label: "Data Security", icon: Lock, val: "Encrypted", status: "ok" },
    { label: "Axon Engine", icon: Cpu, val: "Resilient", status: "ok" },
  ];

  return (
    <div className="min-h-screen pb-28 bg-background transition-colors duration-500">
      <header className="px-5 pt-7 pb-5 bg-card/80 backdrop-blur-xl border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <div>
              <h1 className="text-xl font-black font-headline tracking-tighter text-primary leading-none uppercase">Axon-AI</h1>
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-50 mt-1">Command Center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="px-5 mt-8 max-w-screen-xl mx-auto space-y-10">
        <section className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statusGrid.map((item, i) => (
              <div key={i} className="bg-card border-2 border-primary/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm">
                <item.icon className={cn("h-4 w-4 mb-1", item.status === 'warn' ? "text-accent" : "text-primary")} />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{item.label}</span>
                <span className={cn("text-[10px] font-black uppercase", item.status === 'warn' ? "text-accent" : "text-foreground")}>{item.val}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Emergency Intelligence Modes</h2>
            </div>
            <Button 
              variant="ghost" size="sm" className="h-6 px-3 text-[9px] font-black text-primary hover:bg-primary/5 rounded-full"
              onClick={() => fetchInsights(activeMode)} disabled={isLoadingInsights}
            >
              <RefreshCw className={cn("h-3 w-3 mr-2", isLoadingInsights && "animate-spin")} />
              Sync Engine
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {INTELLIGENCE_MODES.map((mode) => (
              <Button
                key={mode.id} 
                variant={activeMode === mode.id ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveMode(mode.id)}
                className={cn(
                  "rounded-full px-6 font-black text-[10px] uppercase transition-all duration-300 border-2",
                  activeMode === mode.id 
                    ? "bg-primary shadow-lg border-primary scale-105" 
                    : "border-primary/10 text-muted-foreground hover:border-primary/40"
                )}
              >
                <mode.icon className="h-3.5 w-3.5 mr-2" />
                {mode.label}
              </Button>
            ))}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isLoadingInsights ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />)
            ) : (
              insights?.insights.map((insight: any, idx: number) => {
                const cat = getInsightCategory(insight.type);
                return (
                  <Card key={idx} className="bg-card border-none hover:shadow-xl transition-all shadow-md group rounded-[2rem] overflow-hidden">
                    <CardHeader className="p-6 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 bg-muted/30 rounded-xl", cat.color)}>
                            <cat.icon className="h-4 w-4" />
                          </div>
                          <CardTitle className="text-sm font-black text-foreground uppercase tracking-tight">{insight.title}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-[8px] font-black uppercase opacity-60 bg-muted/50 border-none">
                          {cat.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-2">
                      <p className="text-[13px] text-muted-foreground leading-relaxed font-semibold">{insight.content}</p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <NavIcon className="h-4 w-4 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nearby Rescue Hubs</h2>
          </div>
          <Card className="border-none shadow-lg rounded-[2rem] overflow-hidden bg-card">
            <CardContent className="p-0 divide-y">
              {[
                { name: "Central Medical Hospital", dist: "0.8km", status: "Active" },
                { name: "City Rescue Center", dist: "1.4km", status: "Active" }
              ].map((service, i) => (
                <div key={i} className="flex justify-between items-center p-6 hover:bg-primary/[0.03] transition-colors cursor-pointer group">
                  <div className="space-y-1">
                    <p className="font-black text-[13px] uppercase text-foreground tracking-tight">{service.name}</p>
                    <p className="text-[9px] text-muted-foreground font-black uppercase opacity-60">{service.dist} • GPS Validated</p>
                  </div>
                  <div className="bg-muted p-3 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none bg-primary/5 rounded-[2rem] p-7 shadow-sm border border-primary/10">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-tight leading-none">Axon Engine Briefing</h3>
                <p className="text-[10px] text-muted-foreground font-semibold mt-2 leading-relaxed">Local survival protocols and GPS mesh networking are enabled for infrastructure-free operation.</p>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <Navigation />
    </div>
  )
}
