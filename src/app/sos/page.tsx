
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
    
    // Simulate notification sequence
    const contacts = parsedContacts.length > 0 ? parsedContacts : [{name: "Rescue Hub"}];
    contacts.forEach((c, i) => {
      setTimeout(() => {
        setNotifiedList(prev => [...prev, c.name]);
      }, (i + 1) * 800);
    });

    if ('vibrate' in navigator) navigator.vibrate([500, 200, 500]);
    toast({ title: "SOS Broadcast Sent", description: "GPS and Medical Profile shared with emergency network." });
  };

  const startCountdown = () => {
    setCountdown(5);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        null, { enableHighAccuracy: true }
      );
    }
  };

  const handleShare = async () => {
    // Ensure we have location or try to get it again
    if (!location) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setLocation(newLoc);
            performNativeShare(newLoc);
          },
          () => {
            toast({ variant: "destructive", title: "GPS Error", description: "Could not acquire precise location for sharing." });
            performNativeShare(null);
          }
        );
        return;
      }
    }
    performNativeShare(location);
  };

  const performNativeShare = async (loc: {lat: number, lng: number} | null) => {
    const locUrl = loc ? `https://www.google.com/maps?q=${loc.lat},${loc.lng}` : 'https://www.google.com/maps';
    const message = `🚨 AXON-AI EMERGENCY SOS 🚨\n\nI need help immediately. My medical profile is active.\n\nLive Location:\n${locUrl}`;
    
    const shareData = {
      title: 'AXON-AI SOS BROADCAST',
      text: message,
      url: locUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({ title: "Identity Broadcasted", description: "SOS payload shared via system bridge." });
      } catch (e) {
        console.warn("Share protocol cancelled or limited", e);
      }
    } else {
      // Fallback for browsers without navigator.share
      try {
        await navigator.clipboard.writeText(message);
        toast({ title: "Protocol Copied", description: "SOS details copied to clipboard. Paste in any app (WhatsApp, Email, etc)." });
        window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
      } catch (err) {
        window.open(locUrl, '_blank');
      }
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
          <h1 className="text-xl font-black font-headline tracking-tighter text-primary uppercase">SOS Command</h1>
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
            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-tighter">Emergency Deployment</h2>
              <p className="text-muted-foreground text-[11px] font-black uppercase tracking-widest leading-relaxed max-w-[260px] mx-auto opacity-70">
                Precision broadcast of your location and medical profile to rescue hubs.
              </p>
            </div>
          </div>
        ) : countdown !== null ? (
          <div className="w-full space-y-10 animate-in zoom-in-95 duration-500 flex flex-col items-center">
            <div className="bg-card border border-accent/20 p-8 rounded-[2.5rem] w-full space-y-4 shadow-xl border-t-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                <Bell className="h-3 w-3" /> SOS Mode Activating
              </h3>
              <ul className="space-y-3">
                {["Emergency initiated", "Locating precision GPS", "Alerting rescue mesh", "Offline modes engaged"].map((t, i) => (
                  <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase text-foreground/80 animate-in slide-in-from-left-4" style={{ animationDelay: `${i*0.1}s` }}>
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-9xl font-black text-accent tracking-tighter animate-bounce">{countdown}</div>
            <div className="flex gap-4 w-full">
              <Button variant="outline" onClick={() => setCountdown(null)} className="flex-1 h-16 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest">
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
              <Button onClick={() => setCountdown(0)} className="flex-1 h-16 rounded-2xl bg-accent hover:bg-accent/90 text-white font-black uppercase text-[10px] tracking-widest">
                Send Now
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
                  <h2 className="text-3xl font-black text-accent uppercase tracking-tighter leading-none">SOS Activated</h2>
                </div>

                <div className="bg-muted/30 rounded-[2rem] p-6 text-left border border-primary/10 space-y-3 shadow-inner">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-2">
                    <Users className="h-3 w-3" /> Notifying Emergency Network
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
                  <Button className="flex flex-col gap-2 h-auto py-6 bg-primary text-white hover:bg-primary/90 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all" onClick={handleShare}>
                    <Share2 className="h-6 w-6" /> <span className="text-[9px] font-black uppercase">Share With Anyone</span>
                  </Button>
                </div>

                <div className="bg-background rounded-[2rem] p-6 text-left border-2 space-y-4 shadow-inner border-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                      <MapPin className="h-3.5 w-3.5" /> <span className="text-[9px] font-black uppercase tracking-widest">Precision Fix</span>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  </div>
                  {location ? (
                    <p className="font-mono text-xl font-black tracking-tighter text-foreground">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                  ) : (
                    <p className="text-[9px] text-muted-foreground uppercase font-black">Acquiring GPS...</p>
                  )}
                  
                  <div className="pt-4 border-t border-dashed space-y-3">
                    <p className="text-[9px] text-muted-foreground uppercase font-black opacity-60">Identity Cards</p>
                    {parsedContacts.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 bg-muted/20 p-3 rounded-xl border border-primary/5">
                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-xs">👤</div>
                        <div className="text-left flex-1">
                          <p className="text-[10px] font-black uppercase leading-none">{c.name}</p>
                          <p className="text-[8px] text-muted-foreground font-black uppercase mt-1 opacity-70">{c.relationship} • {c.phone}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => c.phone && window.open(`tel:${c.phone}`)}>
                          <Phone className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="ghost" className="text-[9px] font-black text-muted-foreground uppercase tracking-widest" onClick={() => {setIsTriggered(false); setCountdown(null);}}>
                  Terminate SOS
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
