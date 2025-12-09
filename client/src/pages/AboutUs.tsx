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
          <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            About Team DSR
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering students to learn smarter, grow faster, and achieve their dreams through quality education.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-5xl mx-auto">
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-8">
              <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 mb-4">
                <Target size={28} />
              </div>
              <h2 className="font-heading text-2xl font-bold mb-3">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To make quality education accessible to every student by providing comprehensive study materials, 
                interactive practice tests, and personalized learning experiences that help them excel in their academics.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-8">
              <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-purple-600 mb-4">
                <Award size={28} />
              </div>
              <h2 className="font-heading text-2xl font-bold mb-3">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become India's most trusted learning platform where students not only prepare for exams 
                but develop a genuine love for learning and build skills that last a lifetime.
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
                  Team DSR was founded by <span className="font-semibold text-foreground">Digraj Singh Rajput</span>, 
                  an educator passionate about transforming how students learn and prepare for their board exams.
                </p>
                <p>
                  Having witnessed countless students struggle with scattered resources and ineffective study methods, 
                  Digraj envisioned a platform that would bring everything a student needs under one roof - from 
                  comprehensive notes to interactive quizzes, all designed with the CBSE curriculum in mind.
                </p>
                <p>
                  Today, Team DSR serves thousands of students across India, helping them achieve better grades, 
                  build confidence, and develop a deeper understanding of their subjects. Our content is created 
                  by experienced educators who understand the challenges students face and know how to make 
                  learning engaging and effective.
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
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
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
                <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-4">
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
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white">
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
