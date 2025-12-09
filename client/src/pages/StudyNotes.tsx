import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, Eye, Search, Filter, BookOpen } from "lucide-react";
import { Link } from "wouter";

const studyNotes = [
  {
    id: "1",
    subject: "Mathematics",
    class: "Class 10",
    title: "Real Numbers - Complete Chapter Notes",
    description: "Euclid's division algorithm, HCF, LCM, and fundamental theorem of arithmetic with solved examples.",
    type: "PDF",
    pages: 24,
    downloads: "12.5k",
    color: "bg-blue-50 text-blue-600"
  },
  {
    id: "2",
    subject: "Mathematics",
    class: "Class 10",
    title: "Polynomials - Formula Sheet & Practice",
    description: "All polynomial formulas, division algorithm, and relationship between zeros and coefficients.",
    type: "PDF",
    pages: 18,
    downloads: "10.2k",
    color: "bg-blue-50 text-blue-600"
  },
  {
    id: "3",
    subject: "Science",
    class: "Class 10",
    title: "Chemical Reactions - Mind Map",
    description: "Types of reactions, balancing equations, and important chemical equations for board exams.",
    type: "PDF",
    pages: 12,
    downloads: "15.8k",
    color: "bg-green-50 text-green-600"
  },
  {
    id: "4",
    subject: "Science",
    class: "Class 10",
    title: "Electricity - Numerical Problems",
    description: "Ohm's law, series-parallel circuits, and power calculations with step-by-step solutions.",
    type: "PDF",
    pages: 20,
    downloads: "14.3k",
    color: "bg-green-50 text-green-600"
  },
  {
    id: "5",
    subject: "Social Science",
    class: "Class 10",
    title: "Nationalism in India - Timeline & Notes",
    description: "Complete timeline of Indian freedom struggle with important events, leaders, and movements.",
    type: "PDF",
    pages: 28,
    downloads: "9.7k",
    color: "bg-orange-50 text-orange-600"
  },
  {
    id: "6",
    subject: "Social Science",
    class: "Class 10",
    title: "Resources and Development - Map Work",
    description: "Types of resources, conservation methods, and important maps for board exam preparation.",
    type: "PDF",
    pages: 16,
    downloads: "8.4k",
    color: "bg-orange-50 text-orange-600"
  },
  {
    id: "7",
    subject: "English",
    class: "Class 10",
    title: "First Flight - Chapter Summaries",
    description: "Detailed summaries of all prose and poetry with character analysis and important questions.",
    type: "PDF",
    pages: 32,
    downloads: "11.9k",
    color: "bg-purple-50 text-purple-600"
  },
  {
    id: "8",
    subject: "English",
    class: "Class 10",
    title: "Grammar Rules - Quick Reference",
    description: "All grammar topics including tenses, voice, narration, and sentence transformation.",
    type: "PDF",
    pages: 22,
    downloads: "13.6k",
    color: "bg-purple-50 text-purple-600"
  },
  {
    id: "9",
    subject: "Mathematics",
    class: "Class 9",
    title: "Number Systems - Rational & Irrational",
    description: "Complete notes on rational numbers, irrational numbers, and real numbers with proofs.",
    type: "PDF",
    pages: 20,
    downloads: "7.8k",
    color: "bg-blue-50 text-blue-600"
  },
  {
    id: "10",
    subject: "Science",
    class: "Class 9",
    title: "Atoms and Molecules - Concept Notes",
    description: "Laws of chemical combination, atomic mass, molecular mass, and mole concept explained.",
    type: "PDF",
    pages: 16,
    downloads: "8.9k",
    color: "bg-green-50 text-green-600"
  }
];

const subjects = ["All", "Mathematics", "Science", "Social Science", "English"];
const classes = ["All", "Class 9", "Class 10"];

export default function StudyNotes() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-12 md:pt-24 md:pb-16">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Study Notes
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            High-quality, exam-focused notes created by expert teachers. Download and study offline anytime.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search notes by topic or chapter..." className="pl-9 bg-white" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter size={16} /> Filter
            </Button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-8 max-w-4xl mx-auto">
          <span className="text-sm text-muted-foreground mr-2">Subject:</span>
          {subjects.map((subject) => (
            <Button
              key={subject}
              variant={subject === "All" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
            >
              {subject}
            </Button>
          ))}
        </div>

        {/* Notes Grid */}
        <div className="grid gap-4 max-w-4xl mx-auto">
          {studyNotes.map((note) => (
            <Card key={note.id} className="border-none shadow-md hover:shadow-lg transition-all bg-white group">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${note.color} shrink-0`}>
                    <FileText size={28} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${note.color}`}>
                        {note.subject}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full font-medium">
                        {note.class}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {note.pages} pages • {note.downloads} downloads
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                      {note.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {note.description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <Link href={`/materials/${note.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye size={16} /> View
                      </Button>
                    </Link>
                    <Button size="sm" className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90">
                      <Download size={16} /> Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Notes
          </Button>
        </div>

        {/* Info Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="font-heading text-2xl font-bold mb-3">Premium Notes Available</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get access to 500+ premium study notes, mind maps, formula sheets, and revision guides 
                with our premium subscription. Perfect for last-minute revision!
              </p>
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90">
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
