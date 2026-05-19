
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
  Waves,
  AlertTriangle,
  Sparkles,
  Zap,
  HeartPulse
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
  { id: "Medical", label: "❤️ Medical", icon: HeartPulse, topic: "First-Aid Actions" },
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

  const getLocalInsightsFallback = (modeId: string) => {
    if (modeId === 'Seismic') {
      return {
        insights: [
          { title: "Drop, Cover, Hold", content: "Identify a sturdy table. Stay away from windows and high cabinets.", type: "tip" },
          { title: "Gas Leak Check", content: "If you smell gas, shut off the main valve immediately and open windows.", type: "warning" },
          { title: "Aftershock Risk", content: "Be prepared for subsequent shaking. Structural integrity may be compromised.", type: "fact" },
          { title: "Communication", content: "Keep phone calls for emergencies only to avoid network congestion.", type: "action" }
        ]
      };
    }
    if (modeId === 'Medical') {
      return {
        insights: [
          { title: "Bleeding Control", content: "Apply firm direct pressure. Do not remove original bandage if soaked.", type: "tip" },
          { title: "CPR Awareness", content: "Check breathing. If absent, start compressions mid-chest (100-120 bpm).", type: "action" },
          { title: "Shock Prevention", content: "Keep victim warm and lying down. Elevate legs if no limb injury.", type: "fact" },
          { title: "Airway Clearance", content: "Tilt head back slightly to ensure open airway if victim is unconscious.", type: "warning" }
        ]
      };
    }
    return {
      insights: [
        { title: "Offline Resilience", content: "All core emergency profiles and local protocols are accessible offline.", type: "tip" },
        { title: "Water Reserves", content: "Ensure 1 gallon of water per person per day is available for 72 hours.", type: "warning" },
        { title: "Offline Mapping", content: "Your last known GPS coordinates and profile are cached for SOS use.", type: "fact" },
        { title: "Mesh Protocol", content: "Local device sync is active. SOS can be dispatched via SMS/native apps.", type: "action" }
      ]
    };
  };

  const fetchInsights = async (modeId: string) => {
    setIsLoadingInsights(true);
    const mode = INTELLIGENCE_MODES.find(m => m.id === modeId);
    
    if (!navigator.onLine) {
      setTimeout(() => {
        setInsights(getLocalInsightsFallback(modeId));
        setIsLoadingInsights(false);
      }, 500);
      return;
    }

    try {
      const result = await generatePreparednessInsights({ topic: mode?.topic });
      setInsights(result);
    } catch (error: any) {
      setInsights(getLocalInsightsFallback(modeId));
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
    { label: "Mesh Net", icon: isOnline ? Wifi : WifiOff, val: isOnline ? "Active" : "Offline", status: isOnline ? "ok" : "warn" },
    { label: "GPS Sync", icon: MapPin, val: "Precision", status: "ok" },
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
              <div className="flex items-center gap-1 mt-1">
                {!isOnline && (
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[7px] text-accent font-black uppercase tracking-[0.2em]">Offline Assistance Active</span>
                  </div>
                )}
                {isOnline && (
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-[7px] text-green-500 font-black uppercase tracking-[0.2em]">Grid Link Stable</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="px-5 mt-8 max-w-screen-xl mx-auto space-y-10">
        <section className="grid grid-cols-3 gap-3">
          {statusGrid.map((item, i) => (
            <div key={i} className="bg-card border-2 border-primary/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm">
              <item.icon className={cn("h-4 w-4 mb-1", item.status === 'warn' ? "text-accent" : "text-primary")} />
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-60 text-center">{item.label}</span>
              <span className={cn("text-[9px] font-black uppercase", item.status === 'warn' ? "text-accent" : "text-foreground")}>{item.val}</span>
            </div>
          ))}
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Intelligence Modes</h2>
            </div>
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
                  <Card key={idx} className={cn(
                    "bg-card border-none hover:shadow-xl transition-all shadow-md group rounded-[2rem] overflow-hidden",
                    !isOnline && "border border-accent/10"
                  )}>
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

        <Card className="border-none bg-primary/5 rounded-[2rem] p-7 shadow-sm border border-primary/10">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-tight leading-none">Axon-AI Resilience Status</h3>
              <p className="text-[10px] text-muted-foreground font-semibold mt-2 leading-relaxed">
                {isOnline 
                  ? "Cloud diagnostic engine connected. Full preparedness briefings active." 
                  : "Offline mode active. Using local survival intelligence cached on this device."}
              </p>
            </div>
          </div>
        </Card>
      </main>

      <Navigation />
    </div>
  )
}
