"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { ShieldAlert, AlertTriangle, MapPin, Share2, Phone, Volume2, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useEmergencyProfile } from "@/hooks/use-emergency-profile"
import { Logo } from "@/components/Logo"
import { ThemeToggle } from "@/components/ThemeToggle"

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
        if (error.name !== 'AbortError') {
          alert(shareData.text);
        }
      }
    } else {
      alert(shareData.text);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 pb-24 transition-colors">
      <header className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <h1 className="text-xl font-black font-headline tracking-tighter text-primary uppercase">SOS LINK</h1>
        </div>
        <div className="flex items-center gap-2">
          {isTriggered && (
            <div className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full animate-pulse border border-accent/20">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[10px] font-bold uppercase tracking-widest">LIVE</span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 w-full flex flex-col items-center justify-center max-w-md mx-auto">
        {!isTriggered && countdown === null ? (
          <div className="space-y-12 text-center">
            <div className="relative group cursor-pointer" onClick={handleSOS}>
              <div className="absolute inset-[-30px] bg-accent/10 rounded-full animate-ping [animation-duration:3000ms]" />
              <div className="absolute inset-[-60px] bg-accent/5 rounded-full animate-ping [animation-duration:4000ms] delay-500" />
              
              <Button 
                size="lg"
                className="w-64 h-64 rounded-full bg-accent hover:bg-accent/90 shadow-[0_0_60px_rgba(250,128,114,0.4)] flex flex-col items-center justify-center gap-4 relative transition-all active:scale-95 border-[10px] border-white/30"
              >
                <ShieldAlert className="h-24 w-24 text-white" />
                <span className="text-4xl font-black text-white tracking-widest">TRIGGER SOS</span>
              </Button>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Immediate Response</h2>
              <p className="text-muted-foreground text-sm max-w-[300px] mx-auto font-medium">
                Hold the button to initiate a 5-second countdown to emergency alerting.
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
                  strokeWidth="14"
                  fill="transparent"
                  className="text-muted/10"
                />
                <circle
                  cx="144"
                  cy="144"
                  r="130"
                  stroke="currentColor"
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray={816}
                  strokeDashoffset={816 - (816 * (5 - countdown)) / 5}
                  className="text-accent transition-all duration-1000 linear stroke-cap-round"
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-9xl font-black text-accent leading-none tracking-tighter">{countdown}</span>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mt-4">Broadcast Pending</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={cancelSOS}
              className="px-12 py-10 rounded-2xl border-2 border-muted-foreground/20 text-muted-foreground hover:bg-muted font-bold text-xl flex gap-3 group"
            >
              <X className="h-7 w-7 group-hover:rotate-90 transition-transform" />
              CANCEL ALERT
            </Button>
          </div>
        ) : (
          <div className="w-full space-y-6 animate-in slide-in-from-bottom-12 duration-700">
            <Card className="border-accent bg-accent/5 overflow-hidden shadow-2xl border-2 rounded-3xl">
              <CardContent className="p-8 space-y-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-accent p-5 rounded-full shadow-xl shadow-accent/30">
                    <AlertTriangle className="h-12 w-12 text-white animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-accent uppercase tracking-tighter leading-none">SOS BROADCASTING</h2>
                    <p className="text-xs font-bold text-accent/70 uppercase tracking-widest mt-2">Precision Location Signal Sent</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button className="flex flex-col gap-2 h-auto py-6 bg-accent text-white hover:bg-accent/90 rounded-2xl border-b-4 border-accent/20">
                    <Phone className="h-8 w-8" />
                    <span className="text-[10px] font-black uppercase">Call Emergency</span>
                  </Button>
                  <Button 
                    className="flex flex-col gap-2 h-auto py-6 bg-primary text-white hover:bg-primary/90 rounded-2xl border-b-4 border-primary/20" 
                    onClick={handleShareLocation}
                  >
                    <Share2 className="h-8 w-8" />
                    <span className="text-[10px] font-black uppercase">Direct Share GPS</span>
                  </Button>
                </div>

                <div className="bg-background rounded-2xl p-6 text-left border-2 space-y-4 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <MapPin className="h-4 w-4" />
                      <span className="text-[10px] uppercase tracking-widest font-black">Satellite Fix</span>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  {location ? (
                    <div className="space-y-1">
                      <p className="font-mono text-2xl font-black tracking-tighter text-foreground">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black">Accuracy: Sub-Meter Level</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                      <p className="text-xs text-muted-foreground italic font-medium uppercase tracking-widest">Acquiring Precise GPS...</p>
                    </div>
                  )}
                  
                  <div className="pt-5 border-t-2 border-dashed mt-5">
                    <p className="text-[10px] text-muted-foreground uppercase font-black mb-3">Emergency Identity Attached</p>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-xl font-black uppercase leading-none text-foreground">{profile?.fullName || "Unidentified User"}</p>
                        <p className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-lg inline-block mt-2">
                          Blood: {profile?.bloodGroup || "N/A"}
                        </p>
                      </div>
                      <ShieldAlert className="h-10 w-10 text-primary/10" />
                    </div>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  className="text-xs font-bold text-muted-foreground hover:text-accent transition-colors" 
                  onClick={cancelSOS}
                >
                  TERMINATE DISTRESS SIGNAL
                </Button>
              </CardContent>
            </Card>
            
            <Button variant="secondary" className="w-full h-16 rounded-2xl font-black text-lg flex gap-3 border-2 border-primary/10 hover:bg-primary/5 transition-all shadow-lg">
              <Volume2 className="h-7 w-7" />
              ACTIVATE SONIC BEACON
            </Button>
          </div>
        )}
      </div>

      {!isTriggered && countdown === null && (
        <div className="flex items-center gap-3 px-6 text-muted-foreground max-w-sm text-center font-bold text-[10px] uppercase tracking-[0.1em] opacity-60">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Automatic broadcast of GPS and medical profile to nearest rescue coordination hub.</span>
        </div>
      )}

      <Navigation />
    </div>
  )
}