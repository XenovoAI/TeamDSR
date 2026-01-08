import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, AlertCircle, Play, CheckCircle, Trophy, BarChart } from "lucide-react";
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
    color: "bg-[#AFFFFF]/30 text-[#0B9B9B]",
    description: "Weekly assessment covering Linear Equations and Polynomials.",
    topics: ["Linear Equations", "Polynomials", "Graphing"]
  },
  {
    id: "2",
    title: "Science Chapter Test: Electricity",
    subject: "Science",
    questions: 15,
    time: "25 mins",
    difficulty: "Hard",
    status: "New",
    color: "bg-green-50 text-green-600",
    description: "Chapter-end test for Electricity. Focuses on Ohm's Law and Resistivity.",
    topics: ["Current & Voltage", "Ohm's Law", "Resistors", "Power"]
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
    color: "bg-orange-50 text-orange-600",
    description: "Quick revision quiz on Nationalism in Europe and India.",
    topics: ["French Revolution", "Unification of Italy", "Nationalism in India"]
  }
];

export default function PracticeDetail() {
  const [match, params] = useRoute("/practice/:id");
  const test = tests.find(t => t.id === params?.id);

  if (!test) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Test Not Found</h1>
          <Link href="/practice">
            <Button>Back to Arena</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = test.status === "Completed";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-12 md:pt-24">
        <Link href="/practice">
          <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Practice Arena
          </Button>
        </Link>

        <div className="max-w-3xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-[#0DCDCD]/20 mb-8">
            <div className={`h-3 w-full ${test.color.split(' ')[0].replace('50', '500')}`} />
            <div className="p-8 md:p-10 text-center">
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-6 ${test.color}`}>
                {test.subject}
              </span>
              
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                {test.title}
              </h1>

              <div className="flex justify-center items-center gap-6 text-muted-foreground mb-8">
                <div className="flex flex-col items-center gap-1">
                  <AlertCircle size={24} className="text-[#0B9B9B]" />
                  <span className="text-sm font-medium">{test.questions} Questions</span>
                </div>
                <div className="w-px h-10 bg-[#0DCDCD]/20" />
                <div className="flex flex-col items-center gap-1">
                  <Clock size={24} className="text-[#0B9B9B]" />
                  <span className="text-sm font-medium">{test.time}</span>
                </div>
                <div className="w-px h-10 bg-[#0DCDCD]/20" />
                <div className="flex flex-col items-center gap-1">
                  <BarChart size={24} className="text-[#0B9B9B]" />
                  <span className="text-sm font-medium">{test.difficulty}</span>
                </div>
              </div>

              {isCompleted ? (
                <div className="bg-green-50 rounded-2xl p-6 border border-green-100 inline-block w-full max-w-sm">
                  <div className="text-green-600 font-bold mb-2 flex items-center justify-center gap-2">
                    <CheckCircle size={20} /> Completed
                  </div>
                  <div className="text-3xl font-bold text-green-700 mb-1">{test.score}</div>
                  <div className="text-xs text-green-600 uppercase tracking-wide font-bold">Your Score</div>
                  <Button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white rounded-full">
                    View Detailed Analysis
                  </Button>
                </div>
              ) : (
                <Link href={`/practice/${test.id}/play`}>
                  <Button size="lg" className="w-full max-w-sm h-14 text-lg rounded-full bg-gradient-to-r from-[#1B5E5E] to-[#0B9B9B] hover:opacity-90 shadow-xl shadow-[#0DCDCD]/30">
                    Start Test Now <Play size={20} className="ml-2 fill-current" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Topics Card */}
          <div className="bg-white rounded-3xl p-8 border border-[#0DCDCD]/20">
            <h3 className="font-heading text-xl font-bold mb-4">Topics Covered</h3>
            <p className="text-muted-foreground mb-6">{test.description}</p>
            <div className="flex flex-wrap gap-2">
              {test.topics.map((topic, i) => (
                <span key={i} className="px-4 py-2 rounded-full bg-[#AFFFFF]/30 text-[#1B5E5E] font-medium text-sm">
                  {topic}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}