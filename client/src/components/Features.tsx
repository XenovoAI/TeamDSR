import { BookOpen, FileText, Download, Atom, Beaker, Dna } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: <FileText className="h-6 w-6 text-[#0B9B9B]" />,
    title: "NEET Study Notes",
    description: "Comprehensive notes for Physics, Chemistry & Biology aligned with NEET syllabus.",
    color: "bg-[#AFFFFF]/30"
  },
  {
    icon: <BookOpen className="h-6 w-6 text-[#1B5E5E]" />,
    title: "Chapter-wise Materials",
    description: "Organized study materials for every chapter in the NEET curriculum.",
    color: "bg-[#0DCDCD]/20"
  },
  {
    icon: <Download className="h-6 w-6 text-[#0B9B9B]" />,
    title: "Downloadable PDFs",
    description: "Download notes and e-books for offline study anytime, anywhere.",
    color: "bg-[#5DDDDD]/20"
  },
  {
    icon: <Atom className="h-6 w-6 text-[#1B5E5E]" />,
    title: "Physics Resources",
    description: "Mechanics, Thermodynamics, Optics, Electromagnetism & Modern Physics.",
    color: "bg-[#0DCDCD]/20"
  },
  {
    icon: <Beaker className="h-6 w-6 text-[#0B9B9B]" />,
    title: "Chemistry Resources",
    description: "Organic, Inorganic & Physical Chemistry with reaction mechanisms.",
    color: "bg-[#AFFFFF]/30"
  },
  {
    icon: <Dna className="h-6 w-6 text-[#1B5E5E]" />,
    title: "Biology Resources",
    description: "Botany, Zoology, Human Physiology, Genetics & Ecology materials.",
    color: "bg-[#5DDDDD]/20"
  }
];

export default function Features() {
  return (
    <section className="py-12 md:py-20 bg-white/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <h2 className="font-heading text-2xl md:text-4xl font-bold mb-3 md:mb-4">Complete NEET Preparation</h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Everything you need to crack NEET - comprehensive study materials for all subjects.
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
