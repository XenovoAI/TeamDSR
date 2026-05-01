import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/lib/firebase-auth";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, User, Mail, School, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const displayName =
    userProfile?.name ||
    (user?.user_metadata?.name as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "";
  const avatarUrl =
    userProfile?.avatar_url ||
    (user?.user_metadata?.avatar_url as string | undefined) ||
    (user?.user_metadata?.picture as string | undefined) ||
    undefined;
  const [formData, setFormData] = useState({
    name: userProfile?.name || displayName || '',
    class: userProfile?.class || '',
    school: userProfile?.school || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      await updateUserProfile(user.id, {
        name: formData.name,
        class: formData.class,
        school: formData.school
      });
      
      await refreshUserProfile();
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-12 md:pt-24 md:pb-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>

          {/* Profile Card */}
          <Card className="border-none shadow-lg mb-6">
            <CardHeader className="border-b bg-gradient-to-r from-[#AFFFFF]/20 to-[#0DCDCD]/20">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                  <AvatarImage src={avatarUrl} alt={displayName || 'User'} />
                  <AvatarFallback className="bg-gradient-to-br from-[#1B5E5E] to-[#0B9B9B] text-white text-2xl">
                    {displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-heading text-2xl font-bold">{displayName || 'User'}</h2>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail size={16} />
                    {user.email}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User size={16} />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-white"
                  />
                </div>

                {/* Class */}
                <div className="space-y-2">
                  <Label htmlFor="class" className="flex items-center gap-2">
                    <GraduationCap size={16} />
                    Class
                  </Label>
                  <Select value={formData.class} onValueChange={(value) => handleChange('class', value)}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select your class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Class 9">Class 9</SelectItem>
                      <SelectItem value="Class 10">Class 10</SelectItem>
                      <SelectItem value="Class 11">Class 11</SelectItem>
                      <SelectItem value="Class 12">Class 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* School */}
                <div className="space-y-2">
                  <Label htmlFor="school" className="flex items-center gap-2">
                    <School size={16} />
                    School Name
                  </Label>
                  <Input
                    id="school"
                    value={formData.school}
                    onChange={(e) => handleChange('school', e.target.value)}
                    placeholder="Enter your school name"
                    className="bg-white"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#1B5E5E] to-[#0B9B9B] hover:opacity-90"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Info Card */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-muted-foreground">Account Type</span>
                <span className="font-semibold">Google Account</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-semibold">
                  {userProfile?.created_at 
                    ? new Date(userProfile.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'Recently joined'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {user.id.substring(0, 12)}...
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
