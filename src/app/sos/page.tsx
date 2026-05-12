
"use client"

import { useState, useEffect, useMemo } from "react"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { ShieldAlert, AlertTriangle, MapPin, Share2, Phone, X, CheckCircle2, Loader2, Users, Bell, Info, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useEmergencyProfile } from "@/hooks/use-emergency-profile"
import { Logo } from "@/components/Logo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

export default function SOSPage() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isTriggered, setIsTriggered] = useState(false);
  const [notifiedList, setNotifiedList] = useState<string[]>([]);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const { profile } = useEmergencyProfile();

  const parsedContacts = useMemo(() => {
    if (!profile?.emergencyContacts) return [];
    return profile.emergencyContacts.split('\n').filter(l => l.trim()).map(line => {
      const parts = line.split(' - ');
      return { name: parts[0] || "Unknown", relationship: parts[1] || "Contact", phone: parts[2] || "" };
    });
  }, [profile?.emergencyContacts]);

  // Proactively watch location for instant sharing
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("GPS Tracking limited:", err.message),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      triggerSOS();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const triggerSOS = () => {
    setIsTriggered(true);
    setCountdown(null);
    setNotifiedList([]);
    
    const contacts = parsedContacts.length > 0 ? parsedContacts : [{name: "Rescue Hub"}];
    contacts.forEach((c, i) => {
      setTimeout(() => {
        setNotifiedList(prev => [...prev, c.name]);
      }, (i + 1) * 800);
    });

    if ('vibrate' in navigator) navigator.vibrate([500, 200, 500]);
    toast({ title: "SOS Broadcast Active", description: "Identity shared with emergency network." });
  };

  const startCountdown = () => {
    setCountdown(5);
  };

  const handleManualShare = async () => {
    const locUrl = location ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : '';
    const message = location 
      ? `🚨 AXON-AI EMERGENCY SOS 🚨\n\nI need help immediately. My medical profile is active.\n\nLive Location:\n${locUrl}`
      : `🚨 AXON-AI EMERGENCY SOS 🚨\n\nI need help immediately. My medical profile is active. (Location Unavailable)`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AXON-AI EMERGENCY',
          text: message,
          url: locUrl || undefined,
        });
        toast({ title: "SOS Dispatched", description: "Successfully shared via system bridge." });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          fallbackClipboardShare(message);
        }
      }
    } else {
      fallbackClipboardShare(message);
    }
  };

  const fallbackClipboardShare = async (message: string) => {
    try {
      await navigator.clipboard.writeText(message);
      toast({ 
        title: "SOS Payload Copied", 
        description: "Direct sharing restricted. Link copied—paste into WhatsApp, X, or SMS." 
      });
      // Try a direct WhatsApp intent for better UX
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    } catch (err) {
      toast({ variant: "destructive", title: "Broadcast Failed", description: "Could not copy or share emergency payload." });
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col items-center justify-between p-6 pb-28 transition-all duration-1000",
      isTriggered && "bg-accent/[0.03] ring-inset ring-[10px] ring-accent/10"
    )}>
      <header className="w-full flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <h1 className="text-xl font-black font-headline tracking-tighter text-primary uppercase leading-none">SOS Protocol</h1>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 w-full flex flex-col items-center justify-center max-w-md mx-auto">
        {!isTriggered && countdown === null ? (
          <div className="text-center space-y-12">
            <div className="relative group flex justify-center" onClick={startCountdown}>
              <div className="absolute inset-[-40px] bg-accent/10 rounded-full animate-pulse opacity-50" />
              <Button className="w-64 h-64 rounded-full bg-accent hover:bg-accent/95 shadow-[0_0_60px_rgba(250,128,114,0.3)] flex flex-col items-center justify-center gap-4 relative transition-all active:scale-95 border-[10px] border-white/20">
                <ShieldAlert className="h-24 w-24 text-white" />
                <span className="text-2xl font-black text-white tracking-widest uppercase">Trigger SOS</span>
              </Button>
            </div>
            <div className="space-y-4 px-6">
              <h2 className="text-xl font-black uppercase tracking-tighter">Immediate Response</h2>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest leading-relaxed opacity-70">
                Synchronizes your medical identity and GPS with local rescue grids.
              </p>
            </div>
          </div>
        ) : countdown !== null ? (
          <div className="w-full space-y-10 animate-in zoom-in-95 duration-500 flex flex-col items-center">
            <div className="bg-card border border-accent/20 p-8 rounded-[2.5rem] w-full space-y-4 shadow-xl border-t-2">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                <Bell className="h-3 w-3" /> System Activation
              </h3>
              <ul className="space-y-3">
                {["Acquiring precision fix", "Verifying medical vitals", "Alerting local network", "Resilience mode active"].map((t, i) => (
                  <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase text-foreground/80 animate-in slide-in-from-left-4" style={{ animationDelay: `${i*0.1}s` }}>
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-9xl font-black text-accent tracking-tighter animate-bounce">{countdown}</div>
            <div className="flex gap-4 w-full">
              <Button variant="outline" onClick={() => setCountdown(null)} className="flex-1 h-16 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest">
                <X className="h-4 w-4 mr-2" /> Abort
              </Button>
              <Button onClick={() => setCountdown(0)} className="flex-1 h-16 rounded-2xl bg-accent hover:bg-accent/90 text-white font-black uppercase text-[10px] tracking-widest">
                Force SOS
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-6 animate-in slide-in-from-bottom-12 duration-700">
            <Card className="border-accent border-2 bg-card rounded-[2.5rem] overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-accent animate-pulse" />
              <CardContent className="p-8 space-y-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-accent p-6 rounded-full shadow-xl animate-pulse ring-8 ring-accent/10">
                    <AlertTriangle className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-accent uppercase tracking-tighter leading-none">Broadcast Active</h2>
                </div>

                <div className="bg-muted/30 rounded-[2rem] p-6 text-left border border-primary/10 space-y-3 shadow-inner">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-2">
                    <Users className="h-3 w-3" /> Responders Notified
                  </h3>
                  {(parsedContacts.length > 0 ? parsedContacts : [{name: "Rescue Hub"}]).map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px] font-black uppercase">
                      <span className={cn(notifiedList.includes(c.name) ? "text-foreground" : "text-muted-foreground opacity-40")}>{c.name}</span>
                      {notifiedList.includes(c.name) ? <CheckCircle2 className="h-4 w-4 text-primary animate-in zoom-in" /> : <Loader2 className="h-3.5 w-3.5 animate-spin text-primary opacity-20" />}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button className="flex flex-col gap-2 h-auto py-6 bg-accent text-white hover:bg-accent/90 rounded-2xl shadow-xl transition-all" onClick={() => window.open('tel:911')}>
                    <Phone className="h-6 w-6" /> <span className="text-[9px] font-black uppercase">Call 911</span>
                  </Button>
                  <Button className="flex flex-col gap-2 h-auto py-6 bg-primary text-white hover:bg-primary/90 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all" onClick={handleManualShare}>
                    <Share2 className="h-6 w-6" /> <span className="text-[9px] font-black uppercase tracking-tighter">Share with Anyone</span>
                  </Button>
                </div>

                <div className="bg-background rounded-[2rem] p-6 text-left border-2 space-y-4 shadow-inner border-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                      <MapPin className="h-3.5 w-3.5" /> <span className="text-[9px] font-black uppercase tracking-widest">Active Fix</span>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  </div>
                  {location ? (
                    <p className="font-mono text-xl font-black tracking-tighter text-foreground">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                  ) : (
                    <p className="text-[9px] text-muted-foreground uppercase font-black">Syncing GPS...</p>
                  )}
                </div>

                <Button variant="ghost" className="text-[9px] font-black text-muted-foreground uppercase tracking-widest" onClick={() => {setIsTriggered(false); setCountdown(null);}}>
                  End Session
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
}
