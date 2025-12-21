import { useEffect, useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  FileText, 
  Users
} from "lucide-react";
import { getAdminStats, getRecentActivity } from "@/lib/queries";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalQuestions: 0,
    totalMaterials: 0,
    totalVideos: 0
  });
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adminStats, recentActivity] = await Promise.all([
          getAdminStats(),
          getRecentActivity(4)
        ]);
        
        setStats(adminStats);
        
        // Format activity data
        const formattedActivity = [
          {
            action: "New questions added",
            count: recentActivity.recentQuestions.length,
            time: recentActivity.recentQuestions[0] 
              ? getTimeAgo(recentActivity.recentQuestions[0].created_at)
              : "No activity",
            color: "text-blue-600"
          },
          {
            action: "Study material uploaded",
            count: recentActivity.recentMaterials.length,
            time: recentActivity.recentMaterials[0]
              ? getTimeAgo(recentActivity.recentMaterials[0].created_at)
              : "No activity",
            color: "text-orange-600"
          },
          {
            action: "New students registered",
            count: recentActivity.recentUsers.length,
            time: recentActivity.recentUsers[0]
              ? getTimeAgo(recentActivity.recentUsers[0].created_at)
              : "No activity",
            color: "text-purple-600"
          }
        ];
        
        setActivity(formattedActivity);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };
  const adminCards = [
    {
      title: "Questions",
      description: "Manage MCQs and practice questions",
      icon: FileText,
      href: "/admin/questions",
      color: "from-blue-500 to-indigo-600",
      count: loading ? "..." : stats.totalQuestions.toLocaleString()
    },
    {
      title: "Study Materials",
      description: "Manage e-books and notes",
      icon: BookOpen,
      href: "/admin/materials",
      color: "from-orange-500 to-red-600",
      count: loading ? "..." : stats.totalMaterials.toLocaleString()
    },
    {
      title: "Users",
      description: "Manage students and admins",
      icon: Users,
      href: "/admin/users",
      color: "from-violet-500 to-purple-600",
      count: loading ? "..." : stats.totalStudents.toLocaleString()
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-12 md:pt-24 md:pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage content, users, and platform settings
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-600">
                {loading ? '...' : stats.totalQuestions.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Total Questions</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-orange-600">
                {loading ? '...' : stats.totalMaterials.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Study Materials</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-600">
                {loading ? '...' : stats.totalStudents.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Total Students</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">{adminCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Link key={index} href={card.href}>
                <Card className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer group h-full">
                  <CardHeader className="pb-3">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon size={24} />
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {card.description}
                    </p>
                    <div className="text-xs font-bold text-primary">
                      {card.count}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading activity...</div>
                ) : activity.length > 0 ? (
                  activity.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{item.action}</p>
                        <p className="text-sm text-muted-foreground">{item.time}</p>
                      </div>
                      <div className={`font-bold ${item.color}`}>
                        +{item.count}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No recent activity</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
