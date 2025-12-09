import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle, ChevronRight, Play } from "lucide-react";
import Navbar from "@/components/Navbar";

import { Link } from "wouter";

const tests = [
  {
    id: "1",
    title: "Math Weekly Quiz 4",
    subject: "Mathematics",
    questions: 20,
    time: "30 mins",
    difficulty: "Medium",
    status: "New",
    color: "bg-blue-50 text-blue-600"
  },
  {
    id: "2",
    title: "Science Chapter Test: Electricity",
    subject: "Science",
    questions: 15,
    time: "25 mins",
    difficulty: "Hard",
    status: "New",
    color: "bg-green-50 text-green-600"
  },
  {
    id: "3",
    title: "History: The Rise of Nationalism",
    subject: "Social Studies",
    questions: 10,
    time: "15 mins",
    difficulty: "Easy",
    status: "Completed",
    score: "9/10",
    color: "bg-orange-50 text-orange-600"
  }
];

export default function Practice() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-8 md:pt-24 md:pb-12">
        <div className="mb-6 md:mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">Practice Arena</h1>
          <p className="text-muted-foreground text-sm md:text-base">Test your knowledge with chapter-wise quizzes and mock tests.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {tests.map((test, index) => (
            <Link key={index} href={`/practice/${test.id}`}>
              <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white overflow-hidden group cursor-pointer">
                <div className={`h-1.5 w-full ${test.color.split(' ')[0].replace('50', '500')}`} />
                <CardContent className="p-4 md:p-6">
                  <div className="flex justify-between items-start mb-3 md:mb-4">
                    <span className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded-full ${test.color}`}>
                      {test.subject}
                    </span>
                    {test.status === "Completed" ? (
                      <span className="text-[10px] md:text-xs font-bold text-green-600 flex items-center gap-1">
                        <CheckCircle size={12} className="md:w-3.5 md:h-3.5" /> Done
                      </span>
                    ) : (
                      <span className="text-[10px] md:text-xs font-bold text-indigo-600 flex items-center gap-1">
                        <AlertCircle size={12} className="md:w-3.5 md:h-3.5" /> New
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-heading text-base md:text-xl font-bold mb-3 md:mb-4 group-hover:text-primary transition-colors">
                    {test.title}
                  </h3>

                  <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
                    <div className="flex items-center gap-1">
                      <AlertCircle size={14} className="md:w-4 md:h-4" /> {test.questions} Qs
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="md:w-4 md:h-4" /> {test.time}
                    </div>
                  </div>

                  {test.status === "Completed" ? (
                    <Button variant="outline" className="w-full border-indigo-100 text-indigo-600 hover:bg-indigo-50 h-10 md:h-11 text-sm md:text-base tap-target">
                      View Result ({test.score})
                    </Button>
                  ) : (
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition-opacity h-10 md:h-11 text-sm md:text-base tap-target">
                      Start Test <Play size={14} className="ml-2 fill-current md:w-4 md:h-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}