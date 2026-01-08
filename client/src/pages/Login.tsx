import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Email/Password form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [activeTab, setActiveTab] = useState("google");

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      setLocation('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await signInWithEmail(email, password);
      setLocation('/dashboard');
    } catch (err: any) {
      console.error('Email login error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await signUpWithEmail(email, password, name);
      setLocation('/dashboard');
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#AFFFFF]/20 via-white to-[#0DCDCD]/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br from-[#1B5E5E] to-[#0B9B9B] text-white mb-3 md:mb-4">
            <BookOpen size={28} className="md:w-8 md:h-8" />
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">Welcome to NEETPeak</h1>
          <p className="text-sm md:text-base text-muted-foreground">Master NEET, Achieve Excellence</p>
        </div>

        {/* Login Card */}
        <Card className="border-none shadow-xl">
          <CardContent className="p-5 md:p-8">
            <h2 className="font-heading text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">Sign In</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6 h-9 md:h-10">
                <TabsTrigger value="google" className="text-xs md:text-sm">Google</TabsTrigger>
                <TabsTrigger value="signin" className="text-xs md:text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-xs md:text-sm">Sign Up</TabsTrigger>
              </TabsList>

              {/* Google Sign In Tab */}
              <TabsContent value="google" className="space-y-4">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-11 md:h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm text-sm md:text-base tap-target"
                  variant="outline"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                  ) : (
                    <svg className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Recommended - Quick and secure sign in
                </p>
              </TabsContent>

              {/* Email Sign In Tab */}
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
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
                    className="w-full h-11 md:h-12 text-sm md:text-base tap-target"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In with Email'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Email Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
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
                      placeholder="your.email@example.com"
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
                      disabled={loading}
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 6 characters
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 md:h-12 text-sm md:text-base tap-target"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
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
