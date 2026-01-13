import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    targetYear: "",
    contactMethod: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.email || !formData.subject) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate form submission (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    setSubmitted(true);
    
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-20">
          <Card className="max-w-lg mx-auto border border-[#0DCDCD]/30 shadow-xl">
            <CardContent className="p-10 text-center">
              <div className="h-20 w-20 rounded-full bg-[#0DCDCD] flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#0B9B9B] mb-3">Thank You!</h2>
              <p className="text-gray-600 mb-6">
                Your message has been received. Our team will contact you within 24 hours.
              </p>
              <Button 
                onClick={() => setSubmitted(false)}
                className="bg-[#0B9B9B] hover:bg-[#0DCDCD] text-white font-bold"
              >
                Send Another Message
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-28 pb-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#0B9B9B] mb-3">
            Get in Touch
          </h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Have questions about NEET preparation? We're here to help you succeed!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            <Card className="border border-[#0DCDCD]/30 bg-gradient-to-br from-[#0B9B9B] to-[#0DCDCD] hover:shadow-lg transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Email Us</h3>
                  <a href="mailto:help.neetpeak@gmail.com" className="text-white/80 text-sm hover:text-white">
                    help.neetpeak@gmail.com
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#0DCDCD]/30 bg-gradient-to-br from-[#0B9B9B] to-[#0DCDCD] hover:shadow-lg transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Call / WhatsApp</h3>
                  <a href="https://wa.me/918696873558" target="_blank" rel="noopener noreferrer" className="text-white/80 text-sm hover:text-white">
                    +91 8696873558
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#0DCDCD]/30 bg-gradient-to-br from-[#0B9B9B] to-[#0DCDCD] hover:shadow-lg transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Location</h3>
                  <p className="text-white/80 text-sm">
                    Jaipur, Rajasthan, India
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Illustration placeholder */}
            <div className="hidden lg:block mt-6">
              <div className="bg-[#0B9B9B]/10 rounded-2xl p-6 text-center border border-[#0DCDCD]/20">
                <div className="text-6xl mb-3">📚</div>
                <p className="text-gray-600 text-sm">
                  Join 10,000+ NEET aspirants who trust NEETPeak
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border border-[#0DCDCD]/30 shadow-lg">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Row */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-gray-700 text-sm font-medium">First Name *</label>
                      <Input
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="h-12 border-gray-300 focus:border-[#0DCDCD] focus:ring-[#0DCDCD]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-700 text-sm font-medium">Last Name</label>
                      <Input
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="h-12 border-gray-300 focus:border-[#0DCDCD] focus:ring-[#0DCDCD]"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-gray-700 text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="h-12 border-gray-300 focus:border-[#0DCDCD] focus:ring-[#0DCDCD]"
                      required
                    />
                  </div>

                  {/* Phone & Subject Row */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-gray-700 text-sm font-medium">Phone</label>
                      <Input
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="h-12 border-gray-300 focus:border-[#0DCDCD] focus:ring-[#0DCDCD]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-700 text-sm font-medium">Subject *</label>
                      <Select 
                        value={formData.subject} 
                        onValueChange={(value) => setFormData({...formData, subject: value})}
                      >
                        <SelectTrigger className="h-12 border-gray-300">
                          <SelectValue placeholder="Choose a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="study-materials">Study Materials</SelectItem>
                          <SelectItem value="order-issue">Order Issue</SelectItem>
                          <SelectItem value="payment">Payment Query</SelectItem>
                          <SelectItem value="mentorship">Mentorship</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Target Year & Contact Method */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-gray-700 text-sm font-medium">NEET Target Year</label>
                      <Select 
                        value={formData.targetYear} 
                        onValueChange={(value) => setFormData({...formData, targetYear: value})}
                      >
                        <SelectTrigger className="h-12 border-gray-300">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2025">NEET 2025</SelectItem>
                          <SelectItem value="2026">NEET 2026</SelectItem>
                          <SelectItem value="2027">NEET 2027</SelectItem>
                          <SelectItem value="dropper">Dropper</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-700 text-sm font-medium">Preferred Contact</label>
                      <Select 
                        value={formData.contactMethod} 
                        onValueChange={(value) => setFormData({...formData, contactMethod: value})}
                      >
                        <SelectTrigger className="h-12 border-gray-300">
                          <SelectValue placeholder="How to reach you?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-gray-700 text-sm font-medium">Message</label>
                    <Textarea
                      placeholder="Tell us how we can help you..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={4}
                      className="border-gray-300 focus:border-[#0DCDCD] focus:ring-[#0DCDCD] resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 text-lg font-bold bg-[#0B9B9B] hover:bg-[#0DCDCD] text-white rounded-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Submit
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
