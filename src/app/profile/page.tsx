"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { useEmergencyProfile, type EmergencyProfile } from "@/hooks/use-emergency-profile"
import { useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, HeartPulse, Phone, Save, Loader2, CheckCircle, LogIn, LogOut, Plus, Trash2, Contact, Users, Sparkles } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface ContactEntry {
  name: string;
  relationship: string;
  phone: string;
}

export default function ProfilePage() {
  const { profile, updateProfile, isLoading, isAuthenticated } = useEmergencyProfile();
  const auth = useAuth();
  
  const [formData, setFormData] = useState<EmergencyProfile>({
    fullName: "",
    bloodGroup: "",
    allergies: "",
    medicalConditions: "",
    emergencyContacts: "",
    preferredLanguage: "English"
  });

  const [contactList, setContactList] = useState<ContactEntry[]>([]);
  const [newContact, setNewContact] = useState<ContactEntry>({ name: "", relationship: "", phone: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        bloodGroup: profile.bloodGroup || "",
        allergies: profile.allergies || "",
        medicalConditions: profile.medicalConditions || "",
        emergencyContacts: profile.emergencyContacts || "",
        preferredLanguage: profile.preferredLanguage || "English"
      });

      if (profile.emergencyContacts) {
        const parsed = profile.emergencyContacts.split('\n').filter(l => l.trim()).map(line => {
          const parts = line.split(' - ');
          return {
            name: parts[0] || "",
            relationship: parts[1] || "Other",
            phone: parts[2] || ""
          };
        });
        setContactList(parsed);
      }
    }
  }, [profile]);

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast({ variant: "destructive", title: "Protocol Required", description: "Name and Phone are mission-critical fields." });
      return;
    }
    setContactList([...contactList, newContact]);
    setNewContact({ name: "", relationship: "", phone: "" });
    toast({ title: "Contact Staged", description: `${newContact.name} added to local list. Update profile to sync.` });
  };

  const removeContact = (index: number) => {
    setContactList(contactList.filter((_, i) => i !== index));
  };

  const pickFromContacts = async () => {
    if (!('contacts' in navigator && 'ContactsManager' in window)) {
      toast({ 
        title: "Intelligence Sync Unavailable", 
        description: "Your current browser does not support native contact syncing. Please enter details manually.",
        variant: "destructive"
      });
      return;
    }

    try {
      const props = ['name', 'tel'];
      const opts = { multiple: true };
      const contacts = await (navigator as any).contacts.select(props, opts);
      
      if (contacts && contacts.length > 0) {
        const mapped = contacts.map((c: any) => ({
          name: c.name?.[0] || "Unknown Identity",
          relationship: "Phone Contact",
          phone: c.tel?.[0] || ""
        }));
        setContactList(prev => [...prev, ...mapped]);
        toast({ title: "Intelligence Synced", description: `Successfully imported ${contacts.length} rescue contacts.` });
      }
    } catch (err) {
      console.warn("Contact picker access limited", err);
      toast({ variant: "destructive", title: "Access Limited", description: "Phone contact access was denied or cancelled." });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Stringify contacts for storage
    const contactString = contactList
      .map(c => `${c.name} - ${c.relationship} - ${c.phone}`)
      .join('\n');

    const updatedProfile = { ...formData, emergencyContacts: contactString };

    setTimeout(() => {
      updateProfile(updatedProfile);
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      toast({
        title: "Protocol Verified",
        description: isAuthenticated 
          ? "Identity synced across the Resilient Mesh." 
          : "Identity cached locally for offline resilience.",
      });
    }, 800);
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({ title: "Grid Link Closed", description: "Cloud synchronization deactivated." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "System Error", description: e.message });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Synchronizing Identity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-8 max-w-screen-xl mx-auto bg-background transition-colors duration-500">
      <header className="mb-8 flex justify-between items-start">
        <div className="max-w-[70%]">
          <h1 className="text-3xl font-black font-headline tracking-tighter text-primary uppercase leading-none">Identity Protocol</h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.15em] mt-2 opacity-70">
            {isAuthenticated 
              ? "Resilient Cloud Link: Active" 
              : "Offline Resilience: Engaged"}
          </p>
        </div>
        {isAuthenticated ? (
          <Button variant="outline" size="sm" onClick={handleSignOut} className="h-10 rounded-xl gap-2 border-primary/20 text-[10px] font-black uppercase tracking-widest hover:bg-primary/5">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        ) : (
          <Link href="/login">
            <Button size="sm" className="h-10 rounded-xl gap-2 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <LogIn className="h-4 w-4" /> Sign in
            </Button>
          </Link>
        )}
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Vitals */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden">
          <CardHeader className="pb-3 border-b border-muted/20 bg-muted/5">
            <CardTitle className="text-[12px] font-black uppercase tracking-widest flex items-center gap-3 text-primary">
              <User className="h-4 w-4" />
              Core Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Legal Full Name</Label>
              <Input 
                placeholder="Enter full name"
                className="h-12 rounded-xl border-muted/20 focus-visible:ring-primary font-bold text-[14px]"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Blood Group</Label>
                <Select 
                  value={formData.bloodGroup} 
                  onValueChange={(val) => setFormData({...formData, bloodGroup: val})}
                >
                  <SelectTrigger className="h-12 rounded-xl border-muted/20 font-bold">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-muted/20">
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                      <SelectItem key={bg} value={bg} className="font-bold">{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Primary Language</Label>
                <Select 
                  value={formData.preferredLanguage} 
                  onValueChange={(val) => setFormData({...formData, preferredLanguage: val})}
                >
                  <SelectTrigger className="h-12 rounded-xl border-muted/20 font-bold">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-muted/20">
                    {["English", "Spanish", "French", "German", "Japanese", "Hindi"].map(lang => (
                      <SelectItem key={lang} value={lang} className="font-bold">{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Resilience */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden">
          <CardHeader className="pb-3 border-b border-muted/20 bg-muted/5">
            <CardTitle className="text-[12px] font-black uppercase tracking-widest flex items-center gap-3 text-accent">
              <HeartPulse className="h-4 w-4" />
              Medical Survival Data
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Allergies & Contraindications</Label>
              <Textarea 
                placeholder="List medications, foods, or environmental triggers"
                className="rounded-xl border-muted/20 focus-visible:ring-accent min-h-[80px] font-bold text-[14px]"
                value={formData.allergies}
                onChange={(e) => setFormData({...formData, allergies: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Chronic Conditions</Label>
              <Textarea 
                placeholder="Diabetes, Asthma, Heart conditions, etc."
                className="rounded-xl border-muted/20 focus-visible:ring-accent min-h-[80px] font-bold text-[14px]"
                value={formData.medicalConditions}
                onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-card overflow-hidden">
          <CardHeader className="pb-3 border-b border-muted/20 bg-muted/5">
            <CardTitle className="text-[12px] font-black uppercase tracking-widest flex items-center gap-3 text-primary">
              <Phone className="h-4 w-4" />
              Rescue Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* Primary Action: Native Import */}
            <div className="space-y-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={pickFromContacts}
                className="w-full h-16 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-black uppercase tracking-[0.1em] text-[11px] hover:bg-primary/5 flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-sm group"
              >
                <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Users className="h-5 w-5" />
                </div>
                Import from Phone Contacts
                <Sparkles className="h-3 w-3 animate-pulse text-primary/60" />
              </Button>
              <p className="text-center text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60">— OR ENTER MANUALLY —</p>
            </div>

            <div className="space-y-4 bg-muted/10 p-5 rounded-[2rem] border border-dashed border-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="h-3 w-3 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Manual Protocol Entry</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="Full Name" 
                  value={newContact.name} 
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  className="rounded-xl border-muted/30 font-bold text-[13px] h-11"
                />
                <Input 
                  placeholder="Rel: Mother, Dr" 
                  value={newContact.relationship} 
                  onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                  className="rounded-xl border-muted/30 font-bold text-[13px] h-11"
                />
              </div>
              <div className="flex gap-3">
                <Input 
                  placeholder="Phone Number (+XX...)" 
                  value={newContact.phone} 
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  className="flex-1 rounded-xl border-muted/30 font-bold text-[13px] h-11"
                />
                <Button 
                  type="button" 
                  size="icon" 
                  onClick={handleAddContact}
                  className="rounded-xl shrink-0 bg-primary h-11 w-11 shadow-md hover:bg-primary/90 transition-all active:scale-90"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {contactList.map((contact, idx) => (
                <div key={idx} className="flex items-center justify-between bg-card p-4 rounded-2xl border border-muted/20 group animate-in slide-in-from-left-2 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-sm">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight text-foreground">{contact.name}</p>
                      <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.1em] mt-1 opacity-70">
                        {contact.relationship} • {contact.phone}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeContact(idx)}
                    className="h-8 w-8 text-muted-foreground hover:text-accent opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {contactList.length === 0 && (
                <div className="py-12 text-center border-2 border-dashed border-muted/10 rounded-[2rem]">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">No Rescue Contacts Initialized</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Global Save */}
        <Button 
          type="submit" 
          disabled={isSaving}
          className={`w-full h-20 text-[11px] font-black uppercase tracking-[0.25em] rounded-[2rem] shadow-2xl transition-all duration-700 active:scale-[0.98] ${
            savedSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90 shadow-primary/30'
          }`}
        >
          {isSaving ? (
            <div className="flex items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              Verifying Resilience Layer...
            </div>
          ) : savedSuccess ? (
            <div className="flex items-center gap-4">
              <CheckCircle className="h-6 w-6" />
              Identity Established
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Save className="h-6 w-6" />
              Update Identity Protocol
            </div>
          )}
        </Button>
      </form>

      <Navigation />
    </div>
  )
}
