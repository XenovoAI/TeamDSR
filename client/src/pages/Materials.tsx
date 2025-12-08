import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { Link } from "wouter";

const materials = [
  {
    id: "1",
    subject: "Mathematics",
    title: "Linear Equations - Full Chapter Notes",
    type: "PDF",
    size: "2.4 MB",
    color: "bg-blue-50 text-blue-600"
  },
  {
    id: "2",
    subject: "Science",
    title: "Carbon and its Compounds - Mind Map",
    type: "PDF",
    size: "1.1 MB",
    color: "bg-green-50 text-green-600"
  },
  {
    id: "3",
    subject: "Science",
    title: "Periodic Classification - Important Q&A",
    type: "PDF",
    size: "1.8 MB",
    color: "bg-green-50 text-green-600"
  },
  {
    id: "4",
    subject: "Social Studies",
    title: "Nationalism in India - Summary",
    type: "PDF",
    size: "3.2 MB",
    color: "bg-orange-50 text-orange-600"
  },
  {
    id: "5",
    subject: "English",
    title: "Grammar Rules Cheat Sheet",
    type: "PDF",
    size: "0.8 MB",
    color: "bg-purple-50 text-purple-600"
  }
];

export default function Materials() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-8 md:pt-24 md:pb-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">Study Materials</h1>
            <p className="text-muted-foreground text-sm md:text-base">Access high-quality notes, e-books, and summaries.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search notes..." className="pl-9 bg-white" />
          </div>
        </div>

        <div className="grid gap-3 md:gap-4">
          {materials.map((item, index) => (
            <Link key={index} href={`/materials/${item.id}`}>
              <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white group cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${item.color} shrink-0`}>
                    <FileText size={24} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.color.replace('text', 'bg').replace('bg', 'bg-opacity-10')}`}>
                        {item.subject}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase">{item.type} • {item.size}</span>
                    </div>
                    <h3 className="font-bold text-base truncate pr-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hidden sm:flex">
                      <Eye size={20} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                      <Download size={20} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}