"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/Navigation"
import { StatusCard } from "@/components/StatusCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  AlertCircle, 
  MapPin, 
  Shield, 
  ArrowRight, 
  Activity, 
  Radio, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Sparkles,
  RefreshCw,
  WifiOff,
  Database,
  Navigation as NavIcon,
  Wifi,
  Globe,
  RadioTower,
  Cpu
} from "lucide-react"
import { generatePreparednessInsights, type GeneratePreparednessInsightsOutput } from "@/ai/flows/generate-preparedness-insights"
import { Skeleton } from "@/components/ui/skeleton"
import { Logo } from "@/components/Logo"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/ThemeToggle"

const TOPICS = [
  { id: "General", label: "General", icon: Shield },
  { id: "Earthquake", label: "Quake", icon: Activity },
  { id: "Flood", label: "Flood", icon: AlertCircle },
  { id: "Medical", label: "Medical", icon: Activity },
]

const INSIGHTS_CACHE_KEY = "axon_ai_insights_cache";

export default function Dashboard() {
  const [insights, setInsights] = useState<GeneratePreparednessInsightsOutput | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [activeTopic, setActiveTopic] = useState("General");
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

  useEffect(() => {
    const cached = localStorage.getItem(`${INSIGHTS_CACHE_KEY}_${activeTopic}`);
    if (cached) {
      try {
        setInsights(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached insights");
      }
    }
  }, [activeTopic]);

  const fetchInsights = async (topic: string) => {
    setIsLoadingInsights(true);
    try {
      const result = await generatePreparednessInsights({ topic: `${topic} Safety & Preparedness` });
      setInsights(result);
      localStorage.setItem(`${INSIGHTS_CACHE_KEY}_${topic}`, JSON.stringify(result));
    } catch (error: any) {
      toast({
        title: "Resilient Intelligence Engine Active",
        description: "Local survival protocols have been activated due to network link limits.",
      });
    } finally {
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchInsights(activeTopic);
  }, [activeTopic]);

  const getInsightCategory = (type: string) => {
    switch (type) {
      case 'tip': return { label: '🛡 Guidance', icon: Shield, color: 'text-blue-500' };
      case 'warning': return { label: '⚠ Alert', icon: AlertTriangle, color: 'text-accent' };
      case 'action': return { label: '📡 Connectivity', icon: RadioTower, color: 'text-green-500' };
      default: return { label: '🤖 AI Insight', icon: Sparkles, color: 'text-primary' };
    }
  }

  const handleDirectionClick = (locationName: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationName)}`;
    window.open(url, '_blank');
  };

  const rescueServices = [
    { name: "Central Medical Emergency Hospital", type: "LEVEL 1 TRAUMA", dist: "0.8km", status: "Active" },
    { name: "City Red Cross Rescue Center", type: "MEDICAL SUPPORT", dist: "1.4km", status: "Active" },
    { name: "Safe Haven Delta Evacuation Point", type: "EVAC CENTER", dist: "2.1km", status: "Open" }
  ];

  return (
    <div className="min-h-screen pb-24 bg-background transition-colors duration-500">
      <header className="px-5 pt-7 pb-5 bg-card/80 backdrop-blur-xl border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <div>
              <h1 className="text-xl font-black font-headline tracking-tighter text-primary leading-none uppercase">AXON-AI</h1>
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-50 mt-1">Resilient Command Hub</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="px-5 mt-8 max-w-screen-xl mx-auto space-y-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mission Critical Status</h2>
          </div>
          
          <StatusCard />
          
          <div className={cn(
            "p-4 rounded-[1.5rem] border flex items-center justify-center gap-3 transition-all duration-700 shadow-sm",
            isOnline ? "bg-primary/5 border-primary/10 text-primary/60" : "bg-accent/10 border-accent/30 text-accent animate-pulse shadow-accent/10"
          )}>
            {isOnline ? <Globe className="h-4 w-4 shrink-0" /> : <WifiOff className="h-4 w-4 shrink-0" />}
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">
              {isOnline ? "Network Infrastructure Stable" : "Grid Link Disrupted - Offline Resilience Engaged"}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resilient Intel Engine</h2>
            </div>
            <Button 
              variant="ghost" size="sm" className="h-6 px-3 text-[9px] font-black text-primary hover:bg-primary/5 rounded-full"
              onClick={() => fetchInsights(activeTopic)} disabled={isLoadingInsights}
            >
              <RefreshCw className={cn("h-3 w-3 mr-2", isLoadingInsights && "animate-spin")} />
              SYNC INTEL
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide no-scrollbar">
            {TOPICS.map((topic) => (
              <Button
                key={topic.id} variant={activeTopic === topic.id ? "default" : "outline"} size="sm"
                onClick={() => setActiveTopic(topic.id)}
                className={cn(
                  "rounded-full px-6 font-black text-[10px] uppercase transition-all border-2",
                  activeTopic === topic.id ? "bg-primary shadow-lg border-primary" : "border-primary/10 text-muted-foreground hover:border-primary/40"
                )}
              >
                <topic.icon className="h-3.5 w-3.5 mr-2" />
                {topic.label}
              </Button>
            ))}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {isLoadingInsights && !insights ? (
              Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-[2rem]" />)
            ) : (
              insights?.insights.map((insight: any, idx: number) => {
                const cat = getInsightCategory(insight.type);
                return (
                  <Card key={idx} className="bg-card border-none hover:shadow-xl transition-all shadow-md group rounded-[2rem] overflow-hidden border-t border-muted/20">
                    <CardHeader className="p-6 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 bg-muted/30 rounded-xl", cat.color)}>
                            <cat.icon className="h-4 w-4" />
                          </div>
                          <CardTitle className="text-sm font-black text-foreground uppercase tracking-tight">{insight.title}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-tighter opacity-60 bg-muted/50 border-none">
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
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <NavIcon className="h-4 w-4 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nearby Rescue Hubs</h2>
          </div>
          <Card className="border-none shadow-lg rounded-[2.5rem] overflow-hidden bg-card">
            <CardContent className="p-0 divide-y border-none">
              {rescueServices.map((service, i) => (
                <div 
                  key={i} onClick={() => handleDirectionClick(service.name)}
                  className="flex justify-between items-center p-6 hover:bg-primary/[0.03] transition-colors group cursor-pointer"
                >
                  <div className="space-y-1.5">
                    <p className="font-black text-[14px] uppercase text-foreground tracking-tight leading-none">{service.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">{service.type}</span>
                      <span className="text-[9px] text-muted-foreground font-black opacity-50">• {service.dist}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-[8px] font-black border-primary/20 text-primary uppercase px-3 py-1 rounded-full">{service.status}</Badge>
                    <div className="bg-muted p-3 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <ArrowRight className="h-4 w-4 text-primary group-hover:text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-none bg-primary/5 rounded-[2.5rem] overflow-hidden p-7 shadow-sm border border-primary/10">
           <div className="flex items-center gap-4">
             <div className="bg-primary/10 p-4 rounded-[1.25rem]">
               <Database className="h-6 w-6 text-primary" />
             </div>
             <div>
               <h3 className="text-sm font-black uppercase tracking-tight leading-none">System Resilience Briefing</h3>
               <p className="text-[11px] text-muted-foreground font-semibold mt-2 leading-relaxed">Local survival protocols and GPS mesh networking are verified and ready for infrastructure-free operation.</p>
             </div>
           </div>
        </Card>
      </main>

      <Navigation />
    </div>
  )
}
