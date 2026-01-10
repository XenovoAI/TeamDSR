import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RotateCcw, FileText, Package, Clock, AlertTriangle, CheckCircle } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#AFFFFF]/10 to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2 text-center">
            Refund & Cancellation Policy
          </h1>
          <p className="text-muted-foreground text-center mb-10">
            Last updated: January 2026
          </p>

          <div className="space-y-8">
            {/* Digital Products */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#AFFFFF]/50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-[#1B5E5E]" />
                </div>
                <h2 className="text-xl font-bold">Digital Products</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong>No Refunds:</strong> Due to the nature of digital products (PDFs, e-books, notes), 
                  all sales are final and non-refundable once the download link is accessed.
                </p>
                <p>
                  <strong>Exceptions:</strong> Refund may be considered if:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The file is corrupted and cannot be opened</li>
                  <li>The content is significantly different from the description</li>
                  <li>Technical issues prevent download (must be reported within 24 hours)</li>
                </ul>
              </div>
            </section>

            {/* Hard Copy Products */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#0DCDCD]/20 flex items-center justify-center">
                  <Package className="h-5 w-5 text-[#0B9B9B]" />
                </div>
                <h2 className="text-xl font-bold">Hard Copy Products</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cancellation</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Orders can be cancelled within 24 hours of placing the order</li>
                    <li>Once shipped, orders cannot be cancelled</li>
                    <li>Full refund will be processed for cancelled orders within 5-7 business days</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Returns</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Returns accepted within 7 days of delivery</li>
                    <li>Product must be unused and in original packaging</li>
                    <li>Return shipping cost will be borne by the customer</li>
                    <li>Refund will be processed after inspection of returned product</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Damaged Products</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Report damaged products within 24 hours of delivery with photos</li>
                    <li>We will arrange free replacement or full refund</li>
                    <li>Do not accept visibly damaged packages from courier</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Refund Timeline */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#5DDDDD]/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-[#1B5E5E]" />
                </div>
                <h2 className="text-xl font-bold">Refund Timeline</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Cancellation refund:</strong> 5-7 business days</li>
                <li>• <strong>Return refund:</strong> 7-10 business days after receiving the product</li>
                <li>• <strong>Damaged product refund:</strong> 3-5 business days after verification</li>
                <li>• Refund will be credited to the original payment method</li>
              </ul>
            </section>

            {/* How to Request */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#AFFFFF]/50 flex items-center justify-center">
                  <RotateCcw className="h-5 w-5 text-[#0B9B9B]" />
                </div>
                <h2 className="text-xl font-bold">How to Request Refund/Cancellation</h2>
              </div>
              <ol className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-[#0B9B9B] text-white text-sm flex items-center justify-center shrink-0">1</span>
                  <span>Email us at <a href="mailto:support@neetpeak.com" className="text-[#0B9B9B] hover:underline">support@neetpeak.com</a> with your order ID</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-[#0B9B9B] text-white text-sm flex items-center justify-center shrink-0">2</span>
                  <span>Mention the reason for refund/cancellation</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-[#0B9B9B] text-white text-sm flex items-center justify-center shrink-0">3</span>
                  <span>For damaged products, attach clear photos</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-[#0B9B9B] text-white text-sm flex items-center justify-center shrink-0">4</span>
                  <span>Our team will respond within 24-48 hours</span>
                </li>
              </ol>
            </section>

            {/* Non-Refundable */}
            <section className="bg-red-50 rounded-2xl p-6 border border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-red-800">Non-Refundable Cases</h2>
              </div>
              <ul className="space-y-2 text-red-700">
                <li>• Digital products after download link is accessed</li>
                <li>• Hard copy products used, written on, or damaged by customer</li>
                <li>• Orders cancelled after shipping</li>
                <li>• Return requests after 7 days of delivery</li>
                <li>• Products without original packaging</li>
              </ul>
            </section>

            {/* Our Commitment */}
            <section className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-green-800">Our Commitment</h2>
              </div>
              <p className="text-green-700">
                We are committed to providing quality study materials. If you face any genuine issue 
                with your purchase, we will work with you to find a fair solution. Customer satisfaction 
                is our priority.
              </p>
            </section>

            {/* Contact */}
            <section className="text-center py-6">
              <p className="text-muted-foreground">
                For refund or cancellation requests, contact us at{" "}
                <a href="mailto:support@neetpeak.com" className="text-[#0B9B9B] hover:underline">
                  support@neetpeak.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
