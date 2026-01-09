import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, BookOpen } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        {/* Desktop: side by side, Mobile: stacked */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          
          {/* Text Content - Left side on desktop */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#AFFFFF]/30 border border-[#0DCDCD]/30 text-[#1B5E5E] text-xs md:text-sm font-semibold mb-4 md:mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0DCDCD] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0B9B9B]"></span>
              </span>
              Your NEET Preparation Partner
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-4 md:mb-6 tracking-tight">
              Crack NEET with <br/>
              <span className="bg-gradient-to-r from-[#1B5E5E] to-[#0B9B9B] bg-clip-text text-transparent">NEETPeak</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Access comprehensive study materials for Physics, Chemistry & Biology. 
              Download notes, e-books, and revision guides designed for NEET aspirants.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
              <Link href="/materials">
                <Button size="lg" className="bg-gradient-to-r from-[#1B5E5E] to-[#0B9B9B] text-base md:text-lg h-11 md:h-12 px-6 md:px-8 rounded-full shadow-xl shadow-[#0DCDCD]/30 hover:shadow-2xl hover:shadow-[#0DCDCD]/40 transition-all hover:-translate-y-1 w-full sm:w-auto">
                  <BookOpen className="mr-2 h-4 w-4 md:h-5 md:w-5" /> Browse Materials
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-base md:text-lg h-11 md:h-12 px-6 md:px-8 rounded-full border-2 border-[#0DCDCD]/30 hover:bg-[#AFFFFF]/20 hover:text-[#1B5E5E] transition-colors w-full sm:w-auto">
                  Get Started <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#0B9B9B]"></div>
                <span>Physics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#0DCDCD]"></div>
                <span>Chemistry</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#1B5E5E]"></div>
                <span>Biology</span>
              </div>
            </div>
          </div>

          {/* Hero Banner Image - Right side on desktop, below on mobile */}
          <div className="flex-1 w-full max-w-lg lg:max-w-xl">
            <div className="bg-white rounded-3xl shadow-xl p-4 md:p-6">
              <img 
                src="/hero-banner.png" 
                alt="Students learning together" 
                className="w-full h-auto rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
