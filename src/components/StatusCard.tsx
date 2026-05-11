"use client"

import { useState, useEffect } from "react"
import { Battery, Wifi, WifiOff, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function StatusCard() {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Battery API is not supported in all browsers
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
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
          {isOnline ? (
            <Wifi className="text-primary h-6 w-6" />
          ) : (
            <WifiOff className="text-accent h-6 w-6 animate-pulse" />
          )}
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isOnline ? "Online" : "Offline Mode"}
          </span>
        </CardContent>
      </Card>
      
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
          <div className="relative">
            <Battery className="text-primary h-6 w-6" />
            {batteryLevel !== null && batteryLevel < 20 && (
              <Zap className="text-accent h-3 w-3 absolute -top-1 -right-1" />
            )}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider">
            {batteryLevel !== null ? `${batteryLevel}% Battery` : "Battery OK"}
          </span>
        </CardContent>
      </Card>
    </div>
  )
}