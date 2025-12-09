import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Zap, Heart, MapPin, Clock } from "lucide-react";

const openings = [
  {
    title: "Content Writer - Mathematics",
    type: "Full-time",
    location: "Remote",
    description: "Create engaging study materials and practice questions for Class 9-10 Mathematics."
  },
  {
    title: "Subject Matter Expert - Science",
    type: "Part-time",
    location: "Remote",
    description: "Review and validate science content, create chapter summaries and important questions."
  },
  {
    title: "UI/UX Designer",
    type: "Full-time",
    location: "Hybrid",
    description: "Design intuitive and beautiful learning experiences for students on web and mobile."
  },
  {
    title: "Full Stack Developer",
    type: "Full-time",
    location: "Remote",
    description: "Build and maintain our learning platform using modern web technologies."
  }
];

export default function Careers() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-12 md:pt-24 md:pb-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Join Team DSR
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Help us transform education for millions of students across India. Build your career while making a real impact.
          </p>
        </div>

        {/* Why Join Us */}
        <div className="mb-16">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8 text-center">Why Work With Us?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <Heart size={28} />
                </div>
                <h3 className="font-bold text-lg mb-2">Meaningful Work</h3>
                <p className="text-sm text-muted-foreground">
                  Make a real difference in students' lives every single day.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-4">
                  <Zap size={28} />
                </div>
                <h3 className="font-bold text-lg mb-2">Fast Growth</h3>
                <p className="text-sm text-muted-foreground">
                  Rapid career progression in a fast-growing ed-tech startup.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                  <Users size={28} />
                </div>
                <h3 className="font-bold text-lg mb-2">Great Team</h3>
                <p className="text-sm text-muted-foreground">
                  Work with passionate educators and talented professionals.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
                  <MapPin size={28} />
                </div>
                <h3 className="font-bold text-lg mb-2">Remote First</h3>
                <p className="text-sm text-muted-foreground">
                  Work from anywhere with flexible hours and work-life balance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Open Positions */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8 text-center">Open Positions</h2>
          <div className="space-y-4">
            {openings.map((job, index) => (
              <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-2">{job.title}</h3>
                      <p className="text-muted-foreground mb-3">{job.description}</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Briefcase size={16} /> {job.type}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin size={16} /> {job.location}
                        </span>
                      </div>
                    </div>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 shrink-0">
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">Don't See Your Role?</h2>
          <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
            We're always looking for talented individuals who are passionate about education. 
            Send us your resume and let's talk!
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100">
            Send Your Resume
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
