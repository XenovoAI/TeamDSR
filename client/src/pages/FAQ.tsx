import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      question: "What subjects does NEET Peak cover?",
      answer: "NEET Peak provides comprehensive study materials for all three subjects required for NEET: Physics, Chemistry, and Biology (Botany and Zoology). Our content is aligned with the latest NEET syllabus and covers all topics from Class 11 and Class 12."
    },
    {
      question: "Are the questions from NCERT?",
      answer: "Yes! NCERT forms the foundation of our content. We cover all NCERT topics thoroughly and also include additional questions from previous year NEET papers, reference books, and our expert-created question bank to ensure comprehensive preparation beyond just NCERT."
    },
    {
      question: "Is this platform suitable for beginners?",
      answer: "Absolutely! NEET Peak is designed for students at all levels - whether you're just starting your NEET preparation or are in the final stages of revision. Our content is structured from basic to advanced levels, with clear explanations and step-by-step solutions."
    },
    {
      question: "What is included in the free plan?",
      answer: "The free plan includes access to limited study materials, sample test papers, basic doubt resolution, and community features. You can explore the platform and get a feel for our teaching methodology before upgrading to premium."
    },
    {
      question: "Who should take the premium plan?",
      answer: "The premium plan is ideal for serious NEET aspirants who want complete access to all study materials, unlimited mock tests, detailed performance analytics, personalized mentorship, doubt resolution with experts, and downloadable content for offline study. It's perfect for students who want comprehensive preparation in one place."
    },
    {
      question: "How are the mock tests structured?",
      answer: "Our mock tests are designed to simulate the actual NEET exam pattern with 180 questions (45 Physics, 45 Chemistry, 90 Biology) to be completed in 3 hours. We provide detailed solutions, performance analysis, All India Rank predictions, and topic-wise strength analysis after each test."
    },
    {
      question: "Can I access content offline?",
      answer: "Yes! Premium members can download study materials, notes, and question banks for offline access through our mobile app. However, mock tests and live doubt sessions require an internet connection."
    },
    {
      question: "Will this help if I already studied NCERT?",
      answer: "Definitely! Even if you've completed NCERT, NEET Peak helps you go beyond with previous year questions, advanced problem-solving techniques, quick revision notes, memory techniques, and exam strategies. Our mock tests and performance analytics help identify weak areas that need more focus."
    },
    {
      question: "Do you provide doubt resolution?",
      answer: "Yes! Premium members get access to our expert doubt resolution system. You can post your doubts with images, and our subject experts will provide detailed explanations within 24 hours. We also conduct live doubt-clearing sessions regularly."
    },
    {
      question: "How is the mentorship program structured?",
      answer: "Our mentorship program connects you with NEET toppers and experienced educators who provide personalized guidance on study planning, time management, exam strategies, and motivation. Mentors conduct one-on-one sessions and help create customized study plans based on your strengths and weaknesses."
    },
    {
      question: "Are previous year NEET questions included?",
      answer: "Yes! We have a comprehensive collection of previous year NEET questions from the last 15+ years, organized topic-wise and year-wise. Each question comes with detailed video and text solutions explaining the concept and approach."
    },
    {
      question: "Can I track my preparation progress?",
      answer: "Absolutely! Our advanced analytics dashboard shows your topic-wise performance, time management patterns, accuracy rates, improvement trends, and predicted All India Rank. You can identify weak areas and track your progress over time with detailed graphs and reports."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Yes! NEET Peak is available as a mobile app on the Google Play Store. The app offers the same features as the website with the added benefit of offline content access and push notifications for important updates and test reminders."
    },
    {
      question: "What is your refund policy?",
      answer: "We offer a 7-day money-back guarantee. If you're not satisfied with the premium plan within the first 7 days and haven't accessed more than 20% of the content, you can request a full refund. Please refer to our Refund Policy page for complete details."
    },
    {
      question: "How often is content updated?",
      answer: "Our content is continuously updated to reflect the latest NEET syllabus changes, exam patterns, and trends. We add new mock tests weekly, update study materials based on recent NEET papers, and incorporate student feedback to improve content quality regularly."
    },
    {
      question: "Do you provide hard copy study materials?",
      answer: "Yes! We offer printed study materials, formula booklets, and revision notes that can be ordered separately. These are delivered to your doorstep and are perfect for students who prefer physical books alongside digital content."
    },
    {
      question: "Can multiple students use one account?",
      answer: "No, each subscription is for individual use only. Account sharing violates our Terms of Service and may result in account suspension. We track login patterns and device usage to ensure fair use. We offer family discounts if multiple siblings want to subscribe."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major payment methods including Credit/Debit Cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and Wallets. All transactions are processed through secure payment gateways with bank-level encryption."
    },
    {
      question: "Is there a validity period for premium plans?",
      answer: "Yes, premium plans come with different validity periods: Monthly (30 days), Quarterly (90 days), Half-Yearly (180 days), and Annual (365 days). You can choose based on your exam timeline. The annual plan offers the best value for money."
    },
    {
      question: "How do I contact support?",
      answer: "You can reach our support team via email at help.neetpeak@gmail.com or call us at +91 8696873558. We also have a live chat feature on the website and app. Our support team is available Monday to Saturday, 9 AM to 8 PM IST."
    }
  ];

  return (
    <div className="min-h-screen bg-[#E8F5F3]">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-12 md:pt-24 md:pb-16 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-10 md:mb-14 bg-gradient-to-b from-[#D4F1ED] to-transparent py-12 -mx-4 px-4 rounded-3xl">
          <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4 text-gray-900">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto">
            Everything you need to know about NEET Peak
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white border-none rounded-2xl px-6 py-2 shadow-sm hover:shadow-md transition-all duration-200 data-[state=open]:shadow-lg"
              >
                <AccordionTrigger className="text-left font-semibold text-base md:text-lg hover:no-underline text-gray-900 hover:text-[#0B9B9B] transition-colors py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed pt-2 pb-5 text-[15px]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0B9B9B] via-[#0DCDCD] to-[#0B9B9B] rounded-3xl p-8 md:p-12 text-center shadow-2xl mt-12">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3 text-white">
              Still have questions?
            </h2>
            <p className="text-white/90 mb-8 text-base md:text-lg max-w-xl mx-auto">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#0B9B9B] font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contact Support
              </a>
              <a 
                href="mailto:help.neetpeak@gmail.com" 
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-bold rounded-xl border-2 border-white hover:bg-white hover:text-[#0B9B9B] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Us
              </a>
            </div>
            
            {/* Contact Info */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/90 text-sm">
                <a href="mailto:help.neetpeak@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  help.neetpeak@gmail.com
                </a>
                <a href="https://wa.me/918696873558" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.516 3.516c4.686-4.686 12.284-4.686 16.97 0 4.686 4.686 4.686 12.283 0 16.97a12.004 12.004 0 01-13.754 2.299l-5.814.735a.392.392 0 01-.438-.44l.748-5.788A12.002 12.002 0 013.517 3.517zm3.61 17.043l.3.158a9.846 9.846 0 0011.534-1.758c3.843-3.843 3.843-10.074 0-13.918-3.843-3.843-10.075-3.843-13.918 0a9.846 9.846 0 00-1.747 11.554l.16.303-.51 3.942a.196.196 0 00.219.22l3.961-.501zm6.534-7.003l-.933 1.164a9.843 9.843 0 01-3.497-3.495l1.166-.933a.792.792 0 00.23-.94L9.561 6.96a.793.793 0 00-.924-.445 1.118 1.118 0 00-.813.813 7.044 7.044 0 00.006 3.754 13.915 13.915 0 006.166 6.166 7.044 7.044 0 003.754.006 1.118 1.118 0 00.813-.813.792.792 0 00-.445-.923l-2.393-1.065a.792.792 0 00-.94.23z"/>
                  </svg>
                  +91 8696873558
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
