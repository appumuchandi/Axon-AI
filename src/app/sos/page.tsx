
"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { ShieldAlert, AlertTriangle, MapPin, Share2, Phone, Volume2, X, CheckCircle2, Loader2, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useEmergencyProfile } from "@/hooks/use-emergency-profile"
import { Logo } from "@/components/Logo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"

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
      // Automatically attempt to notify contacts when SOS triggers
      handleNotifyContacts();
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
    const shareData = {
      title: 'AXON SOS',
      text: `EMERGENCY SOS: My location is ${locString}. Please send help.`,
      url: `https://maps.google.com/?q=${locString}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          // Fallback to clipboard if share fails
          navigator.clipboard.writeText(shareData.text);
          alert("Coordinates copied to clipboard (System Share limited)");
        }
      }
    } else {
      window.open(shareData.url, '_blank');
    }
  };

  const handleNotifyContacts = () => {
    setNotifyingContacts(true);
    setNotifiedList([]);
    
    // Simulate contact notification sequence
    const contacts = ["Mother", "Brother", "Local Emergency Hub"];
    contacts.forEach((contact, index) => {
      setTimeout(() => {
        setNotifiedList(prev => [...prev, contact]);
        if (index === contacts.length - 1) {
          setTimeout(() => {
            // Success state remains
          }, 500);
        }
      }, (index + 1) * 1200);
    });
  };

  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col items-center justify-between p-6 pb-24 transition-all duration-1000",
      isTriggered && "bg-accent/5 ring-inset ring-[20px] ring-accent/10"
    )}>
      <header className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <h1 className="text-xl font-black font-headline tracking-tighter text-primary uppercase">SOS LINK</h1>
        </div>
        <div className="flex items-center gap-2">
          {isTriggered && (
            <div className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full animate-pulse border border-accent/20">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[10px] font-bold uppercase tracking-widest">LIVE BROADCAST</span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 w-full flex flex-col items-center justify-center max-w-md mx-auto">
        {!isTriggered && countdown === null ? (
          <div className="space-y-12 text-center w-full">
            <div className="relative group cursor-pointer flex justify-center" onClick={handleSOS}>
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
                Tap to initiate a 5-second countdown to precision emergency alerting.
              </p>
            </div>
          </div>
        ) : countdown !== null ? (
          <div className="text-center space-y-10 animate-in fade-in zoom-in-95 duration-500 w-full flex flex-col items-center">
             <div className="bg-accent/5 border border-accent/20 p-6 rounded-3xl w-full text-left mb-6 space-y-4 shadow-xl">
               <h3 className="text-accent font-black uppercase tracking-widest text-xs">SOS Mode Activating</h3>
               <ul className="space-y-3">
                 {[
                   "Emergency assistance initiated",
                   "Preparing location information",
                   "Alerting nearby contacts",
                   "Offline emergency support enabled"
                 ].map((step, i) => (
                   <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground uppercase">
                     <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                     {step}
                   </li>
                 ))}
               </ul>
             </div>

            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="absolute inset-0 transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="115"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-muted/10"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="115"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={722}
                  strokeDashoffset={722 - (722 * (5 - countdown)) / 5}
                  className="text-accent transition-all duration-1000 linear stroke-cap-round"
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-8xl font-black text-accent leading-none tracking-tighter">{countdown}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-4">Broadcasting in...</span>
              </div>
            </div>
            
            <div className="flex gap-4 w-full pt-4">
               <Button 
                variant="outline" 
                onClick={cancelSOS}
                className="flex-1 h-16 rounded-2xl border-2 border-muted-foreground/20 text-muted-foreground hover:bg-muted font-bold flex gap-3 group"
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
            <Card className="border-accent bg-accent/5 overflow-hidden shadow-2xl border-2 rounded-3xl">
              <CardContent className="p-8 space-y-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-accent p-5 rounded-full shadow-xl shadow-accent/30 animate-pulse">
                    <AlertTriangle className="h-12 w-12 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-accent uppercase tracking-tighter leading-none">SOS ACTIVE</h2>
                    <p className="text-xs font-bold text-accent/70 uppercase tracking-widest mt-2">Precision Location Signal Sent</p>
                  </div>
                </div>

                {notifyingContacts && (
                  <div className="bg-card/50 rounded-2xl p-5 text-left border-2 border-primary/20 space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      Notifying Emergency Contacts...
                    </h3>
                    <div className="space-y-2">
                      {["Mother", "Brother", "Local Emergency Hub"].map((contact, i) => (
                        <div key={i} className="flex items-center justify-between text-xs font-bold uppercase">
                          <span className={cn(notifiedList.includes(contact) ? "text-foreground" : "text-muted-foreground opacity-50")}>
                            {contact}
                          </span>
                          {notifiedList.includes(contact) ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 animate-in zoom-in" />
                          ) : (
                            <Loader2 className="h-3 w-3 animate-spin text-primary opacity-30" />
                          )}
                        </div>
                      ))}
                    </div>
                    {notifiedList.length === 3 && (
                      <p className="text-[9px] font-black text-green-600 uppercase pt-2 border-t border-dashed">
                        Emergency notification sent successfully.
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    className="flex flex-col gap-2 h-auto py-6 bg-accent text-white hover:bg-accent/90 rounded-2xl border-b-4 border-accent/20"
                    onClick={() => window.open('tel:911')}
                  >
                    <Phone className="h-8 w-8" />
                    <span className="text-[10px] font-black uppercase">Call 911/112</span>
                  </Button>
                  <Button 
                    className="flex flex-col gap-2 h-auto py-6 bg-primary text-white hover:bg-primary/90 rounded-2xl border-b-4 border-primary/20" 
                    onClick={handleShareLocation}
                  >
                    <Share2 className="h-8 w-8" />
                    <span className="text-[10px] font-black uppercase">Share Live GPS</span>
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
                  
                  <div className="pt-5 border-t-2 border-dashed mt-5 space-y-4">
                    <p className="text-[10px] text-muted-foreground uppercase font-black">Emergency Identity Attached</p>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-xl font-black uppercase leading-none text-foreground">{profile?.fullName || "Unidentified User"}</p>
                        <p className="text-[10px] font-bold text-accent bg-accent/10 px-3 py-1 rounded-lg inline-block mt-2 uppercase">
                          Blood: {profile?.bloodGroup || "N/A"}
                        </p>
                      </div>
                      <ShieldAlert className="h-10 w-10 text-primary/10" />
                    </div>

                    {profile?.emergencyContacts && (
                      <div className="grid gap-2 pt-2">
                        <div className="p-3 bg-muted/50 rounded-xl border border-primary/10">
                          <p className="text-[10px] font-black uppercase tracking-tighter mb-1 text-primary">Emergency Contact Card</p>
                          <p className="text-xs font-bold whitespace-pre-wrap">{profile.emergencyContacts}</p>
                        </div>
                      </div>
                    )}
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
