
"use client"

import { useState } from "react"
import { useAuth } from "@/firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/Logo"
import { Loader2, Mail, Lock, ShieldCheck } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Auth Failed",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-2 border-primary/10 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl font-black font-headline tracking-tighter uppercase">
            {isLogin ? "Secure Access" : "Create Identity"}
          </CardTitle>
          <CardDescription>
            Authenticate to sync your emergency profile across devices and secure your data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Rescue ID (Email)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Security Protocol (Password)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 font-bold" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
              {isLogin ? "SECURE LOGIN" : "INITIALIZE ACCOUNT"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
          </div>

          <Button variant="outline" className="w-full h-12 font-bold" onClick={handleGoogle}>
            Use Google Identity
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {isLogin ? "Need a rescue identity?" : "Already registered?"}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="ml-1 text-primary font-bold hover:underline"
            >
              {isLogin ? "Create Account" : "Login Now"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
