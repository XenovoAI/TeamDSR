import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-12 md:pt-24 md:pb-16 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: December 21, 2025</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6 md:p-10 space-y-8">
            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Exam Fusion. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and safeguard your information when you use our 
                educational platform.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">2. Information We Collect</h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="font-semibold text-foreground">Personal Information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name, email address, and phone number when you register</li>
                  <li>Profile information including class, school, and subjects</li>
                  <li>Payment information for premium subscriptions (processed securely)</li>
                </ul>
                
                <p className="font-semibold text-foreground mt-4">Usage Data:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Learning progress, quiz scores, and study patterns</li>
                  <li>Device information, IP address, and browser type</li>
                  <li>Pages visited and time spent on the platform</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>To provide and personalize your learning experience</li>
                <li>To track your progress and generate performance reports</li>
                <li>To send important updates about courses and new content</li>
                <li>To improve our platform and develop new features</li>
                <li>To prevent fraud and ensure platform security</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">4. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We do not sell your personal information. We may share your data only in these circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><span className="font-semibold text-foreground">Service Providers:</span> With trusted third parties who help us operate our platform (e.g., payment processors, hosting services)</li>
                <li><span className="font-semibold text-foreground">Legal Requirements:</span> When required by law or to protect our rights and safety</li>
                <li><span className="font-semibold text-foreground">With Your Consent:</span> When you explicitly agree to share information</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your data, including encryption, 
                secure servers, and regular security audits. However, no method of transmission over the internet 
                is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access and download your personal data</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your account and data</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">7. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                and remember your preferences. You can control cookie settings through your browser, but 
                disabling cookies may affect platform functionality.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">8. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our platform is designed for students aged 13 and above. If you are under 13, please use our 
                platform only with parental consent and supervision. We do not knowingly collect data from 
                children under 13 without parental consent.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">9. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of significant changes 
                via email or platform notification. Continued use of our platform after changes constitutes 
                acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">10. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this privacy policy or how we handle your data, please contact us at:
              </p>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">Email: privacy@examfusion.com</p>
                <p className="font-semibold">Phone: +91 XXXXX XXXXX</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
