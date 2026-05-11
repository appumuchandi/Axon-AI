
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
  RefreshCw
} from "lucide-react"
import { generatePreparednessInsights, type GeneratePreparednessInsightsOutput } from "@/ai/flows/generate-preparedness-insights"
import { Skeleton } from "@/components/ui/skeleton"
import { Logo } from "@/components/Logo"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast();

  // Load cached insights on mount
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
      // Persist for offline use
      localStorage.setItem(`${INSIGHTS_CACHE_KEY}_${topic}`, JSON.stringify(result));
    } catch (error: any) {
      console.error("Failed to fetch AI insights", error);
      toast({
        variant: "destructive",
        title: "Intelligence Link Disrupted",
        description: "Accessing locally cached emergency survival intelligence.",
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
      case 'tip': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'action': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  }

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Top Header */}
      <header className="px-4 pt-6 pb-4 bg-card border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <div>
              <h1 className="text-xl font-black font-headline tracking-tighter text-primary leading-none">AXON DASH</h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Operational Status</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
               <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 font-black px-3 py-1 text-[10px]">
                OFFLINE-ACTIVE
              </Badge>
              <span className="text-[8px] font-black uppercase text-muted-foreground mt-1 tracking-tighter">Persistence Layer v1.0</span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 mt-6 max-w-screen-xl mx-auto space-y-6">
        {/* Device & Connection Status */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Critical Metrics</h2>
          </div>
          <StatusCard />
        </div>

        {/* AI Insights Engine Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI Intelligence Engine</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-[10px] font-bold text-primary"
              onClick={() => fetchInsights(activeTopic)}
              disabled={isLoadingInsights}
            >
              <RefreshCw className={cn("h-3 w-3 mr-1", isLoadingInsights && "animate-spin")} />
              REFRESH
            </Button>
          </div>

          {/* Topic Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            {TOPICS.map((topic) => (
              <Button
                key={topic.id}
                variant={activeTopic === topic.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTopic(topic.id)}
                className={cn(
                  "rounded-full px-4 font-bold text-[11px] uppercase transition-all",
                  activeTopic === topic.id ? "bg-primary shadow-md" : "border-primary/20 text-muted-foreground hover:border-primary/50"
                )}
              >
                <topic.icon className="h-3 w-3 mr-1.5" />
                {topic.label}
              </Button>
            ))}
          </div>
          
          <div className="grid gap-3 md:grid-cols-2">
            {isLoadingInsights && !insights ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))
            ) : (
              insights?.insights.map((insight: any, idx: number) => (
                <Card key={idx} className="bg-card border-2 border-primary/5 hover:border-primary/20 transition-all shadow-sm group">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.type)}
                        <CardTitle className="text-xs font-black text-foreground uppercase tracking-tight">{insight.title}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter opacity-50 border-primary/20">
                        {insight.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-[12px] text-muted-foreground leading-relaxed font-medium">{insight.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
            {!isLoadingInsights && (!insights || insights.insights.length === 0) && (
              <div className="col-span-full py-12 text-center border-2 border-dashed rounded-2xl border-muted">
                <Shield className="h-8 w-8 text-muted mx-auto mb-2 opacity-20" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No intelligence cached for this topic.</p>
              </div>
            )}
          </div>
        </div>

        {/* Critical Emergency Alerts */}
        <Card className="border-2 border-accent/50 bg-accent/5 overflow-hidden shadow-lg shadow-accent/5">
          <CardHeader className="bg-accent/10 py-3 flex flex-row items-center justify-between border-b border-accent/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-accent h-5 w-5" />
              <CardTitle className="text-xs font-black text-accent uppercase tracking-[0.15em]">Live Emergency Alerts</CardTitle>
            </div>
            <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="bg-accent/20 p-2 rounded-xl">
                  <Radio className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight">High Risk: Zone 4B Update</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Flash flood protocols remain in effect. Use the 'Medical' insight tab for water safety tips.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nearby Services */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rescue Centers</h2>
          </div>
          <Card className="border-2 border-muted overflow-hidden">
            <CardContent className="p-0 divide-y-2">
              {[
                { name: "Metropolitan Medical", type: "Medical Hub", dist: "0.8km", status: "Open" },
                { name: "Safe Zone Sigma", type: "Evacuation Center", dist: "2.1km", status: "80% Full" }
              ].map((service, i) => (
                <div key={i} className="flex justify-between items-center p-4 hover:bg-muted/30 transition-colors">
                  <div className="space-y-1">
                    <p className="font-black text-sm uppercase">{service.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{service.type}</span>
                      <span className="text-[10px] text-primary font-black">• {service.dist}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[9px] font-bold border-muted-foreground/30">{service.status}</Badge>
                    <div className="bg-primary/10 p-2 rounded-full">
                      <ArrowRight className="h-4 w-4 text-primary" />
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
