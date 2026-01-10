import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Truck, Clock, MapPin, Package, AlertCircle } from "lucide-react";

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#AFFFFF]/10 to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2 text-center">
            Shipping Policy
          </h1>
          <p className="text-muted-foreground text-center mb-10">
            Last updated: January 2026
          </p>

          <div className="space-y-8">
            {/* Delivery Time */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#AFFFFF]/50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-[#1B5E5E]" />
                </div>
                <h2 className="text-xl font-bold">Delivery Time</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Digital Products:</strong> Instant download after payment</li>
                <li>• <strong>Hard Copy (Metro Cities):</strong> 3-5 business days</li>
                <li>• <strong>Hard Copy (Other Cities):</strong> 5-7 business days</li>
                <li>• <strong>Hard Copy (Remote Areas):</strong> 7-10 business days</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                Delivery times are estimates and may vary due to courier delays, weather conditions, or unforeseen circumstances.
              </p>
            </section>

            {/* Shipping Partners */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#0DCDCD]/20 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-[#0B9B9B]" />
                </div>
                <h2 className="text-xl font-bold">Shipping Partners</h2>
              </div>
              <p className="text-muted-foreground mb-3">
                We partner with trusted courier services to ensure safe and timely delivery:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Delhivery</li>
                <li>• BlueDart</li>
                <li>• DTDC</li>
                <li>• Ecom Express</li>
                <li>• India Post (for remote areas)</li>
              </ul>
            </section>

            {/* Shipping Charges */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#5DDDDD]/20 flex items-center justify-center">
                  <Package className="h-5 w-5 text-[#1B5E5E]" />
                </div>
                <h2 className="text-xl font-bold">Shipping Charges</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Shipping charges are calculated at checkout based on your location</li>
                <li>• Standard shipping: ₹50 - ₹100 depending on location</li>
                <li>• Free shipping on orders above ₹500</li>
                <li>• Digital products have no shipping charges</li>
              </ul>
            </section>

            {/* Delivery Area */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#AFFFFF]/50 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-[#0B9B9B]" />
                </div>
                <h2 className="text-xl font-bold">Delivery Area</h2>
              </div>
              <p className="text-muted-foreground">
                We deliver hard copy materials across India. Currently, we do not ship internationally. 
                If your pincode is not serviceable, you will be notified during checkout.
              </p>
            </section>

            {/* Order Tracking */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#0DCDCD]/20 flex items-center justify-center">
                  <Package className="h-5 w-5 text-[#1B5E5E]" />
                </div>
                <h2 className="text-xl font-bold">Order Tracking</h2>
              </div>
              <p className="text-muted-foreground">
                Once your order is shipped, you will receive a tracking number via email. 
                You can also track your order from your Dashboard under "Hard Copy Orders" section.
              </p>
            </section>

            {/* Important Notes */}
            <section className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <h2 className="text-xl font-bold text-yellow-800">Important Notes</h2>
              </div>
              <ul className="space-y-2 text-yellow-700">
                <li>• Please ensure your shipping address and phone number are correct</li>
                <li>• Someone should be available to receive the package</li>
                <li>• Check the package for any damage before accepting delivery</li>
                <li>• Contact us within 24 hours if you receive a damaged product</li>
              </ul>
            </section>

            {/* Contact */}
            <section className="text-center py-6">
              <p className="text-muted-foreground">
                For shipping related queries, contact us at{" "}
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
