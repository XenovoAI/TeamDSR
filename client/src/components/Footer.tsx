export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#0DCDCD]/20 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-heading text-2xl font-bold text-[#0B9B9B] mb-4">NEETPeak</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Your NEET Preparation Partner. <br/>
              Physics • Chemistry • Biology
            </p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/neetpeak?igsh=Zm91em51MDhoZnc1" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#AFFFFF]/30 flex items-center justify-center text-[#0B9B9B] hover:bg-[#0B9B9B] hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://youtube.com/@neetpeak?si=2_557qwhmN18YubD" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#AFFFFF]/30 flex items-center justify-center text-[#0B9B9B] hover:bg-[#0B9B9B] hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://t.me/neetpeak" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#AFFFFF]/30 flex items-center justify-center text-[#0B9B9B] hover:bg-[#0B9B9B] hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-foreground">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/materials" className="hover:text-[#0B9B9B]">Study Materials</a></li>
              <li><a href="/mentorship" className="hover:text-[#0B9B9B]">Mentorship</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/about" className="hover:text-[#0B9B9B]">About Us</a></li>
              <li><a href="/faq" className="hover:text-[#0B9B9B]">FAQ</a></li>
              <li><a href="/privacy" className="hover:text-[#0B9B9B]">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-[#0B9B9B]">Terms of Service</a></li>
              <li><a href="/shipping" className="hover:text-[#0B9B9B]">Shipping Policy</a></li>
              <li><a href="/refund" className="hover:text-[#0B9B9B]">Refund & Cancellation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-foreground">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/contact" className="hover:text-[#0B9B9B]">Contact Us</a></li>
              <li><a href="mailto:help.neetpeak@gmail.com" className="hover:text-[#0B9B9B]">help.neetpeak@gmail.com</a></li>
              <li><a href="https://wa.me/918696873558" target="_blank" rel="noopener noreferrer" className="hover:text-[#0B9B9B]">+91 8696873558</a></li>
              <li><a href="/track" className="hover:text-[#0B9B9B]">Track Your Order</a></li>
              <li><a href="https://play.google.com/store/apps/details?id=com.sm.neet" target="_blank" rel="noopener noreferrer" className="hover:text-[#0B9B9B]">Download App</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#0DCDCD]/20 pt-8 text-center text-sm text-muted-foreground">
          © 2025 NEETPeak. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
