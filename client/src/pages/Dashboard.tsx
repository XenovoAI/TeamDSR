import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, User, Settings } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  const displayName = user?.user_metadata?.name || user?.user_metadata?.full_name || userProfile?.name || 'Student';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-8 md:pt-24 md:pb-12">
        <header className="mb-6 md:mb-10 text-center md:text-left">
          <h1 className="font-heading text-2xl md:text-4xl font-bold mb-2">Welcome back, {firstName}!</h1>
          <p className="text-muted-foreground text-base md:text-lg">Access your NEET study materials</p>
        </header>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl">
          <Link href="/materials">
            <Card className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-[#AFFFFF]/20 to-[#0DCDCD]/20 h-full">
              <CardContent className="p-6 flex flex-col items-center text-center h-full">
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0B9B9B] mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen size={28} />
                </div>
                <h2 className="font-heading text-xl font-bold mb-2">Study Materials</h2>
                <p className="text-sm text-muted-foreground mb-6">Access NEET notes and e-books.</p>
                <Button className="mt-auto bg-[#0B9B9B] hover:bg-[#1B5E5E] text-white rounded-full px-6 w-full">Browse</Button>
              </CardContent>
            </Card>
          </Link>
          <Link href="/profile">
            <Card className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-[#5DDDDD]/20 to-[#0B9B9B]/20 h-full">
              <CardContent className="p-6 flex flex-col items-center text-center h-full">
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#1B5E5E] mb-4 group-hover:scale-110 transition-transform">
                  <User size={28} />
                </div>
                <h2 className="font-heading text-xl font-bold mb-2">My Profile</h2>
                <p className="text-sm text-muted-foreground mb-6">View your profile.</p>
                <Button className="mt-auto bg-[#1B5E5E] hover:bg-[#0B9B9B] text-white rounded-full px-6 w-full">View</Button>
              </CardContent>
            </Card>
          </Link>
          {userProfile?.is_admin && (
            <Link href="/admin">
              <Card className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-[#0DCDCD]/20 to-[#1B5E5E]/20 h-full">
                <CardContent className="p-6 flex flex-col items-center text-center h-full">
                  <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0DCDCD] mb-4 group-hover:scale-110 transition-transform">
                    <Settings size={28} />
                  </div>
                  <h2 className="font-heading text-xl font-bold mb-2">Admin Panel</h2>
                  <p className="text-sm text-muted-foreground mb-6">Manage content.</p>
                  <Button className="mt-auto bg-[#0DCDCD] hover:bg-[#0B9B9B] text-white rounded-full px-6 w-full">Open</Button>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
