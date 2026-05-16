import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Loader2 } from "lucide-react";

export default function Login() {
  const [location, setLocation] = useLocation();
  const { user, authDebug, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const redirectPath = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("redirect") || "/dashboard"
    : "/dashboard";

  useEffect(() => {
    if (user && location === "/login") {
      setLocation(redirectPath);
    }
  }, [location, redirectPath, setLocation, user]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Firebase login error:", err);
      setError(err.message || "Failed to start Google sign in. Please try again.");
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await signInWithEmail(email, password);
    } catch (err: any) {
      console.error("Email sign in error:", err);
      setError(err.message || "Failed to sign in. Please check your credentials.");
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await signUpWithEmail(email, password, name);
    } catch (err: any) {
      console.error("Email sign up error:", err);
      setError(err.message || "Failed to create account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#AFFFFF]/20 via-white to-[#0DCDCD]/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br from-[#1B5E5E] to-[#0B9B9B] text-white mb-3 md:mb-4">
            <BookOpen size={28} className="md:w-8 md:h-8" />
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">Welcome to NEETPeak</h1>
        </div>

        <Card className="border-none shadow-xl">
          <CardContent className="p-5 md:p-8">
            <h2 className="font-heading text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">Sign In</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Tabs defaultValue="google" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="google">Google</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
              </TabsList>

              <TabsContent value="google" className="space-y-4">
                <Button
                  type="button"
                  className="w-full h-11 md:h-12 text-sm md:text-base tap-target bg-[#0B9B9B] hover:bg-[#1B5E5E]"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting Google...
                    </>
                  ) : (
                    "Continue with Google"
                  )}
                </Button>

                <div className="rounded-lg border bg-slate-50 px-3 py-2 text-[11px] text-slate-600 break-words">
                  <strong>Auth status:</strong> {authDebug}
                </div>
              </TabsContent>

              <TabsContent value="email">
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin">
                    <form onSubmit={handleEmailSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-11 md:h-12 text-sm md:text-base bg-[#0B9B9B] hover:bg-[#1B5E5E]"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleEmailSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Your Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-11 md:h-12 text-sm md:text-base bg-[#0B9B9B] hover:bg-[#1B5E5E]"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              By signing in, you agree to our{" "}
              <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 md:mt-8 grid grid-cols-3 gap-3 md:gap-4 text-center">
          <div>
            <div className="text-xl md:text-2xl font-bold text-[#0B9B9B]">500+</div>
            <div className="text-[10px] md:text-xs text-muted-foreground">Study Notes</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-[#0DCDCD]">200+</div>
            <div className="text-[10px] md:text-xs text-muted-foreground">Practice Tests</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-pink-600">10k+</div>
            <div className="text-[10px] md:text-xs text-muted-foreground">Students</div>
          </div>
        </div>
      </div>
    </div>
  );
}
