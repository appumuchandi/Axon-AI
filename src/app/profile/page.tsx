
"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { useEmergencyProfile, type EmergencyProfile } from "@/hooks/use-emergency-profile"
import { useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, HeartPulse, ShieldAlert, Phone, Save, Loader2, CheckCircle, LogIn, LogOut, Cloud, Plus, Trash2, Contact } from "lucide-react"
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
  const [isPickerSupported, setIsPickerSupported] = useState(false);

  useEffect(() => {
    setIsPickerSupported('contacts' in navigator && 'ContactsManager' in window);
  }, []);

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

      // Parse contacts from the formatted string
      if (profile.emergencyContacts) {
        const parsed = profile.emergencyContacts.split('\n').filter(l => l.trim()).map(line => {
          const parts = line.split(' - ');
          return {
            name: parts[0] || "",
            relationship: parts[1] || "",
            phone: parts[2] || ""
          };
        });
        setContactList(parsed);
      }
    }
  }, [profile]);

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast({ variant: "destructive", title: "Missing Info", description: "Name and Phone are required." });
      return;
    }
    setContactList([...contactList, newContact]);
    setNewContact({ name: "", relationship: "", phone: "" });
  };

  const removeContact = (index: number) => {
    setContactList(contactList.filter((_, i) => i !== index));
  };

  const pickFromContacts = async () => {
    try {
      const props = ['name', 'tel'];
      const opts = { multiple: true };
      const contacts = await (navigator as any).contacts.select(props, opts);
      
      if (contacts.length > 0) {
        const mapped = contacts.map((c: any) => ({
          name: c.name?.[0] || "Unknown",
          relationship: "Other",
          phone: c.tel?.[0] || ""
        }));
        setContactList([...contactList, ...mapped]);
        toast({ title: "Contacts Added", description: `Successfully imported ${contacts.length} contacts.` });
      }
    } catch (err) {
      console.warn("Contact picker failed or cancelled", err);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Format the list back to a string for the database
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
        title: "Profile Updated",
        description: isAuthenticated 
          ? "Your emergency info is synced to the cloud." 
          : "Your emergency info is stored locally.",
      });
    }, 800);
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({ title: "Signed Out", description: "Cloud sync deactivated." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-8 max-w-screen-xl mx-auto">
      <header className="mb-8 flex justify-between items-start">
        <div className="max-w-[70%]">
          <h1 className="text-3xl font-black font-headline tracking-tighter text-primary uppercase">Identity Protocol</h1>
          <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest mt-1 opacity-70">
            {isAuthenticated 
              ? "Cloud Synchronization Active" 
              : "Local Resilience Mode Active"}
          </p>
        </div>
        {isAuthenticated ? (
          <Button variant="outline" size="sm" onClick={handleSignOut} className="h-10 rounded-xl gap-2 border-primary/20 text-[10px] font-black uppercase tracking-widest">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        ) : (
          <Link href="/login">
            <Button size="sm" className="h-10 rounded-xl gap-2 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90">
              <LogIn className="h-4 w-4" /> Sign In
            </Button>
          </Link>
        )}
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-none shadow-lg rounded-[2.5rem] bg-card overflow-hidden">
          <CardHeader className="pb-3 border-b border-muted/20 bg-muted/5">
            <CardTitle className="text-[12px] font-black uppercase tracking-widest flex items-center gap-3 text-primary">
              <User className="h-4 w-4" />
              Personal Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
              <Input 
                placeholder="Enter legal name"
                className="h-12 rounded-xl border-muted/20 focus-visible:ring-primary font-bold"
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
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Language</Label>
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

        <Card className="border-none shadow-lg rounded-[2.5rem] bg-card overflow-hidden">
          <CardHeader className="pb-3 border-b border-muted/20 bg-muted/5">
            <CardTitle className="text-[12px] font-black uppercase tracking-widest flex items-center gap-3 text-accent">
              <HeartPulse className="h-4 w-4" />
              Medical Vitals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Allergies</Label>
              <Textarea 
                placeholder="List medications, foods, or environmental triggers"
                className="rounded-xl border-muted/20 focus-visible:ring-accent min-h-[80px] font-bold"
                value={formData.allergies}
                onChange={(e) => setFormData({...formData, allergies: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Chronic Conditions</Label>
              <Textarea 
                placeholder="Diabetes, Asthma, Heart conditions, etc."
                className="rounded-xl border-muted/20 focus-visible:ring-accent min-h-[80px] font-bold"
                value={formData.medicalConditions}
                onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg rounded-[2.5rem] bg-card overflow-hidden">
          <CardHeader className="pb-3 border-b border-muted/20 bg-muted/5 flex flex-row items-center justify-between">
            <CardTitle className="text-[12px] font-black uppercase tracking-widest flex items-center gap-3 text-primary">
              <Phone className="h-4 w-4" />
              Emergency Contacts
            </CardTitle>
            {isPickerSupported && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={pickFromContacts}
                className="h-8 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary/20"
              >
                <Contact className="h-3 w-3 mr-2" />
                Sync Phone
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4 bg-muted/10 p-4 rounded-2xl border border-dashed border-muted/30">
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="Name" 
                  value={newContact.name} 
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  className="rounded-xl border-muted/30 font-bold text-[13px]"
                />
                <Input 
                  placeholder="Rel: Mother, Dr" 
                  value={newContact.relationship} 
                  onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                  className="rounded-xl border-muted/30 font-bold text-[13px]"
                />
              </div>
              <div className="flex gap-3">
                <Input 
                  placeholder="Phone Number" 
                  value={newContact.phone} 
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  className="flex-1 rounded-xl border-muted/30 font-bold text-[13px]"
                />
                <Button 
                  type="button" 
                  size="icon" 
                  onClick={handleAddContact}
                  className="rounded-xl shrink-0 bg-primary h-10 w-10 shadow-md"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {contactList.map((contact, idx) => (
                <div key={idx} className="flex items-center justify-between bg-muted/5 p-4 rounded-2xl border border-muted/20 group animate-in slide-in-from-left-2">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">{contact.name}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-70">
                        {contact.relationship} • {contact.phone}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeContact(idx)}
                    className="h-8 w-8 text-muted-foreground hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {contactList.length === 0 && (
                <div className="py-10 text-center border-2 border-dashed border-muted/10 rounded-3xl">
                  <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40">No rescue contacts listed</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          disabled={isSaving}
          className={`w-full h-16 text-xs font-black uppercase tracking-[0.2em] rounded-[1.5rem] shadow-xl transition-all duration-500 ${
            savedSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90 shadow-primary/20'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Verifying Resilience...
            </>
          ) : savedSuccess ? (
            <>
              <CheckCircle className="mr-3 h-5 w-5" />
              Protocol Established
            </>
          ) : (
            <>
              <Save className="mr-3 h-5 w-5" />
              Update Identity Protocol
            </>
          )}
        </Button>
      </form>

      <Navigation />
    </div>
  )
}
