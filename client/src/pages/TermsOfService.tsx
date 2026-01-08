import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-12 md:pt-24 md:pb-16 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: December 21, 2025</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6 md:p-10 space-y-8">
            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using NEETPeak's platform, you accept and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services. These terms apply to all users, 
                including students, parents, and educators.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">2. Use of Services</h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="font-semibold text-foreground">You agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the platform only for lawful educational purposes</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>Keep your account credentials secure and confidential</li>
                  <li>Not share your account with others</li>
                  <li>Not copy, distribute, or modify our content without permission</li>
                </ul>
                
                <p className="font-semibold text-foreground mt-4">You agree NOT to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use automated systems to access or scrape our content</li>
                  <li>Attempt to hack, disrupt, or compromise platform security</li>
                  <li>Upload malicious code or viruses</li>
                  <li>Impersonate others or create fake accounts</li>
                  <li>Use the platform for commercial purposes without authorization</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">3. Account Registration</h2>
              <p className="text-muted-foreground leading-relaxed">
                To access certain features, you must create an account. You are responsible for maintaining the 
                confidentiality of your account and password. You agree to notify us immediately of any unauthorized 
                use of your account. We reserve the right to suspend or terminate accounts that violate these terms.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">4. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                All content on NEETPeak, including study materials, videos, quizzes, and software, is owned by 
                NEETPeak or its licensors and is protected by copyright and intellectual property laws.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>You may access content for personal, non-commercial educational use only</li>
                <li>You may not reproduce, distribute, or create derivative works without written permission</li>
                <li>Downloading content for offline study is permitted only through official features</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">5. Subscriptions and Payments</h2>
              <div className="space-y-3 text-muted-foreground">
                <p><span className="font-semibold text-foreground">Free Access:</span> Basic features are available for free with limited content.</p>
                <p><span className="font-semibold text-foreground">Premium Subscriptions:</span> Full access requires a paid subscription with monthly or annual billing.</p>
                <p><span className="font-semibold text-foreground">Refunds:</span> Refunds are available within 7 days of purchase if you haven't accessed premium content. After 7 days, subscriptions are non-refundable.</p>
                <p><span className="font-semibold text-foreground">Cancellation:</span> You may cancel your subscription anytime. Access continues until the end of the billing period.</p>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">6. Content Accuracy</h2>
              <p className="text-muted-foreground leading-relaxed">
                While we strive to provide accurate and up-to-date educational content, we do not guarantee that 
                all information is error-free or complete. Content is for educational purposes and should not be 
                the sole basis for academic decisions. Always verify important information with official sources.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">7. User-Generated Content</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you submit questions, comments, or feedback, you grant NEETPeak a non-exclusive, royalty-free 
                license to use, modify, and display such content. You represent that you own or have rights to any 
                content you submit and that it does not violate any laws or third-party rights.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                NEETPeak is provided "as is" without warranties of any kind. We are not liable for any indirect, 
                incidental, or consequential damages arising from your use of the platform. Our total liability 
                shall not exceed the amount you paid for the service in the past 12 months.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for violations of these terms, 
                fraudulent activity, or any conduct we deem harmful to the platform or other users. Upon termination, 
                your right to access the platform ceases immediately.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may modify these terms at any time. We will notify users of significant changes via email or 
                platform notification. Continued use after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">11. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms are governed by the laws of India. Any disputes shall be resolved in the courts of 
                [Your City], India.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-4">12. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">Email: support@examfusion.com</p>
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
