import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const isActive = (path: string) => location === path;
  const linkClass = (path: string) => 
    `text-sm font-medium transition-colors ${isActive(path) ? 'text-primary font-bold' : 'text-muted-foreground hover:text-primary'}`;

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
          <Link href="/dashboard"><a className={linkClass('/dashboard')}>Dashboard</a></Link>
          <Link href="/materials"><a className={linkClass('/materials')}>Study Materials</a></Link>
          <Link href="/practice"><a className={linkClass('/practice')}>Practice Arena</a></Link>
          <Link href="/"><a className={linkClass('/about')}>About</a></Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/dashboard">
             <Button variant="ghost" className="text-muted-foreground hover:text-primary">My Profile</Button>
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
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-indigo-50 p-4 flex flex-col gap-4 animate-in slide-in-from-top-5 shadow-lg">
          <Link href="/dashboard"><a className="text-sm font-medium text-muted-foreground p-2 hover:bg-indigo-50 rounded-md" onClick={() => setIsOpen(false)}>Dashboard</a></Link>
          <Link href="/materials"><a className="text-sm font-medium text-muted-foreground p-2 hover:bg-indigo-50 rounded-md" onClick={() => setIsOpen(false)}>Study Materials</a></Link>
          <Link href="/practice"><a className="text-sm font-medium text-muted-foreground p-2 hover:bg-indigo-50 rounded-md" onClick={() => setIsOpen(false)}>Practice Arena</a></Link>
          <div className="h-px bg-indigo-50 my-2" />
          <Link href="/dashboard">
            <Button className="bg-gradient-primary w-full rounded-full">My Profile</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}