"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { ShieldAlert, AlertTriangle, MapPin, Share2, Phone, Volume2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useEmergencyProfile } from "@/hooks/use-emergency-profile"

export default function SOSPage() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isTriggered, setIsTriggered] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const { profile } = useEmergencyProfile();

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setIsTriggered(true);
      setCountdown(null);
    }
  }, [countdown]);

  const handleSOS = () => {
    if (isTriggered) return;
    setCountdown(5);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  };

  const cancelSOS = () => {
    setCountdown(null);
    setIsTriggered(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center gap-8">
      <header className="text-center">
        <h1 className="text-2xl font-bold font-headline mb-2 text-foreground">AXON SOS</h1>
        <p className="text-muted-foreground text-sm">Critical Incident Response Protocol</p>
      </header>

      {!isTriggered && countdown === null ? (
        <div className="relative group cursor-pointer" onClick={handleSOS}>
          <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping group-hover:animate-none" />
          <div className="absolute inset-4 bg-accent/40 rounded-full animate-ping delay-75 group-hover:animate-none" />
          <Button 
            size="lg"
            className="w-64 h-64 rounded-full bg-accent hover:bg-accent/90 shadow-2xl flex flex-col items-center justify-center gap-4 relative transition-transform active:scale-95"
          >
            <ShieldAlert className="h-24 w-24 text-white" />
            <span className="text-3xl font-black text-white tracking-widest uppercase">SOS</span>
          </Button>
        </div>
      ) : countdown !== null ? (
        <div className="text-center space-y-8 animate-in zoom-in-95">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="absolute inset-0 transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted/20"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={753}
                strokeDashoffset={753 - (753 * (5 - countdown)) / 5}
                className="text-accent transition-all duration-1000 linear"
              />
            </svg>
            <span className="text-8xl font-black text-accent">{countdown}</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-accent">Triggering SOS...</h2>
            <Button 
              variant="outline" 
              onClick={cancelSOS}
              className="px-8 py-6 rounded-full border-muted-foreground text-muted-foreground hover:bg-muted"
            >
              CANCEL REQUEST
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-6 animate-in slide-in-from-bottom-8">
          <Card className="border-accent bg-accent/5 overflow-hidden shadow-lg border-2">
            <CardContent className="p-6 space-y-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <AlertTriangle className="h-12 w-12 text-accent animate-pulse" />
                <h2 className="text-2xl font-black text-accent uppercase tracking-tighter">EMERGENCY ACTIVE</h2>
                <p className="text-sm font-medium">Broadcast signal sent to nearby services and emergency contacts.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button className="flex flex-col gap-2 h-auto py-4 bg-primary text-white hover:bg-primary/90">
                  <Phone className="h-6 w-6" />
                  <span className="text-xs font-bold">CALL 911</span>
                </Button>
                <Button className="flex flex-col gap-2 h-auto py-4 bg-accent text-white hover:bg-accent/90" onClick={() => window.alert('GPS Shared')}>
                  <Share2 className="h-6 w-6" />
                  <span className="text-xs font-bold">SHARE GPS</span>
                </Button>
              </div>

              <div className="bg-background rounded-lg p-4 text-left border space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Live Coordinates</span>
                </div>
                {location ? (
                  <p className="font-mono text-sm">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Fetching GPS precise location...</p>
                )}
                
                <div className="pt-2 border-t mt-2">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Attached Medical Profile</p>
                  <p className="text-sm font-bold">{profile?.fullName || "Anonymous User"} • {profile?.bloodGroup || "Blood Type Unspecified"}</p>
                </div>
              </div>

              <Button variant="ghost" className="text-xs text-muted-foreground" onClick={cancelSOS}>
                DEACTIVATE EMERGENCY STATUS
              </Button>
            </CardContent>
          </Card>
          
          <Button variant="secondary" className="w-full h-14 rounded-xl font-bold flex gap-2">
            <Volume2 className="h-5 w-5" />
            EMIT AUDIBLE ALARM
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground max-w-xs text-center fixed bottom-24">
        Hold the SOS button for rapid activation. AXON-AI will automatically share your emergency profile.
      </p>

      <Navigation />
    </div>
  )
}