import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
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
  const { totalItems } = useCart();
  const avatarUrl = userProfile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || undefined;
  const displayName = userProfile?.name || user?.user_metadata?.name || user?.email || 'User';

  const isActive = (path: string) => location === path;
  const linkClass = (path: string) => 
    `text-base font-medium transition-colors ${isActive(path) ? 'text-primary font-semibold border-b-2 border-primary pb-1' : 'text-gray-700 hover:text-primary'}`;

  const onSignOut = async () => {
    try {
      await handleSignOut();
      setLocation('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8">
      <div className="container mx-auto bg-white rounded-full shadow-lg border border-gray-200 px-6 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img 
            src="/logo.svg" 
            alt="NEETPeak" 
            className="h-8 md:h-10 w-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          <Link href="/" className={linkClass('/')}>Home</Link>
          <Link href="/materials" className={linkClass('/materials')}>Materials</Link>
          <Link href="/mentorship" className={linkClass('/mentorship')}>Mentorship</Link>
          <Link href="/about" className={linkClass('/about')}>About Us</Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Cart Icon */}
          <Link href="/cart">
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#0B9B9B] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          <a 
            href="https://play.google.com/store/apps/details?id=com.sm.neet" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button className="bg-[#0B9B9B] hover:bg-[#0DCDCD] text-white rounded-full px-6 h-11 text-sm font-semibold shadow-md transition-all hover:shadow-lg">
              Download App
            </Button>
          </a>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-[#0DCDCD]">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-[#0B9B9B] to-[#0DCDCD] text-white font-semibold">
                      {displayName.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{displayName}</p>
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
              <Button className="bg-[#0B9B9B] hover:bg-[#0DCDCD] text-white rounded-full px-6 h-11 text-sm font-semibold shadow-md transition-all hover:shadow-lg">
                Sign Up
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle - Hamburger Icon */}
        <button 
          className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <span className={`w-full h-0.5 bg-gray-700 rounded-full transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-full h-0.5 bg-gray-700 rounded-full transition-all ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-full h-0.5 bg-gray-700 rounded-full transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden absolute top-20 left-4 right-4 bg-white rounded-2xl border border-gray-200 shadow-xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-5">
          <Link href="/" className="text-base font-medium text-gray-700 p-3 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/materials" className="text-base font-medium text-gray-700 p-3 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsOpen(false)}>Materials</Link>
          <Link href="/mentorship" className="text-base font-medium text-gray-700 p-3 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsOpen(false)}>Mentorship</Link>
          <Link href="/about" className="text-base font-medium text-gray-700 p-3 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsOpen(false)}>About Us</Link>
          <Link href="/cart" className="text-base font-medium text-gray-700 p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between" onClick={() => setIsOpen(false)}>
            <span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Cart</span>
            {totalItems > 0 && <span className="bg-[#0B9B9B] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{totalItems}</span>}
          </Link>
          <div className="h-px bg-gray-200 my-2" />
          <a 
            href="https://play.google.com/store/apps/details?id=com.sm.neet" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
          >
            <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-full w-full h-11 font-semibold shadow-md">
              Download App
            </Button>
          </a>
          {user ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-10 w-10 border-2 border-teal-500">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-white font-semibold">
                    {displayName.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <Link href="/dashboard" className="text-base font-medium text-gray-700 p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <User className="h-4 w-4" /> Dashboard
              </Link>
              <Link href="/profile" className="text-base font-medium text-gray-700 p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <User className="h-4 w-4" /> My Profile
              </Link>
              <Button 
                variant="outline" 
                className="w-full text-red-600 border-red-200 hover:bg-red-50 rounded-full h-11 font-semibold"
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
              <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-full w-full h-11 font-semibold shadow-md" onClick={() => setIsOpen(false)}>
                Sign Up
              </Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
