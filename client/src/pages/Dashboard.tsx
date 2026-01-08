import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, PenTool, LayoutDashboard, FileText, Download } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { getUserStats, getUserDownloadedMaterials } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || 'Student';
  const [stats, setStats] = useState({
    dayStreak: 0,
    totalTests: 0,
    avgScore: 0,
    notesRead: 0
  });
  const [loading, setLoading] = useState(true);
  const [downloadedMaterials, setDownloadedMaterials] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [userStats, downloads] = await Promise.all([
          getUserStats(user.id),
          getUserDownloadedMaterials(user.id, 5)
        ]);
        console.log('📊 Dashboard data:', { userStats, downloads });
        setStats(userStats);
        setDownloadedMaterials(downloads);
      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-8 md:pt-24 md:pb-12">
        {/* Simple Welcome Header */}
        <header className="mb-6 md:mb-10 text-center md:text-left">
          <h1 className="font-heading text-2xl md:text-4xl font-bold mb-2">Welcome back, {firstName}!</h1>
          <p className="text-muted-foreground text-base md:text-lg">
            {userProfile?.class ? `${userProfile.class} • ` : ''}What would you like to do today?
          </p>
        </header>

        {/* Main Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto md:mx-0">
          
          {/* Materials Card */}
          <Link href="/materials">
            <Card className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-[#AFFFFF]/20 to-[#0DCDCD]/20 hover:from-[#AFFFFF]/30 hover:to-[#0DCDCD]/30 h-full">
              <CardContent className="p-6 md:p-8 flex flex-col items-center text-center md:items-start md:text-left h-full">
                <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0B9B9B] mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen size={28} className="md:w-8 md:h-8" />
                </div>
                <h2 className="font-heading text-xl md:text-2xl font-bold mb-2">Study Materials</h2>
                <p className="text-sm md:text-base text-muted-foreground mb-6">Access NEET chapter notes, e-books, and summary guides for Physics, Chemistry, and Biology.</p>
                <Button className="mt-auto bg-[#0B9B9B] hover:bg-[#1B5E5E] text-white rounded-full px-6 md:px-8 w-full md:w-auto text-sm md:text-base">
                  Browse Notes
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Practice Card */}
          <Link href="/practice">
            <Card className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-[#5DDDDD]/20 to-[#0B9B9B]/20 hover:from-[#5DDDDD]/30 hover:to-[#0B9B9B]/30 h-full">
              <CardContent className="p-6 md:p-8 flex flex-col items-center text-center md:items-start md:text-left h-full">
                <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#1B5E5E] mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                  <PenTool size={28} className="md:w-8 md:h-8" />
                </div>
                <h2 className="font-heading text-xl md:text-2xl font-bold mb-2">Practice Arena</h2>
                <p className="text-sm md:text-base text-muted-foreground mb-6">Take quizzes, solve mock tests, and track your performance.</p>
                <Button className="mt-auto bg-[#1B5E5E] hover:bg-[#0B9B9B] text-white rounded-full px-6 md:px-8 w-full md:w-auto text-sm md:text-base">
                  Start Practice
                </Button>
              </CardContent>
            </Card>
          </Link>

        </div>

        {/* Simple Progress Overview */}
        <div className="mt-8 md:mt-12 max-w-4xl mx-auto md:mx-0">
          <h3 className="font-heading text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
            <LayoutDashboard size={20} className="text-muted-foreground" /> 
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-[#0DCDCD]/20">
              <div className="text-xl md:text-2xl font-bold text-[#0B9B9B]">
                {loading ? '...' : stats.dayStreak}
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase">Day Streak</div>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-[#0DCDCD]/20">
              <div className="text-xl md:text-2xl font-bold text-[#1B5E5E]">
                {loading ? '...' : stats.totalTests}
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase">Tests Taken</div>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-[#0DCDCD]/20">
              <div className="text-xl md:text-2xl font-bold text-[#0DCDCD]">
                {loading ? '...' : `${stats.avgScore}%`}
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase">Avg Score</div>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-[#0DCDCD]/20">
              <div className="text-xl md:text-2xl font-bold text-[#5DDDDD]">
                {loading ? '...' : stats.notesRead}
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase">Notes Read</div>
            </div>
          </div>
        </div>

        {/* Recently Downloaded Materials */}
        {downloadedMaterials.length > 0 && (
          <div className="mt-8 md:mt-12 max-w-4xl mx-auto md:mx-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg md:text-xl font-bold flex items-center gap-2">
                <Download size={20} className="text-muted-foreground" /> 
                Recently Downloaded
              </h3>
              <Link href="/materials">
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {downloadedMaterials.map((download) => {
                const material = download.material;
                if (!material) return null;
                
                const subject = material.chapter?.subject?.name || 'General';
                const getSubjectColor = (subj: string) => {
                  const colors: any = {
                    'Mathematics': 'bg-[#AFFFFF]/30 text-[#0B9B9B]',
                    'Physics': 'bg-[#0DCDCD]/20 text-[#1B5E5E]',
                    'Chemistry': 'bg-green-50 text-green-600',
                    'Biology': 'bg-orange-50 text-orange-600',
                    'English': 'bg-pink-50 text-pink-600'
                  };
                  return colors[subj] || 'bg-gray-50 text-gray-600';
                };
                const color = getSubjectColor(subject);

                return (
                  <Card key={download.id} className="border-none shadow-sm hover:shadow-md transition-all bg-white">
                    <CardContent className="p-3 md:p-4 flex items-center gap-3">
                      <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center ${color} shrink-0`}>
                        <FileText size={20} className="md:w-6 md:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base truncate">{material.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] md:text-xs">
                            {subject}
                          </Badge>
                          <span className="text-[10px] md:text-xs text-muted-foreground">
                            {new Date(download.downloaded_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => window.open(material.file_url, '_blank')}
                      >
                        <FileText size={18} />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}