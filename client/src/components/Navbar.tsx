import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, userProfile, signOut: handleSignOut } = useAuth();

  const isActive = (path: string) => location === path;
  const linkClass = (path: string) => 
    `text-sm font-medium transition-colors ${isActive(path) ? 'text-primary font-bold' : 'text-muted-foreground hover:text-primary'}`;

  const onSignOut = async () => {
    try {
      await handleSignOut();
      setLocation('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-indigo-50">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading font-bold text-2xl text-primary tracking-tight">Exam Fusion</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
          <Link href="/materials" className={linkClass('/materials')}>Materials</Link>
          <Link href="/practice" className={linkClass('/practice')}>Practice</Link>
          <Link href="/about" className={linkClass('/about')}>About</Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                      {user.displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.displayName || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation('/dashboard')}>
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90">
                Sign In
              </Button>
            </Link>
          )}
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
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground p-2 hover:bg-indigo-50 rounded-md" onClick={() => setIsOpen(false)}>Dashboard</Link>
          <Link href="/materials" className="text-sm font-medium text-muted-foreground p-2 hover:bg-indigo-50 rounded-md" onClick={() => setIsOpen(false)}>Materials</Link>
          <Link href="/practice" className="text-sm font-medium text-muted-foreground p-2 hover:bg-indigo-50 rounded-md" onClick={() => setIsOpen(false)}>Practice</Link>
          <Link href="/about" className="text-sm font-medium text-muted-foreground p-2 hover:bg-indigo-50 rounded-md" onClick={() => setIsOpen(false)}>About</Link>
          <div className="h-px bg-indigo-50 my-2" />
          {user ? (
            <>
              <div className="flex items-center gap-3 p-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                    {user.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 w-full rounded-full" onClick={() => setIsOpen(false)}>
                Sign In
              </Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}