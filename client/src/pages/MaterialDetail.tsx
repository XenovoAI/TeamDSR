import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, Share2, Bookmark } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Link } from "wouter";

// Mock data - in a real app this would come from an API/Store
const materials = [
  {
    id: "1",
    subject: "Mathematics",
    title: "Linear Equations - Full Chapter Notes",
    type: "PDF",
    size: "2.4 MB",
    color: "bg-[#AFFFFF]/30 text-[#0B9B9B]",
    description: "Comprehensive notes covering all key concepts of Linear Equations in Two Variables. Includes solved examples, graphical representations, and practice problems.",
    chapters: ["Introduction", "Graphing Lines", "Solving Systems", "Word Problems"],
    author: "NEETPeak"
  },
  {
    id: "2",
    subject: "Science",
    title: "Carbon and its Compounds - Mind Map",
    type: "PDF",
    size: "1.1 MB",
    color: "bg-green-50 text-green-600",
    description: "Visual mind map for quick revision of Carbon and its Compounds. Perfect for last minute exam preparation.",
    chapters: ["Bonding in Carbon", "Versatile Nature", "Chemical Properties", "Soaps and Detergents"],
    author: "NEETPeak"
  },
  {
    id: "3",
    subject: "Science",
    title: "Periodic Classification - Important Q&A",
    type: "PDF",
    size: "1.8 MB",
    color: "bg-green-50 text-green-600",
    description: "Curated list of most frequently asked questions in board exams with model answers.",
    chapters: ["Dobereiner's Triads", "Newlands' Law", "Mendeleev's Table", "Modern Periodic Table"],
    author: "NEETPeak"
  },
  {
    id: "4",
    subject: "Social Studies",
    title: "Nationalism in India - Summary",
    type: "PDF",
    size: "3.2 MB",
    color: "bg-orange-50 text-orange-600",
    description: "Detailed summary of the Nationalism in India chapter. Covers all major movements, dates, and personalities.",
    chapters: ["First World War", "Khilafat Movement", "Non-Cooperation", "Civil Disobedience"],
    author: "NEETPeak"
  },
  {
    id: "5",
    subject: "English",
    title: "Grammar Rules Cheat Sheet",
    type: "PDF",
    size: "0.8 MB",
    color: "bg-[#0DCDCD]/20 text-[#1B5E5E]",
    description: "Quick reference guide for all major English grammar rules including tenses, active-passive voice, and reported speech.",
    chapters: ["Tenses", "Modals", "Subject-Verb Agreement", "Connectors"],
    author: "NEETPeak"
  }
];

export default function MaterialDetail() {
  const [match, params] = useRoute("/materials/:id");
  const material = materials.find(m => m.id === params?.id);

  if (!material) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Material Not Found</h1>
          <Link href="/materials">
            <Button>Back to Materials</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-12 md:pt-24">
        {/* Back Button */}
        <Link href="/materials">
          <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Materials
          </Button>
        </Link>

        {/* Content Header */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#0DCDCD]/20 mb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {/* Icon Box */}
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center ${material.color} bg-opacity-10 shrink-0`}>
              <FileText size={40} className="md:w-12 md:h-12" />
            </div>

            {/* Title & Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${material.color.replace('text', 'bg').replace('bg', 'bg-opacity-10')}`}>
                  {material.subject}
                </span>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide border border-border px-2 py-0.5 rounded-md">
                  {material.type} • {material.size}
                </span>
              </div>
              
              <h1 className="font-heading text-2xl md:text-4xl font-bold mb-4 leading-tight">
                {material.title}
              </h1>
              
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                {material.description}
              </p>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="rounded-full bg-[#0B9B9B] hover:bg-[#1B5E5E] w-full md:w-auto">
                  <Download className="mr-2 h-5 w-5" /> Download PDF
                </Button>
                <Button size="lg" variant="outline" className="rounded-full border-2 w-full md:w-auto">
                  <Share2 className="mr-2 h-5 w-5" /> Share
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full ml-auto md:ml-0">
                  <Bookmark className="h-6 w-6 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters / Content Preview */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h3 className="font-heading text-xl font-bold mb-4">What's Inside</h3>
            <div className="bg-white rounded-2xl border border-[#0DCDCD]/20 overflow-hidden">
              {material.chapters.map((chapter, i) => (
                <div key={i} className="p-4 border-b border-[#0DCDCD]/20 last:border-0 flex items-center gap-4 hover:bg-[#AFFFFF]/20 transition-colors cursor-default">
                  <div className="w-8 h-8 rounded-full bg-[#AFFFFF]/40 flex items-center justify-center text-[#1B5E5E] text-sm font-bold">
                    {i + 1}
                  </div>
                  <span className="font-medium text-foreground">{chapter}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-heading text-xl font-bold mb-4">Author</h3>
            <div className="bg-white rounded-2xl p-6 border border-[#0DCDCD]/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0B9B9B] to-[#1B5E5E] flex items-center justify-center text-white font-bold text-xl">
                {material.author.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-lg">{material.author}</div>
                <div className="text-sm text-muted-foreground">Subject Expert</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}