"use client"

import { useState, useEffect, useMemo } from "react"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { ShieldAlert, AlertTriangle, MapPin, Share2, Phone, X, CheckCircle2, Loader2, Users, Bell, MessageSquare, ShieldCheck, ArrowRight, RadioTower, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useEmergencyProfile } from "@/hooks/use-emergency-profile"
import { Logo } from "@/components/Logo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

export default function SOSPage() {
  const [step, setStep] = useState<'idle' | 'confirm' | 'init' | 'active'>('idle');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [notifiedList, setNotifiedList] = useState<string[]>([]);
  const { profile } = useEmergencyProfile();

  const parsedContacts = useMemo(() => {
    if (!profile?.emergencyContacts) return [];
    return profile.emergencyContacts.split('\n').filter(l => l.trim()).map(line => {
      const parts = line.split(' - ');
      return { 
        name: parts[0] || "Unknown Identity", 
        relationship: parts[1] || "Rescue Contact", 
        phone: parts[2] || "" 
      };
    });
  }, [profile?.emergencyContacts]);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        null,
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const triggerInitialization = () => {
    setStep('init');
    setTimeout(() => {
      setStep('active');
      if ('vibrate' in navigator) navigator.vibrate([500, 200, 500, 200, 500]);
    }, 2500);
  };

  const getSOSMessage = () => {
    const locUrl = location ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : '';
    const medicalBrief = profile ? `\n\nName: ${profile.fullName}\nBlood: ${profile.bloodGroup}\nAllergies: ${profile.allergies || 'None'}` : '';
    return `🚨 AXON-AI EMERGENCY ALERT 🚨\n\nI need urgent assistance. My emergency profile is active.${medicalBrief}\n\nLast known location:\n${locUrl || 'Acquiring GPS...'}\n\nPlease contact me immediately.`;
  };

  const handleShare = async () => {
    const message = getSOSMessage();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'AXON-AI SOS', text: message });
      } catch (err) {
        fallbackCopy(message);
      }
    } else {
      fallbackCopy(message);
    }
  };

  const fallbackCopy = async (message: string) => {
    await navigator.clipboard.writeText(message);
    toast({ title: "SOS Payload Copied", description: "Paste into any app to alert others." });
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const dispatchToContact = (phone: string, name: string) => {
    const message = getSOSMessage();
    const smsUrl = `sms:${phone}${navigator.userAgent.match(/iPhone/i) ? '&' : '?'}body=${encodeURIComponent(message)}`;
    window.open(smsUrl, '_blank');
    setNotifiedList(prev => Array.from(new Set([...prev, name])));
  };

  return (
    <div className={cn(
      "min-h-screen bg-background p-6 pb-32 flex flex-col transition-all duration-1000",
      step === 'active' && "bg-accent/[0.03] ring-inset ring-[16px] ring-accent/10"
    )}>
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <h1 className="text-xl font-black tracking-tighter text-primary uppercase">SOS Command</h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        {step === 'idle' && (
          <div className="text-center space-y-12 animate-in zoom-in-95 duration-500">
            <div className="relative group flex justify-center" onClick={() => setStep('confirm')}>
              <div className="absolute inset-[-60px] bg-accent/10 rounded-full animate-pulse opacity-50" />
              <Button className="w-64 h-64 rounded-full bg-accent hover:bg-accent/95 shadow-[0_0_80px_rgba(250,128,114,0.3)] flex flex-col items-center justify-center gap-4 border-[14px] border-white/20 transition-all active:scale-95 group-hover:scale-105">
                <ShieldAlert className="h-24 w-24 text-white" />
                <span className="text-2xl font-black text-white tracking-widest uppercase">Trigger SOS</span>
              </Button>
            </div>
            <div className="space-y-3 px-8">
              <h2 className="text-xl font-black uppercase tracking-tighter">Emergency Activation</h2>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                Single tap initiates emergency broadcast to saved rescue contacts.
              </p>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="w-full space-y-10 text-center animate-in slide-in-from-bottom-12 duration-500">
            <div className="bg-card border-2 border-accent/20 p-10 rounded-[3rem] shadow-2xl space-y-8">
              <div className="bg-accent/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto">
                <AlertTriangle className="h-10 w-10 text-accent animate-pulse" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-accent uppercase tracking-tighter">Confirm Emergency?</h2>
                <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
                  AXON-AI will broadcast your live location and medical identity to your rescue network immediately.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Button onClick={triggerInitialization} className="h-16 rounded-[1.5rem] bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/20">
                  <ShieldCheck className="h-5 w-5 mr-3" /> Initiate Dispatch
                </Button>
                <Button variant="ghost" onClick={() => setStep('idle')} className="h-14 font-black uppercase text-[10px] tracking-widest">
                  Cancel Protocol
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'init' && (
          <div className="w-full space-y-8 animate-in zoom-in-95 duration-700 flex flex-col items-center">
            <div className="bg-card border p-10 rounded-[3rem] w-full space-y-6 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 right-0 h-1 bg-primary animate-pulse" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                  <Sparkles className="h-4 w-4" /> System Readiness
               </h3>
               <ul className="space-y-4">
                  {[
                    { label: "Acquiring GPS Precision", icon: MapPin },
                    { label: "Verifying Grid Connectivity", icon: RadioTower },
                    { label: "Preparing Medical Identity", icon: Users },
                    { label: "Establishing Secure Mesh", icon: ShieldCheck }
                  ].map((t, i) => (
                    <li key={i} className="flex items-center gap-4 text-[11px] font-black uppercase animate-in slide-in-from-left-6" style={{ animationDelay: `${i*0.15}s` }}>
                      <t.icon className="h-4 w-4 text-primary" /> {t.label}
                      <Loader2 className="h-3 w-3 ml-auto animate-spin opacity-50" />
                    </li>
                  ))}
               </ul>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-[loading_2.5s_ease-in-out_forwards]" />
            </div>
          </div>
        )}

        {step === 'active' && (
          <div className="w-full space-y-6 animate-in slide-in-from-bottom-12 duration-1000">
            <Card className="border-accent border-4 bg-card rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(250,128,114,0.2)] relative">
              <div className="absolute top-0 left-0 right-0 h-2 bg-accent animate-pulse" />
              <CardContent className="p-10 space-y-8">
                <div className="text-center space-y-4">
                  <div className="bg-accent p-6 rounded-[2rem] w-fit mx-auto shadow-xl ring-8 ring-accent/10 animate-pulse">
                    <ShieldAlert className="h-14 w-14 text-white" />
                  </div>
                  <h2 className="text-4xl font-black text-accent uppercase tracking-tighter">Broadcast Active</h2>
                </div>

                <div className="bg-muted/30 rounded-[2.5rem] p-7 border border-primary/5 space-y-5">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-3">
                    <Users className="h-4 w-4" /> Rescue Network
                  </h3>
                  <div className="space-y-4">
                    {parsedContacts.length > 0 ? (
                      parsedContacts.map((c, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[12px] font-black uppercase text-foreground">{c.name}</span>
                            <span className="text-[8px] opacity-60 font-black uppercase tracking-tight">{c.relationship} • {c.phone}</span>
                          </div>
                          <Button 
                            variant="outline" size="sm" onClick={() => dispatchToContact(c.phone, c.name)}
                            className={cn(
                              "h-10 rounded-xl px-5 text-[9px] font-black uppercase tracking-widest",
                              notifiedList.includes(c.name) ? "border-green-500 text-green-500" : "border-primary text-primary hover:bg-primary/5"
                            )}
                          >
                            {notifiedList.includes(c.name) ? "Notified" : "Dispatch"}
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-center font-black uppercase opacity-40">No rescue contacts initialized.</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button className="h-20 bg-accent hover:bg-accent/90 text-white rounded-[1.5rem] flex flex-col gap-1 shadow-xl" onClick={() => window.open('tel:911')}>
                    <Phone className="h-6 w-6" /> <span className="text-[9px] font-black uppercase">Emergency 911</span>
                  </Button>
                  <Button className="h-20 bg-primary hover:bg-primary/90 text-white rounded-[1.5rem] flex flex-col gap-1 shadow-xl shadow-primary/20" onClick={handleShare}>
                    <Share2 className="h-6 w-6" /> <span className="text-[9px] font-black uppercase">Share With Anyone</span>
                  </Button>
                </div>

                <div className="bg-background rounded-[2.5rem] p-7 border-2 border-muted/20 space-y-4 text-center">
                   <div className="flex items-center justify-between text-primary mb-2">
                      <MapPin className="h-4 w-4" /> <span className="text-[9px] font-black uppercase tracking-widest">Live GPS Signal</span>
                      <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
                   </div>
                   {location ? (
                    <p className="font-mono text-2xl font-black tracking-tighter">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                   ) : (
                    <p className="text-[10px] font-black uppercase animate-pulse">Locking Signal...</p>
                   )}
                </div>

                <Button variant="ghost" className="w-full text-[10px] font-black text-muted-foreground uppercase tracking-widest" onClick={() => setStep('idle')}>
                  Deactivate Protocol
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Navigation />
      <style jsx>{`
        @keyframes loading {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}
