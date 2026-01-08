import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, Eye, Search, Calendar, Award } from "lucide-react";
import { Link } from "wouter";

const previousPapers = [
  {
    id: "1",
    subject: "Mathematics",
    class: "Class 10",
    title: "CBSE Board 2024 - Mathematics",
    year: "2024",
    term: "Annual",
    marks: 80,
    duration: "3 hours",
    downloads: "18.5k",
    color: "bg-[#AFFFFF]/30 text-[#0B9B9B]"
  },
  {
    id: "2",
    subject: "Mathematics",
    class: "Class 10",
    title: "CBSE Board 2023 - Mathematics",
    year: "2023",
    term: "Annual",
    marks: 80,
    duration: "3 hours",
    downloads: "22.3k",
    color: "bg-[#AFFFFF]/30 text-[#0B9B9B]"
  },
  {
    id: "3",
    subject: "Science",
    class: "Class 10",
    title: "CBSE Board 2024 - Science",
    year: "2024",
    term: "Annual",
    marks: 80,
    duration: "3 hours",
    downloads: "20.1k",
    color: "bg-green-50 text-green-600"
  },
  {
    id: "4",
    subject: "Science",
    class: "Class 10",
    title: "CBSE Board 2023 - Science",
    year: "2023",
    term: "Annual",
    marks: 80,
    duration: "3 hours",
    downloads: "24.7k",
    color: "bg-green-50 text-green-600"
  },
  {
    id: "5",
    subject: "Social Science",
    class: "Class 10",
    title: "CBSE Board 2024 - Social Science",
    year: "2024",
    term: "Annual",
    marks: 80,
    duration: "3 hours",
    downloads: "16.8k",
    color: "bg-orange-50 text-orange-600"
  },
  {
    id: "6",
    subject: "Social Science",
    class: "Class 10",
    title: "CBSE Board 2023 - Social Science",
    year: "2023",
    term: "Annual",
    marks: 80,
    duration: "3 hours",
    downloads: "19.2k",
    color: "bg-orange-50 text-orange-600"
  },
  {
    id: "7",
    subject: "English",
    class: "Class 10",
    title: "CBSE Board 2024 - English Language & Literature",
    year: "2024",
    term: "Annual",
    marks: 80,
    duration: "3 hours",
    downloads: "17.9k",
    color: "bg-[#0DCDCD]/20 text-[#1B5E5E]"
  },
  {
    id: "8",
    subject: "English",
    class: "Class 10",
    title: "CBSE Board 2023 - English Language & Literature",
    year: "2023",
    term: "Annual",
    marks: 80,
    duration: "3 hours",
    downloads: "21.4k",
    color: "bg-[#0DCDCD]/20 text-[#1B5E5E]"
  },
  {
    id: "9",
    subject: "Mathematics",
    class: "Class 9",
    title: "CBSE Sample Paper 2024 - Mathematics",
    year: "2024",
    term: "Annual",
    marks: 80,
    duration: "3 hours",
    downloads: "12.6k",
    color: "bg-[#AFFFFF]/30 text-[#0B9B9B]"
  },
  {
    id: "10",
    subject: "Science",
    class: "Class 9",
    title: "CBSE Sample Paper 2024 - Science",
    year: "2024",
    term: "Annual",
    marks: 80,
    duration: "3 hours",
    downloads: "14.3k",
    color: "bg-green-50 text-green-600"
  }
];

const years = ["2024", "2023", "2022", "2021", "2020"];
const subjects = ["All", "Mathematics", "Science", "Social Science", "English"];

export default function PreviousPapers() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-12 md:pt-24 md:pb-16">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#1B5E5E] to-[#0B9B9B] bg-clip-text text-transparent">
            Previous Year Papers
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Practice with authentic CBSE board papers and sample papers. Understand exam patterns and boost your preparation.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by subject, year, or class..." className="pl-9 bg-white" />
          </div>
        </div>

        {/* Year Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <span className="text-sm text-muted-foreground mr-2 self-center">Year:</span>
          {years.map((year) => (
            <Button
              key={year}
              variant={year === "2024" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
            >
              {year}
            </Button>
          ))}
        </div>

        {/* Papers Grid */}
        <div className="grid gap-4 max-w-5xl mx-auto">
          {previousPapers.map((paper) => (
            <Card key={paper.id} className="border-none shadow-md hover:shadow-lg transition-all bg-white group">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${paper.color} shrink-0`}>
                    <FileText size={28} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${paper.color}`}>
                        {paper.subject}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full font-medium">
                        {paper.class}
                      </span>
                      <span className="text-xs bg-[#AFFFFF]/30 text-[#1B5E5E] px-2 py-1 rounded-full font-bold flex items-center gap-1">
                        <Calendar size={12} /> {paper.year}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                      {paper.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Award size={14} /> {paper.marks} Marks
                      </span>
                      <span>Duration: {paper.duration}</span>
                      <span>{paper.downloads} downloads</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye size={16} /> View
                    </Button>
                    <Button size="sm" className="gap-2 bg-gradient-to-r from-[#1B5E5E] to-[#0B9B9B] hover:opacity-90">
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
            Load More Papers
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-16 max-w-5xl mx-auto">
          <Card className="border-none shadow-lg bg-gradient-to-br from-[#AFFFFF]/20 to-[#0DCDCD]/20">
            <CardContent className="p-8">
              <Award className="h-10 w-10 text-[#0B9B9B] mb-4" />
              <h3 className="font-heading text-xl font-bold mb-3">Marking Schemes Available</h3>
              <p className="text-muted-foreground mb-4">
                Get detailed marking schemes and solutions for all previous year papers. 
                Understand how marks are allocated and improve your answer writing.
              </p>
              <Button variant="outline" className="border-[#0DCDCD]/30 text-[#0B9B9B] hover:bg-[#AFFFFF]/20">
                View Solutions
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-[#5DDDDD]/20 to-[#0B9B9B]/20">
            <CardContent className="p-8">
              <FileText className="h-10 w-10 text-[#1B5E5E] mb-4" />
              <h3 className="font-heading text-xl font-bold mb-3">Sample Papers 2025</h3>
              <p className="text-muted-foreground mb-4">
                Practice with latest CBSE sample papers for 2025 board exams. 
                Get familiar with the new exam pattern and question types.
              </p>
              <Button variant="outline" className="border-[#0DCDCD]/30 text-[#1B5E5E] hover:bg-[#AFFFFF]/20">
                Access Sample Papers
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="border-none shadow-lg">
            <CardContent className="p-8">
              <h3 className="font-heading text-2xl font-bold mb-6 text-center">How to Use Previous Year Papers Effectively</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-[#AFFFFF]/40 text-[#1B5E5E] flex items-center justify-center text-sm font-bold">1</span>
                    Time Yourself
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Solve papers in exam conditions with strict time limits to build speed and accuracy.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-[#AFFFFF]/40 text-[#1B5E5E] flex items-center justify-center text-sm font-bold">2</span>
                    Analyze Patterns
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Identify frequently asked topics and question types to prioritize your preparation.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-[#AFFFFF]/40 text-[#1B5E5E] flex items-center justify-center text-sm font-bold">3</span>
                    Review Mistakes
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Carefully review wrong answers and understand concepts you missed.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-[#AFFFFF]/40 text-[#1B5E5E] flex items-center justify-center text-sm font-bold">4</span>
                    Practice Regularly
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Solve at least 2-3 papers per subject before your board exams.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
