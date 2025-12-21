import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Atom, Beaker, Dna } from "lucide-react";

const subjects = [
  { icon: <Calculator />, name: "Mathematics", color: "text-blue-500", bg: "bg-blue-50", description: "Calculus, Algebra, Trigonometry" },
  { icon: <Atom />, name: "Physics", color: "text-purple-500", bg: "bg-purple-50", description: "Mechanics, Electromagnetism, Optics" },
  { icon: <Beaker />, name: "Chemistry", color: "text-green-500", bg: "bg-green-50", description: "Organic, Inorganic, Physical" },
  { icon: <Dna />, name: "Biology", color: "text-orange-500", bg: "bg-orange-50", description: "Botany, Zoology, Genetics" },
];

export default function Subjects() {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-white to-indigo-50/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="font-heading text-2xl md:text-4xl font-bold mb-2 md:mb-4">Master JEE & NEET Subjects</h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Comprehensive preparation for Physics, Chemistry, Mathematics, and Biology with expert guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {subjects.map((subject, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer group bg-white overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[180px] relative">
                <div className={`w-16 h-16 rounded-2xl ${subject.bg} ${subject.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
                  {subject.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-1">{subject.name}</h3>
                  <p className="text-xs text-muted-foreground">{subject.description}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}