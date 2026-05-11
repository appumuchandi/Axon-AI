"use client"

import { useState, useEffect } from "react"
import { Battery, Wifi, WifiOff, Zap, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatusCard() {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className={cn(
        "border-2 transition-all duration-500",
        isOnline ? "bg-primary/5 border-primary/20" : "bg-accent/5 border-accent/20"
      )}>
        <CardContent className="p-4 flex flex-col items-center justify-center gap-1">
          <div className="p-2 rounded-full bg-background mb-1">
            {isOnline ? (
              <Wifi className="text-primary h-5 w-5" />
            ) : (
              <WifiOff className="text-accent h-5 w-5 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Network</span>
          <span className={cn("text-xs font-bold uppercase", isOnline ? "text-primary" : "text-accent")}>
            {isOnline ? "Stable" : "Offline"}
          </span>
        </CardContent>
      </Card>
      
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex flex-col items-center justify-center gap-1">
          <div className="p-2 rounded-full bg-background mb-1 relative">
            <Battery className="text-primary h-5 w-5" />
            {batteryLevel !== null && batteryLevel < 25 && (
              <Zap className="text-accent h-2.5 w-2.5 absolute -top-0.5 -right-0.5 animate-bounce" />
            )}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Power</span>
          <span className="text-xs font-bold text-primary">
            {batteryLevel !== null ? `${batteryLevel}%` : "Checking..."}
          </span>
        </CardContent>
      </Card>
    </div>
  )
}