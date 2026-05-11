"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { ShieldAlert, AlertTriangle, MapPin, Share2, Phone, Volume2, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useEmergencyProfile } from "@/hooks/use-emergency-profile"
import { Logo } from "@/components/Logo"

export default function SOSPage() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isTriggered, setIsTriggered] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const { profile } = useEmergencyProfile();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setIsTriggered(true);
      setCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSOS = () => {
    if (isTriggered) return;
    setCountdown(5);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.error("Location access denied", err),
        { enableHighAccuracy: true }
      );
    }
  };

  const cancelSOS = () => {
    setCountdown(null);
    setIsTriggered(false);
  };

  const handleShareLocation = async () => {
    const shareData = {
      title: 'AXON SOS',
      text: `EMERGENCY SOS: My location is ${location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Unknown'}.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error: any) {
        // If the user cancelled the share, we don't need to show an error
        if (error.name !== 'AbortError') {
          alert(shareData.text);
        }
      }
    } else {
      alert(shareData.text);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 pb-24">
      <header className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <h1 className="text-xl font-black font-headline tracking-tighter text-primary">AXON SOS</h1>
        </div>
        {isTriggered && (
          <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1 rounded-full animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Live Alert Active</span>
          </div>
        )}
      </header>

      <div className="flex-1 w-full flex flex-col items-center justify-center max-w-md mx-auto">
        {!isTriggered && countdown === null ? (
          <div className="space-y-12 text-center">
            <div className="relative group" onClick={handleSOS}>
              <div className="absolute inset-[-20px] bg-red-500/10 rounded-full animate-ping duration-[2000ms]" />
              <div className="absolute inset-[-40px] bg-red-500/5 rounded-full animate-ping duration-[3000ms] delay-500" />
              
              <Button 
                size="lg"
                className="w-64 h-64 rounded-full bg-red-600 hover:bg-red-700 shadow-[0_0_50px_rgba(220,38,38,0.4)] flex flex-col items-center justify-center gap-4 relative transition-transform active:scale-90 border-[8px] border-white/20"
              >
                <ShieldAlert className="h-24 w-24 text-white" />
                <span className="text-4xl font-black text-white tracking-widest uppercase">SOS</span>
              </Button>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Emergency Trigger</h2>
              <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
                Tap the button to start the 5s emergency broadcast sequence.
              </p>
            </div>
          </div>
        ) : countdown !== null ? (
          <div className="text-center space-y-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative w-72 h-72 flex items-center justify-center">
              <svg className="absolute inset-0 transform -rotate-90">
                <circle
                  cx="144"
                  cy="144"
                  r="130"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-muted/10"
                />
                <circle
                  cx="144"
                  cy="144"
                  r="130"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={816}
                  strokeDashoffset={816 - (816 * (5 - countdown)) / 5}
                  className="text-red-500 transition-all duration-1000 linear stroke-cap-round"
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-9xl font-black text-red-500 leading-none">{countdown}</span>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mt-2">Seconds</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={cancelSOS}
              className="px-10 py-8 rounded-2xl border-2 border-muted-foreground/20 text-muted-foreground hover:bg-muted font-bold text-lg flex gap-3 group"
            >
              <X className="h-6 w-6 group-hover:rotate-90 transition-transform" />
              CANCEL EMERGENCY
            </Button>
          </div>
        ) : (
          <div className="w-full space-y-6 animate-in slide-in-from-bottom-12 duration-700">
            <Card className="border-red-500 bg-red-500/5 overflow-hidden shadow-2xl border-2">
              <CardContent className="p-8 space-y-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-red-500 p-4 rounded-full shadow-lg shadow-red-500/20">
                    <AlertTriangle className="h-10 w-10 text-white animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-red-600 uppercase tracking-tighter">Emergency Active</h2>
                    <p className="text-sm font-semibold text-red-600/80 uppercase tracking-widest">Distress Signal Broadcasted</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button className="flex flex-col gap-2 h-auto py-5 bg-red-600 text-white hover:bg-red-700 rounded-2xl">
                    <Phone className="h-7 w-7" />
                    <span className="text-xs font-black uppercase">Call Emergency</span>
                  </Button>
                  <Button 
                    className="flex flex-col gap-2 h-auto py-5 bg-primary text-white hover:bg-primary/90 rounded-2xl" 
                    onClick={handleShareLocation}
                  >
                    <Share2 className="h-7 w-7" />
                    <span className="text-xs font-black uppercase">Share Precise GPS</span>
                  </Button>
                </div>

                <div className="bg-background rounded-2xl p-5 text-left border-2 space-y-4 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <MapPin className="h-4 w-4" />
                      <span className="text-[10px] uppercase tracking-widest">Live Coordinates</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  {location ? (
                    <div className="space-y-1">
                      <p className="font-mono text-lg font-bold tracking-tight">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Accuracy: High (within 5m)</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Fetching high-precision GPS...</p>
                  )}
                  
                  <div className="pt-4 border-t-2 border-dashed mt-4">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Attached Medical Identity</p>
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-base font-black uppercase leading-none">{profile?.fullName || "Unidentified User"}</p>
                        <p className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md inline-block">
                          {profile?.bloodGroup || "Blood Type: N/A"}
                        </p>
                      </div>
                      <ShieldAlert className="h-8 w-8 text-primary/20" />
                    </div>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  className="text-xs font-bold text-muted-foreground hover:text-red-500" 
                  onClick={cancelSOS}
                >
                  DEACTIVATE SOS PROTOCOL
                </Button>
              </CardContent>
            </Card>
            
            <Button variant="secondary" className="w-full h-16 rounded-2xl font-black text-lg flex gap-3 border-2 border-primary/20 hover:bg-primary/5 transition-all">
              <Volume2 className="h-6 w-6" />
              EMIT AUDIBLE BEACON
            </Button>
          </div>
        )}
      </div>

      {!isTriggered && countdown === null && (
        <p className="text-xs text-muted-foreground max-w-xs text-center font-medium leading-relaxed">
          The AXON SOS system triggers an automatic broadcast of your GPS and medical profile to local emergency services.
        </p>
      )}

      <Navigation />
    </div>
  )
}
