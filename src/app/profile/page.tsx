
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
import { User, HeartPulse, ShieldAlert, Phone, Languages, Save, Loader2, CheckCircle, LogIn, LogOut, CloudSync } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

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
    }
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      updateProfile(formData);
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      toast({
        title: "Profile Updated",
        description: isAuthenticated 
          ? "Your emergency info is synced to the cloud and stored locally." 
          : "Your emergency info is stored locally for offline use.",
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
          <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Emergency Profile</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mt-1">
            {isAuthenticated 
              ? "Cloud synchronization is active. Data is secured and rescue-ready." 
              : "Local storage active. Sign in to enable secure cloud sync across devices."}
          </p>
        </div>
        {isAuthenticated ? (
          <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 border-primary/20">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        ) : (
          <Link href="/login">
            <Button size="sm" className="gap-2">
              <LogIn className="h-4 w-4" /> Sign In
            </Button>
          </Link>
        )}
      </header>

      {isAuthenticated && (
        <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
          <CloudSync className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Real-time Cloud Encryption Active</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader className="pb-3 border-b mb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                placeholder="Enter legal name"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select 
                  value={formData.bloodGroup} 
                  onValueChange={(val) => setFormData({...formData, bloodGroup: val})}
                >
                  <SelectTrigger id="bloodGroup">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Emergency Language</Label>
                <Select 
                  value={formData.preferredLanguage} 
                  onValueChange={(val) => setFormData({...formData, preferredLanguage: val})}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {["English", "Spanish", "French", "German", "Japanese", "Hindi"].map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 border-b mb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-accent" />
              Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea 
                id="allergies" 
                placeholder="List medications, foods, or environmental allergies"
                value={formData.allergies}
                onChange={(e) => setFormData({...formData, allergies: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conditions">Medical Conditions</Label>
              <Textarea 
                id="conditions" 
                placeholder="Diabetes, Asthma, Heart conditions, etc."
                value={formData.medicalConditions}
                onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 border-b mb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contacts">Contact Details</Label>
              <Textarea 
                id="contacts" 
                placeholder="Name - Relationship - Phone Number"
                className="min-h-[100px]"
                value={formData.emergencyContacts}
                onChange={(e) => setFormData({...formData, emergencyContacts: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          disabled={isSaving}
          className={`w-full h-14 text-lg font-bold rounded-xl transition-all ${
            savedSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Secure Saving...
            </>
          ) : savedSuccess ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Protocol Saved
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Update Emergency Identity
            </>
          )}
        </Button>
      </form>

      <Navigation />
    </div>
  )
}
