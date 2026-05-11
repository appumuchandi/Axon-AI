"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/Navigation"
import { StatusCard } from "@/components/StatusCard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, MapPin, Shield, Info, ArrowRight } from "lucide-react"
import { generatePreparednessInsights, type GeneratePreparednessInsightsOutput } from "@/ai/flows/generate-preparedness-insights"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Logo } from "@/components/Logo"

export default function Dashboard() {
  const [insights, setInsights] = useState<GeneratePreparednessInsightsOutput | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const result = await generatePreparednessInsights({});
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
    <div className="min-h-screen pb-24 px-4 pt-8 max-w-screen-xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Logo className="h-10 w-10" />
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">AXON-AI</h1>
            <p className="text-muted-foreground text-sm">Emergency Intelligence Platform</p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary text-primary font-bold px-3 py-1">
          RESCUE-READY
        </Badge>
      </header>

      <section className="space-y-6">
        {/* Status Section */}
        <StatusCard />

        {/* Critical Alerts */}
        <Card className="border-accent/50 bg-accent/5 overflow-hidden">
          <CardHeader className="bg-accent/10 py-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-accent h-5 w-5" />
              <CardTitle className="text-sm font-headline text-accent uppercase tracking-wider">Critical Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex gap-3 items-start border-b border-accent/20 pb-3 last:border-0 last:pb-0">
                <Shield className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Emergency Connectivity Protocol Active</h4>
                  <p className="text-xs text-muted-foreground">Nearby Mesh nodes detected. High stability communication available.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights Engine */}
        <div>
          <h3 className="text-lg font-bold font-headline mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Preparedness Insights
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {isLoadingInsights ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))
            ) : (
              insights?.insights.map((insight, idx) => (
                <Card key={idx} className="bg-card hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-primary">{insight.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{insight.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Nearby Services Mock */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Nearby Emergency Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-bold text-sm">Central Medical Hub</p>
                  <p className="text-xs text-muted-foreground">0.8 km • Emergency Dept Open</p>
                </div>
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-bold text-sm">Community Safe Zone</p>
                  <p className="text-xs text-muted-foreground">1.2 km • Capacity 60%</p>
                </div>
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Navigation />
    </div>
  )
}
