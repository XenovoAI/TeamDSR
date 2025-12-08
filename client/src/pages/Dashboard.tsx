import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, PenTool, LayoutDashboard } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-24 pb-12">
        {/* Simple Welcome Header */}
        <header className="mb-10 text-center md:text-left">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Welcome back, Harshit!</h1>
          <p className="text-muted-foreground text-lg">What would you like to do today?</p>
        </header>

        {/* Main Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto md:mx-0">
          
          {/* Materials Card */}
          <Link href="/materials">
            <Card className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 h-full">
              <CardContent className="p-8 flex flex-col items-center text-center md:items-start md:text-left h-full">
                <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen size={32} />
                </div>
                <h2 className="font-heading text-2xl font-bold mb-2">Study Materials</h2>
                <p className="text-muted-foreground mb-6">Access chapter notes, e-books, and summary guides for all subjects.</p>
                <Button className="mt-auto bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 w-full md:w-auto">
                  Browse Notes
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Practice Card */}
          <Link href="/practice">
            <Card className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 h-full">
              <CardContent className="p-8 flex flex-col items-center text-center md:items-start md:text-left h-full">
                <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                  <PenTool size={32} />
                </div>
                <h2 className="font-heading text-2xl font-bold mb-2">Practice Arena</h2>
                <p className="text-muted-foreground mb-6">Take quizzes, solve mock tests, and track your performance.</p>
                <Button className="mt-auto bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 w-full md:w-auto">
                  Start Practice
                </Button>
              </CardContent>
            </Card>
          </Link>

        </div>

        {/* Simple Progress Overview */}
        <div className="mt-12 max-w-4xl mx-auto md:mx-0">
          <h3 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
            <LayoutDashboard size={20} className="text-muted-foreground" /> 
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-50">
              <div className="text-2xl font-bold text-indigo-600">31</div>
              <div className="text-xs text-muted-foreground font-medium uppercase">Day Streak</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-50">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-xs text-muted-foreground font-medium uppercase">Tests Taken</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-50">
              <div className="text-2xl font-bold text-blue-600">85%</div>
              <div className="text-xs text-muted-foreground font-medium uppercase">Avg Score</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-50">
              <div className="text-2xl font-bold text-orange-500">5</div>
              <div className="text-xs text-muted-foreground font-medium uppercase">Notes Read</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}