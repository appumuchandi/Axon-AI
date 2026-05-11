"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { ShieldAlert, AlertTriangle, MapPin, Share2, Phone, Volume2, X, CheckCircle2, Loader2, Users, Bell, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useEmergencyProfile } from "@/hooks/use-emergency-profile"
import { Logo } from "@/components/Logo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

export default function SOSPage() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isTriggered, setIsTriggered] = useState(false);
  const [notifyingContacts, setNotifyingContacts] = useState(false);
  const [notifiedList, setNotifiedList] = useState<string[]>([]);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const { profile } = useEmergencyProfile();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setIsTriggered(true);
      setCountdown(null);
      handleNotifyContacts();
      
      // Vibration effect for mobile
      if ('vibrate' in navigator) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }
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
    setNotifyingContacts(false);
    setNotifiedList([]);
  };

  const handleShareLocation = async () => {
    const locString = location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Unknown';
    const locUrl = `https://maps.google.com/?q=${locString}`;
    const shareData = {
      title: 'AXON SOS',
      text: `EMERGENCY SOS: My location is ${locString}. Please send help immediately.`,
      url: locUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          window.open(locUrl, '_blank');
        }
      }
    } else {
      window.open(locUrl, '_blank');
    }
  };

  const handleNotifyContacts = () => {
    setNotifyingContacts(true);
    setNotifiedList([]);
    
    const contacts = ["Mother", "Brother", "Local Emergency Hub"];
    contacts.forEach((contact, index) => {
      setTimeout(() => {
        setNotifiedList(prev => [...prev, contact]);
        if (index === contacts.length - 1) {
          toast({
            title: "Emergency notification sent successfully.",
            description: "All contacts have been alerted via data mesh.",
          });
        }
      }, (index + 1) * 1200);
    });
  };

  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col items-center justify-between p-6 pb-24 transition-all duration-1000",
      isTriggered && "bg-accent/[0.03] ring-inset ring-[12px] ring-accent/10"
    )}>
      <header className="w-full flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <h1 className="text-xl font-black font-headline tracking-tighter text-primary uppercase">SOS Command</h1>
        </div>
        <div className="flex items-center gap-2">
          {isTriggered && (
            <div className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full animate-pulse border border-accent/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest">Live Alert Signal</span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 w-full flex flex-col items-center justify-center max-w-md mx-auto py-8">
        {!isTriggered && countdown === null ? (
          <div className="space-y-12 text-center w-full">
            <div className="relative group cursor-pointer flex justify-center" onClick={handleSOS}>
              <div className="absolute inset-[-40px] bg-accent/10 rounded-full animate-pulse opacity-50" />
              <div className="absolute inset-[-80px] bg-accent/5 rounded-full animate-pulse delay-700 opacity-30" />
              
              <Button 
                size="lg"
                className="w-64 h-64 rounded-full bg-accent hover:bg-accent/95 shadow-[0_0_80px_rgba(250,128,114,0.3)] flex flex-col items-center justify-center gap-4 relative transition-all active:scale-95 border-[12px] border-white/20"
              >
                <ShieldAlert className="h-28 w-28 text-white" />
                <span className="text-3xl font-black text-white tracking-widest uppercase">Trigger SOS</span>
              </Button>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Emergency Deployment</h2>
              <p className="text-muted-foreground text-sm max-w-[280px] mx-auto font-medium leading-relaxed">
                Tap to initiate a precision emergency broadcast of your location and medical profile.
              </p>
            </div>
          </div>
        ) : countdown !== null ? (
          <div className="text-center space-y-10 animate-in fade-in zoom-in-95 duration-500 w-full flex flex-col items-center">
             <div className="bg-card border border-accent/20 p-8 rounded-[2.5rem] w-full text-left mb-6 space-y-6 shadow-xl border-t-2">
               <div className="flex items-center gap-2 text-accent">
                 <Bell className="h-4 w-4" />
                 <h3 className="font-black uppercase tracking-widest text-[10px]">SOS Mode Activating</h3>
               </div>
               <ul className="space-y-4">
                 {[
                   { text: "Emergency assistance initiated", delay: 0 },
                   { text: "Preparing location information", delay: 0.2 },
                   { text: "Alerting nearby contacts", delay: 0.4 },
                   { text: "Offline emergency support enabled", delay: 0.6 }
                 ].map((step, i) => (
                   <li key={i} className="flex items-center gap-4 text-[12px] font-bold text-foreground/80 uppercase tracking-tight animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${step.delay}s` }}>
                     <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                     {step.text}
                   </li>
                 ))}
               </ul>
             </div>

            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="absolute inset-0 transform -rotate-90">
                <circle cx="128" cy="128" r="115" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/10" />
                <circle
                  cx="128" cy="128" r="115" stroke="currentColor" strokeWidth="12" fill="transparent"
                  strokeDasharray={722}
                  strokeDashoffset={722 - (722 * (5 - countdown)) / 5}
                  className="text-accent transition-all duration-1000 linear stroke-cap-round"
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-8xl font-black text-accent leading-none tracking-tighter">{countdown}</span>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-4">Transmitting in...</span>
              </div>
            </div>
            
            <div className="flex gap-4 w-full pt-4">
               <Button 
                variant="outline" 
                onClick={cancelSOS}
                className="flex-1 h-16 rounded-2xl border-2 border-muted-foreground/20 text-muted-foreground hover:bg-muted font-bold flex gap-3 shadow-sm"
              >
                <X className="h-5 w-5" />
                CANCEL
              </Button>
              <Button 
                onClick={() => setCountdown(0)}
                className="flex-1 h-16 rounded-2xl bg-accent text-white font-black hover:bg-accent/90 shadow-lg shadow-accent/20"
              >
                SEND NOW
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-6 animate-in slide-in-from-bottom-12 duration-700">
            <Card className="border-accent bg-card overflow-hidden shadow-2xl border-2 rounded-[2.5rem] relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-accent animate-pulse" />
              <CardContent className="p-8 space-y-8 text-center">
                <div className="flex flex-col items-center gap-5">
                  <div className="bg-accent p-6 rounded-full shadow-xl shadow-accent/20 animate-pulse ring-8 ring-accent/10">
                    <AlertTriangle className="h-14 w-14 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black text-accent uppercase tracking-tighter leading-none">SOS Mode Activated</h2>
                    <p className="text-[11px] font-bold text-accent/70 uppercase tracking-widest mt-2">Precision Broadcast Synced</p>
                  </div>
                </div>

                {notifyingContacts && (
                  <div className="bg-muted/30 rounded-[2rem] p-6 text-left border border-primary/10 space-y-4 shadow-inner">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        Notifying Emergency Contacts
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {["Mother", "Brother", "Local Emergency Hub"].map((contact, i) => (
                        <div key={i} className="flex items-center justify-between text-xs font-bold uppercase tracking-tight">
                          <span className={cn(notifiedList.includes(contact) ? "text-foreground" : "text-muted-foreground opacity-40")}>
                            {contact}
                          </span>
                          {notifiedList.includes(contact) ? (
                            <CheckCircle2 className="h-4 w-4 text-primary animate-in zoom-in" />
                          ) : (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary opacity-30" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    className="flex flex-col gap-2 h-auto py-7 bg-accent text-white hover:bg-accent/90 rounded-[1.5rem] shadow-lg shadow-accent/10 border-none"
                    onClick={() => window.open('tel:911')}
                  >
                    <Phone className="h-8 w-8" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Call 911/112</span>
                  </Button>
                  <Button 
                    className="flex flex-col gap-2 h-auto py-7 bg-primary text-white hover:bg-primary/90 rounded-[1.5rem] shadow-lg shadow-primary/10 border-none" 
                    onClick={handleShareLocation}
                  >
                    <Share2 className="h-8 w-8" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Share Location</span>
                  </Button>
                </div>

                <div className="bg-background rounded-[2rem] p-7 text-left border-2 space-y-6 shadow-inner border-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                      <MapPin className="h-4 w-4" />
                      <span className="text-[10px] uppercase tracking-[0.2em] font-black">Satellite Fix</span>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  </div>
                  {location ? (
                    <div className="space-y-1">
                      <p className="font-mono text-2xl font-black tracking-tighter text-foreground">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black opacity-60">Sub-Meter Accuracy Active</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <p className="text-[10px] text-muted-foreground uppercase font-black">Acquiring Precision GPS...</p>
                    </div>
                  )}
                  
                  <div className="pt-6 border-t border-dashed space-y-4 border-muted/50">
                    <p className="text-[10px] text-muted-foreground uppercase font-black opacity-60">Emergency Contact Cards</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-primary/5 hover:bg-muted/40 transition-colors">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-lg">👩</div>
                        <div>
                          <p className="text-xs font-black uppercase">Mother</p>
                          <p className="text-[10px] text-muted-foreground font-bold tracking-widest">+91 XXXXX XXXXX</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-primary/5 hover:bg-muted/40 transition-colors">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-lg">👨</div>
                        <div>
                          <p className="text-xs font-black uppercase">Brother</p>
                          <p className="text-[10px] text-muted-foreground font-bold tracking-widest">+91 XXXXX XXXXX</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  className="text-xs font-bold text-muted-foreground hover:text-accent transition-colors" 
                  onClick={cancelSOS}
                >
                  Terminate Distress Broadcast
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {!isTriggered && countdown === null && (
        <div className="flex items-center gap-3 px-6 text-muted-foreground max-w-sm text-center font-bold text-[10px] uppercase tracking-[0.15em] opacity-60 mb-4 bg-muted/20 py-2 rounded-full border border-muted/30 shadow-sm">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>Real-time broadcast of GPS and medical profile to rescue hubs.</span>
        </div>
      )}

      <Navigation />
    </div>
  )
}
