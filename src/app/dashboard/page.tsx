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
  WifiOff
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
      console.error("Failed to fetch AI insights", error);
      toast({
        variant: "destructive",
        title: "Intelligence Link Restricted",
        description: "Accessing locally cached Emergency Intelligence protocols.",
      });
    } finally {
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchInsights(activeTopic);
  }, [activeTopic]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'tip': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-accent" />;
      case 'action': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-primary" />;
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
    <div className="min-h-screen pb-24 bg-background">
      {/* Top Header */}
      <header className="px-4 pt-6 pb-4 bg-card border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <div>
              <h1 className="text-xl font-black font-headline tracking-tighter text-primary leading-none uppercase">AXON-AI</h1>
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">AI That Survives Disasters.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="px-4 mt-6 max-w-screen-xl mx-auto space-y-8">
        {/* Device & Connection Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Critical Status</h2>
            </div>
          </div>
          
          <StatusCard />
          
          <div className={cn(
            "p-3 rounded-xl border flex items-center justify-center gap-3 transition-all duration-500",
            isOnline 
              ? "bg-primary/5 border-primary/10 text-primary/60" 
              : "bg-accent/10 border-accent/30 text-accent animate-pulse"
          )}>
            {!isOnline && <WifiOff className="h-4 w-4 shrink-0" />}
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">
              When Networks Fail, AXON-AI Responds.
            </p>
          </div>
        </div>

        {/* AI Insights Engine Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resilient Intel Engine</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-[10px] font-black text-primary hover:bg-primary/5"
              onClick={() => fetchInsights(activeTopic)}
              disabled={isLoadingInsights}
            >
              <RefreshCw className={cn("h-3 w-3 mr-1.5", isLoadingInsights && "animate-spin")} />
              UPDATE INTEL
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            {TOPICS.map((topic) => (
              <Button
                key={topic.id}
                variant={activeTopic === topic.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTopic(topic.id)}
                className={cn(
                  "rounded-full px-5 font-black text-[10px] uppercase transition-all border-2",
                  activeTopic === topic.id ? "bg-primary shadow-lg border-primary" : "border-primary/10 text-muted-foreground hover:border-primary/40"
                )}
              >
                <topic.icon className="h-3.5 w-3.5 mr-2" />
                {topic.label}
              </Button>
            ))}
          </div>
          
          <div className="grid gap-3 md:grid-cols-2">
            {isLoadingInsights && !insights ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-36 w-full rounded-2xl" />
              ))
            ) : (
              insights?.insights.map((insight: any, idx: number) => (
                <Card key={idx} className="bg-card border-none hover:shadow-xl transition-all shadow-md group rounded-2xl">
                  <CardHeader className="p-5 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/5 rounded-xl">
                          {getInsightIcon(insight.type)}
                        </div>
                        <CardTitle className="text-sm font-black text-foreground uppercase tracking-tight">{insight.title}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter opacity-40 border-primary/20">
                        {insight.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-2">
                    <p className="text-[13px] text-muted-foreground leading-relaxed font-semibold">{insight.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Critical Emergency Alerts */}
        <Card className="border-none bg-accent/5 overflow-hidden shadow-xl rounded-3xl relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
          <CardHeader className="bg-accent/5 py-4 flex flex-row items-center justify-between border-b border-accent/10">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-accent h-5 w-5" />
              <CardTitle className="text-xs font-black text-accent uppercase tracking-widest leading-none">Intelligence Alerts</CardTitle>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="bg-accent/10 p-3 rounded-2xl">
                  <Radio className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase text-foreground leading-none">Resilience Protocol Update</h4>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-semibold">Local survival intelligence synchronized. Access 'Medical' intel for offline water purification steps.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rescue Centers */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nearby Support</h2>
          </div>
          <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
            <CardContent className="p-0 divide-y border-none">
              {rescueServices.map((service, i) => (
                <div 
                  key={i} 
                  onClick={() => handleDirectionClick(service.name)}
                  className="flex justify-between items-center p-5 hover:bg-primary/5 transition-colors group cursor-pointer"
                >
                  <div className="space-y-1">
                    <p className="font-black text-[14px] uppercase text-foreground tracking-tight">{service.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">{service.type}</span>
                      <span className="text-[9px] text-muted-foreground font-black opacity-50">• {service.dist}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-[8px] font-black border-primary/20 text-primary uppercase">{service.status}</Badge>
                    <div className="bg-primary/10 p-2.5 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                      <ArrowRight className="h-4 w-4 text-primary group-hover:text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>

      <Navigation />
    </div>
  )
}
