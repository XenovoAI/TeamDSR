import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Microscope, Languages, Globe, Laptop, Palette } from "lucide-react";

const subjects = [
  { icon: <Calculator />, name: "Mathematics", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: <Microscope />, name: "Science", color: "text-green-500", bg: "bg-green-50" },
  { icon: <Languages />, name: "English", color: "text-purple-500", bg: "bg-purple-50" },
  { icon: <Globe />, name: "Social Studies", color: "text-orange-500", bg: "bg-orange-50" },
  { icon: <Laptop />, name: "Computer Science", color: "text-indigo-500", bg: "bg-indigo-50" },
  { icon: <Palette />, name: "Arts & Humanities", color: "text-pink-500", bg: "bg-pink-50" },
];

export default function Subjects() {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-4">
          <div className="max-w-xl">
            <h2 className="font-heading text-2xl md:text-4xl font-bold mb-2 md:mb-4">Explore Subjects</h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Comprehensive courses for every major subject, designed to make learning enjoyable.
            </p>
          </div>
          <a href="#" className="text-primary font-semibold hover:underline text-sm md:text-base">View All Courses →</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {subjects.map((subject, index) => (
            <Card key={index} className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group bg-white">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[160px]">
                <div className={`w-12 h-12 rounded-full ${subject.bg} ${subject.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {subject.icon}
                </div>
                <h3 className="font-medium text-foreground">{subject.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}