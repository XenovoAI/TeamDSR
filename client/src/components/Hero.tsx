import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/hero_illustration_of_students_learning.png";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-24 pb-12 md:pt-40 md:pb-32 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="order-1 md:order-1 flex flex-col items-center md:items-start text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#AFFFFF]/30 border border-[#0DCDCD]/30 text-[#1B5E5E] text-xs md:text-sm font-semibold mb-4 md:mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0DCDCD] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0B9B9B]"></span>
              </span>
              Your NEET Preparation Partner
            </div>
            
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-4 md:mb-6 tracking-tight">
              Master Your Exams <br/>
              <span className="bg-gradient-to-r from-[#1B5E5E] to-[#0B9B9B] bg-clip-text text-transparent">with Confidence</span>
            </h1>
            
            <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-lg leading-relaxed">
              Master NEET with personalized practice, expert guidance, and comprehensive study materials designed specifically for NEET aspirants.
            </p>
            
            <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-3 md:gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-[#1B5E5E] to-[#0B9B9B] text-base md:text-lg h-11 md:h-12 px-6 md:px-8 rounded-full shadow-xl shadow-[#0DCDCD]/30 hover:shadow-2xl hover:shadow-[#0DCDCD]/40 transition-all hover:-translate-y-1 w-full sm:w-auto">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Link>
              <Link href="/materials">
                <Button variant="outline" size="lg" className="text-base md:text-lg h-11 md:h-12 px-6 md:px-8 rounded-full border-2 border-[#0DCDCD]/30 hover:bg-[#AFFFFF]/20 hover:text-[#1B5E5E] transition-colors w-full sm:w-auto">
                  <BookOpen className="mr-2 h-4 w-4 md:h-5 md:w-5" /> Explore Materials
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 md:mt-10 flex items-center gap-4 text-sm text-muted-foreground justify-center md:justify-start">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white flex items-center justify-center text-[10px] md:text-xs font-bold text-white bg-gradient-to-br from-[#0B9B9B] to-[#1B5E5E]`}>
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <span className="font-bold text-foreground">10k+</span> Students Enrolled
              </div>
            </div>
          </motion.div>
          
          {/* Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-2 md:order-2 relative mt-8 md:mt-0"
          >
            <div className="relative z-10 animate-float">
              <img 
                src={heroImage} 
                alt="Students learning happily" 
                className="w-full h-auto drop-shadow-2xl rounded-3xl"
              />
            </div>
            
            {/* Decorative Elements behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[#AFFFFF]/30 to-[#0DCDCD]/30 rounded-full blur-3xl -z-10 animate-pulse" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}