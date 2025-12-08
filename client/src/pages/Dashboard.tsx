import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Home, BookOpen, PenTool, User, ChevronRight, PlayCircle, Clock, Trophy, FileText } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Mobile-first bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-indigo-50 flex items-center justify-around z-50">
        <Link href="/dashboard"><a className="flex flex-col items-center gap-1 text-primary"><Home size={20} /><span className="text-[10px] font-medium">Home</span></a></Link>
        <Link href="#"><a className="flex flex-col items-center gap-1 text-muted-foreground"><BookOpen size={20} /><span className="text-[10px] font-medium">Courses</span></a></Link>
        <Link href="#"><a className="flex flex-col items-center gap-1 text-muted-foreground"><PenTool size={20} /><span className="text-[10px] font-medium">Practice</span></a></Link>
        <Link href="#"><a className="flex flex-col items-center gap-1 text-muted-foreground"><User size={20} /><span className="text-[10px] font-medium">Profile</span></a></Link>
      </div>

      {/* Desktop Sidebar (Optional, keeping it simple for now as requested "Mobile-first responsive") */}
      <nav className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-indigo-50 flex-col p-6 z-40">
        <div className="font-heading text-2xl font-bold text-primary mb-10">Team DSR</div>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start bg-indigo-50 text-primary font-medium"><Home className="mr-3 h-5 w-5" /> Home</Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary"><BookOpen className="mr-3 h-5 w-5" /> My Courses</Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary"><PenTool className="mr-3 h-5 w-5" /> Practice Area</Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary"><Trophy className="mr-3 h-5 w-5" /> Leaderboard</Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary"><User className="mr-3 h-5 w-5" /> Profile</Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:pl-64 pt-8 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold">Welcome back, Harshit! 👋</h1>
            <p className="text-muted-foreground">You're on a 31 Day Streak! Keep it up.</p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-indigo-50 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium">Online</span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-bold font-heading mb-1">31</div>
              <div className="text-xs opacity-80 uppercase tracking-wider font-semibold">Day Streak</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-bold font-heading mb-1 text-indigo-600">85%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Avg. Score</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-bold font-heading mb-1 text-purple-600">12</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Chapters Done</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-bold font-heading mb-1 text-orange-500">240</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">XP Earned</div>
            </CardContent>
          </Card>
        </div>

        {/* Continue Learning */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading text-xl font-bold">Continue Learning</h2>
            <Link href="#"><a className="text-primary text-sm font-medium hover:underline">View All</a></Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Active Course Card 1 */}
            <Card className="border-none shadow-md hover:shadow-lg transition-all overflow-hidden group">
              <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-500" />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-full">Mathematics</span>
                    <h3 className="font-heading text-lg font-bold mt-2 group-hover:text-primary transition-colors">Linear Equations in Two Variables</h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                    <PlayCircle size={20} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-2 bg-blue-50" indicatorClassName="bg-blue-500" />
                </div>
                
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><Clock size={14} /> 25m left</div>
                  <div className="flex items-center gap-1"><FileText size={14} /> 2 Notes</div>
                </div>
              </CardContent>
            </Card>

            {/* Active Course Card 2 */}
            <Card className="border-none shadow-md hover:shadow-lg transition-all overflow-hidden group">
              <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">Science</span>
                    <h3 className="font-heading text-lg font-bold mt-2 group-hover:text-primary transition-colors">Carbon and its Compounds</h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                    <PlayCircle size={20} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>30%</span>
                  </div>
                  <Progress value={30} className="h-2 bg-green-50" indicatorClassName="bg-green-500" />
                </div>
                
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><Clock size={14} /> 45m left</div>
                  <div className="flex items-center gap-1"><FileText size={14} /> 5 Notes</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommended For You */}
        <div>
          <h2 className="font-heading text-xl font-bold mb-4">Recommended Practice</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer bg-white">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                    <PenTool size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">Daily Quiz #{i}</h4>
                    <p className="text-xs text-muted-foreground">10 Questions • 15 Mins</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}