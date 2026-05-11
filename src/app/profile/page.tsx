"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { useEmergencyProfile, type EmergencyProfile } from "@/hooks/use-emergency-profile"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, HeartPulse, ShieldAlert, Phone, Languages, Save, Loader2, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { profile, updateProfile, isLoading } = useEmergencyProfile();
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
      setFormData(profile);
    }
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate slight delay for professional feel
    setTimeout(() => {
      updateProfile(formData);
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      toast({
        title: "Profile Updated",
        description: "Your emergency information is stored locally and rescue-ready.",
      });
    }, 800);
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
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Emergency Profile</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Critical data is stored locally on your device for offline access during emergencies.
        </p>
      </header>

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
              Syncing Locally...
            </>
          ) : savedSuccess ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Profile Saved
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Secure Save Profile
            </>
          )}
        </Button>
      </form>

      <Navigation />
    </div>
  )
}