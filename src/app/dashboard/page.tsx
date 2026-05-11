"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/Navigation"
import { StatusCard } from "@/components/StatusCard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, MapPin, Shield, Info, ArrowRight, Activity, Radio } from "lucide-react"
import { generatePreparednessInsights, type GeneratePreparednessInsightsOutput } from "@/ai/flows/generate-preparedness-insights"
import { Skeleton } from "@/components/ui/skeleton"
import { Logo } from "@/components/Logo"
import { cn } from "@/lib/utils"

export default function Dashboard() {
  const [insights, setInsights] = useState<GeneratePreparednessInsightsOutput | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const result = await generatePreparednessInsights({ topic: "General Safety" });
        setInsights(result);
      } catch (error) {
        console.error("Failed to fetch AI insights", error);
      } finally {
        setIsLoadingInsights(false);
      }
    }
    fetchInsights();
  }, []);

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
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 font-black px-3 py-1">
            ACTIVE
          </Badge>
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
                  <h4 className="font-bold text-sm leading-tight">Flash Flood Warning - Area 4B</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Evacuation routes active for Zone 4. High water levels detected in nearby basins.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Preparedness Insights */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI Intelligence</h2>
            </div>
            {isLoadingInsights && <span className="text-[8px] animate-pulse text-primary font-bold">ANALYZING...</span>}
          </div>
          
          <div className="grid gap-3 md:grid-cols-2">
            {isLoadingInsights ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
              ))
            ) : (
              insights?.insights.map((insight, idx) => (
                <Card key={idx} className="bg-card border-2 border-primary/10 hover:border-primary/30 transition-all shadow-sm">
                  <CardHeader className="p-4 pb-1">
                    <CardTitle className="text-sm font-black text-primary uppercase tracking-tight">{insight.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{insight.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

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