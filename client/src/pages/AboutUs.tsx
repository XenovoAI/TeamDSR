import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award, Heart } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-12 md:pt-24 md:pb-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#1B5E5E] to-[#0B9B9B] bg-clip-text text-transparent">
            About NEETPeak
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering NEET aspirants to master their exam with confidence through personalized practice and expert guidance.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-5xl mx-auto">
          <Card className="border-none shadow-lg bg-gradient-to-br from-[#AFFFFF]/20 to-[#5DDDDD]/20">
            <CardContent className="p-8">
              <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0B9B9B] mb-4">
                <Target size={28} />
              </div>
              <h2 className="font-heading text-2xl font-bold mb-3">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To make quality NEET preparation accessible to every aspirant by providing comprehensive study materials, 
                interactive practice tests, and personalized learning experiences that help them excel in the NEET exam.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-[#5DDDDD]/20 to-[#0DCDCD]/20">
            <CardContent className="p-8">
              <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0DCDCD] mb-4">
                <Award size={28} />
              </div>
              <h2 className="font-heading text-2xl font-bold mb-3">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become India's most trusted NEET preparation platform where students not only prepare for the exam 
                but develop problem-solving skills and build the confidence needed to crack NEET and pursue their medical dreams.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-none shadow-lg">
            <CardContent className="p-8 md:p-12">
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6 text-center">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  NEETPeak was founded to transform how students prepare for the NEET medical entrance exam, 
                  providing a comprehensive platform dedicated exclusively to NEET aspirants.
                </p>
                <p>
                  Having witnessed countless medical aspirants struggle with scattered resources and ineffective study methods, 
                  we envisioned a platform that would bring everything a NEET student needs under one roof - from 
                  comprehensive notes to topic-wise practice, all designed specifically for NEET success.
                </p>
                <p>
                  Today, NEETPeak serves thousands of NEET aspirants across India, helping them achieve their 
                  dream of becoming doctors, build confidence, and develop a deeper understanding of Physics, Chemistry, and Biology. 
                  Our content is created by medical professionals and experienced educators who understand the challenges NEET aspirants face.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-[#AFFFFF]/30 text-[#0B9B9B] flex items-center justify-center mx-auto mb-4">
                  <Users size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">Student-First</h3>
                <p className="text-sm text-muted-foreground">
                  Every decision we make is centered around what's best for our students' learning journey.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-[#5DDDDD]/30 text-[#0DCDCD] flex items-center justify-center mx-auto mb-4">
                  <Award size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">Quality Content</h3>
                <p className="text-sm text-muted-foreground">
                  We never compromise on the quality and accuracy of our educational materials.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-4">
                  <Heart size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">Passion for Teaching</h3>
                <p className="text-sm text-muted-foreground">
                  We love what we do and it shows in every resource we create for students.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 bg-gradient-to-r from-[#1B5E5E] to-[#0B9B9B] rounded-3xl p-8 md:p-12 text-white">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8 text-center">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">10,000+</div>
              <div className="text-sm md:text-base opacity-90">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-sm md:text-base opacity-90">Study Materials</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">200+</div>
              <div className="text-sm md:text-base opacity-90">Practice Tests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">95%</div>
              <div className="text-sm md:text-base opacity-90">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
