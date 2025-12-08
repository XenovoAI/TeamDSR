import { BookOpen, Mic, FileText, Sparkles, TrendingUp, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: <BookOpen className="h-6 w-6 text-indigo-500" />,
    title: "Chapter-wise Practice",
    description: "Interactive exercises with GIFs and real-world examples to master every concept.",
    color: "bg-indigo-50"
  },
  {
    icon: <Mic className="h-6 w-6 text-purple-500" />,
    title: "Voice Explanations",
    description: "Listen to expert explanations by Digraj Sir anytime you're stuck on a topic.",
    color: "bg-purple-50"
  },
  {
    icon: <FileText className="h-6 w-6 text-blue-500" />,
    title: "Short Notes & E-books",
    description: "Concise, beautiful notes to help you revise entire chapters in minutes.",
    color: "bg-blue-50"
  },
  {
    icon: <Sparkles className="h-6 w-6 text-orange-500" />,
    title: "AI Generated Questions",
    description: "Never run out of practice. Get unlimited personalized questions instantly.",
    color: "bg-orange-50"
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-green-500" />,
    title: "Progress Tracking",
    description: "Visualize your growth with beautiful charts and streak rewards.",
    color: "bg-green-50"
  },
  {
    icon: <Smartphone className="h-6 w-6 text-pink-500" />,
    title: "Mobile-First Design",
    description: "Learn on the go with an interface designed perfectly for your phone.",
    color: "bg-pink-50"
  }
];

export default function Features() {
  return (
    <section className="py-12 md:py-20 bg-white/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <h2 className="font-heading text-2xl md:text-4xl font-bold mb-3 md:mb-4">Everything You Need to Excel</h2>
          <p className="text-muted-foreground text-base md:text-lg">
            We've built the most comprehensive learning toolkit to help you understand better and score higher.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl overflow-hidden group">
              <CardContent className="p-6">
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="font-heading text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}