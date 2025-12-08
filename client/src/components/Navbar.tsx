import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-indigo-50">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2">
            <span className="font-heading font-bold text-2xl text-primary tracking-tight">Team DSR</span>
          </a>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/"><a className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Courses</a></Link>
          <Link href="/"><a className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Practice</a></Link>
          <Link href="/"><a className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Notes</a></Link>
          <Link href="/"><a className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About</a></Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" className="text-muted-foreground hover:text-primary">Sign In</Button>
          <Link href="/dashboard">
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity rounded-full px-6 shadow-lg shadow-indigo-200">
              Get Started Free
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-muted-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-indigo-50 p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
          <Link href="/"><a className="text-sm font-medium text-muted-foreground p-2" onClick={() => setIsOpen(false)}>Courses</a></Link>
          <Link href="/"><a className="text-sm font-medium text-muted-foreground p-2" onClick={() => setIsOpen(false)}>Practice</a></Link>
          <Link href="/"><a className="text-sm font-medium text-muted-foreground p-2" onClick={() => setIsOpen(false)}>Notes</a></Link>
          <Link href="/"><a className="text-sm font-medium text-muted-foreground p-2" onClick={() => setIsOpen(false)}>About</a></Link>
          <div className="h-px bg-indigo-50 my-2" />
          <Button variant="ghost" className="justify-start">Sign In</Button>
          <Link href="/dashboard">
            <Button className="bg-gradient-primary w-full rounded-full">Get Started Free</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}