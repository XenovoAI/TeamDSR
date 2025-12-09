export default function Footer() {
  return (
    <footer className="bg-white border-t border-indigo-50 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-heading text-2xl font-bold text-primary mb-4">Team DSR</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Learn Smart, Grow Fast. <br/>
              By Digraj Singh Rajput
            </p>
            <div className="flex gap-4">
              {/* Social placeholders */}
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.409-.06 3.809-.06h.63zm1.673 5.378c-.845 0-1.54.695-1.54 1.543 0 .846.695 1.54 1.54 1.54.846 0 1.54-.694 1.54-1.54 0-.848-.694-1.543-1.54-1.543zm-4.678 1.766c1.29 0 2.336 1.046 2.336 2.336 0 1.29-1.046 2.336-2.336 2.336-1.29 0-2.336-1.046-2.336-2.336 0-1.29 1.046-2.336 2.336-2.336zm0-1.2c-1.954 0-3.536 1.582-3.536 3.536 0 1.954 1.582 3.536 3.536 3.536 1.954 0 3.536-1.582 3.536-3.536 0-1.954-1.582-3.536-3.536-3.536z" clipRule="evenodd" /></svg>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-foreground">Learn</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/practice" className="hover:text-primary">Practice</a></li>
              <li><a href="/study-notes" className="hover:text-primary">Study Notes</a></li>
              <li><a href="/previous-papers" className="hover:text-primary">Previous Papers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/about" className="hover:text-primary">About Us</a></li>
              <li><a href="/careers" className="hover:text-primary">Careers</a></li>
              <li><a href="/privacy" className="hover:text-primary">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-primary">Terms of Service</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-foreground">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">support@teamdsr.com</a></li>
              <li><a href="#" className="hover:text-primary">+91 123 456 7890</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-indigo-50 pt-8 text-center text-sm text-muted-foreground">
          © 2024 Team DSR. All rights reserved.
        </div>
      </div>
    </footer>
  );
}