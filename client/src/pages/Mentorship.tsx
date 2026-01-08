import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MessageCircle, Calendar, Target, CheckCircle, ArrowRight } from "lucide-react";

export default function Mentorship() {
  const benefits = [
    {
      icon: <Users className="h-8 w-8 text-[#0B9B9B]" />,
      title: "Personal Mentor",
      description: "Get assigned a dedicated mentor who guides you throughout your NEET preparation journey"
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-[#0B9B9B]" />,
      title: "One-on-One Sessions",
      description: "Regular personalized sessions to discuss your doubts, strategy, and progress"
    },
    {
      icon: <Calendar className="h-8 w-8 text-[#0B9B9B]" />,
      title: "Study Planning",
      description: "Customized study plans tailored to your strengths and weaknesses"
    },
    {
      icon: <Target className="h-8 w-8 text-[#0B9B9B]" />,
      title: "Goal Setting",
      description: "Set realistic goals and track your progress with expert guidance"
    }
  ];

  const mentorshipFeatures = [
    "Weekly one-on-one video sessions",
    "Personalized study schedule",
    "24/7 doubt resolution support",
    "Mock test analysis and feedback",
    "Motivation and mental wellness support",
    "Strategy sessions for exam day",
    "Access to exclusive study resources",
    "Progress tracking and reports"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#AFFFFF]/20 to-white pt-28 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[#0DCDCD]/20 text-[#1B5E5E] rounded-full text-sm font-semibold mb-6">
            Limited Seats Available
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Personal Mentorship for NEET Success
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Connect with experienced mentors who have successfully cracked NEET and understand your journey
          </p>
          <Button className="bg-[#0B9B9B] hover:bg-[#0DCDCD] text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
            Apply for Mentorship <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all bg-white group">
              <CardContent className="p-8">
                <div className="mb-4 w-16 h-16 bg-[#AFFFFF]/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* What You Get Section */}
        <div className="bg-gradient-to-br from-[#1B5E5E] to-[#0B9B9B] rounded-3xl shadow-2xl p-8 md:p-12 mb-16 text-white">
          <h2 className="text-3xl font-bold mb-8 text-center">What You Get with Mentorship</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {mentorshipFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-[#5DDDDD] flex-shrink-0" />
                <span className="text-lg">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">How It Works</h2>
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#0B9B9B] to-[#0DCDCD] text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                1
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-xl font-bold mb-2 text-gray-900">Apply for Mentorship</h3>
                <p className="text-gray-600 leading-relaxed">Fill out a simple form telling us about your goals, current preparation level, and what you're looking for in a mentor</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#0B9B9B] to-[#0DCDCD] text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                2
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-xl font-bold mb-2 text-gray-900">Get Matched with Your Mentor</h3>
                <p className="text-gray-600 leading-relaxed">We'll carefully match you with a mentor based on your needs, learning style, and target score. Meet your mentor in an intro call</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#0B9B9B] to-[#0DCDCD] text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                3
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-xl font-bold mb-2 text-gray-900">Start Your Journey</h3>
                <p className="text-gray-600 leading-relaxed">Begin your personalized mentorship journey with regular sessions, custom study plans, and continuous guidance until you crack NEET</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button className="bg-[#0B9B9B] hover:bg-[#0DCDCD] text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
              Start Your Application <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
