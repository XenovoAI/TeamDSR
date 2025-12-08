import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle, ChevronRight, Play } from "lucide-react";
import Navbar from "@/components/Navbar";

const tests = [
  {
    title: "Math Weekly Quiz 4",
    subject: "Mathematics",
    questions: 20,
    time: "30 mins",
    difficulty: "Medium",
    status: "New",
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Science Chapter Test: Electricity",
    subject: "Science",
    questions: 15,
    time: "25 mins",
    difficulty: "Hard",
    status: "New",
    color: "bg-green-50 text-green-600"
  },
  {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {tests.map((test, index) => (
            <Card key={index} className="border-none shadow-sm hover:shadow-md transition-all bg-white overflow-hidden group">
              <div className={`h-1.5 w-full ${test.color.split(' ')[0].replace('50', '500')}`} />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${test.color}`}>
                    {test.subject}
                  </span>
                  {test.status === "Completed" ? (
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                      <CheckCircle size={14} /> Done
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                      <AlertCircle size={14} /> New
                    </span>
                  )}
                </div>
                
                <h3 className="font-heading text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {test.title}
                </h3>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <AlertCircle size={16} /> {test.questions} Qs
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} /> {test.time}
                  </div>
                </div>

                {test.status === "Completed" ? (
                  <Button variant="outline" className="w-full border-indigo-100 text-indigo-600 hover:bg-indigo-50">
                    View Result ({test.score})
                  </Button>
                ) : (
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition-opacity">
                    Start Test <Play size={16} className="ml-2 fill-current" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}