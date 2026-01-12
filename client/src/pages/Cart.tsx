import { useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, Trash2, Plus, Minus, IndianRupee, Tag, Gift, 
  CheckCircle, Loader2, ArrowRight, ShoppingBag 
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Guest checkout fields
  const [guestEmail, setGuestEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    name: "", phone: "", address_line1: "", address_line2: "",
    city: "", state: "", pincode: ""
  });

  const hasPhysicalItems = items.some(i => i.type === 'hardcopy');
  const hasDigitalItems = items.some(i => i.type === 'digital');

  // Calculate discount
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discount = Math.round(subtotal * appliedCoupon.discount_value / 100);
      if (appliedCoupon.max_discount_amount) {
        discount = Math.min(discount, appliedCoupon.max_discount_amount);
      }
    } else {
      discount = appliedCoupon.discount_value;
    }
  }
  const total = Math.max(subtotal - discount, 0);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      // Validate coupon (use first item's ID for validation)
      const firstItem = items[0];
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          materialId: firstItem?.id,
          userId: user?.id
        })
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon(data.coupon);
        toast({ title: "Coupon Applied!", description: `${data.coupon.discount_type === 'percentage' ? data.coupon.discount_value + '%' : '₹' + data.coupon.discount_value} off` });
      } else {
        toast({ title: "Invalid Coupon", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to validate coupon", variant: "destructive" });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    // Validation
    const email = user?.email || guestEmail;
    if (!email) {
      toast({ title: "Email Required", description: "Please enter your email", variant: "destructive" });
      return;
    }
    if (hasPhysicalItems) {
      const { name, phone, address_line1, city, state, pincode } = shippingAddress;
      if (!name || !phone || !address_line1 || !city || !state || !pincode) {
        toast({ title: "Address Required", description: "Please fill shipping address", variant: "destructive" });
        return;
      }
    }

    setProcessing(true);
    try {
      // Create Razorpay order
      const orderRes = await fetch('/api/create-cart-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ id: i.id, type: i.type, quantity: i.quantity, price: i.price })),
          amount: total,
          userId: user?.id || null,
          guestEmail: !user ? guestEmail : null
        })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      // Open Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "NEETPEAK",
        description: `${items.length} item(s)`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          // Verify payment
          const verifyRes = await fetch('/api/verify-cart-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: items.map(i => ({ id: i.id, type: i.type, quantity: i.quantity, price: i.price, title: i.title })),
              userId: user?.id || null,
              guestEmail: !user ? guestEmail : null,
              amount: total,
              originalAmount: subtotal,
              discountAmount: discount,
              couponId: appliedCoupon?.id,
              couponCode: appliedCoupon?.code,
              hasPhysical: hasPhysicalItems,
              shippingAddress: hasPhysicalItems ? shippingAddress : null
            })
          });
          
          if (verifyRes.ok) {
            clearCart();
            toast({ title: "Payment Successful! 🎉", description: "Thank you for your purchase" });
            setLocation(user ? '/dashboard' : '/');
          } else {
            toast({ title: "Payment Failed", description: "Please contact support", variant: "destructive" });
          }
        },
        prefill: { email },
        theme: { color: "#0B9B9B" }
      };
      
      new window.Razorpay(options).open();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="text-center py-20">
            <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some study materials to get started</p>
            <Button onClick={() => setLocation('/materials')} className="bg-[#0B9B9B] hover:bg-[#0A8A8A]">
              <ShoppingBag className="mr-2 h-4 w-4" /> Browse Materials
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <ShoppingCart className="text-[#0B9B9B]" /> Your Cart
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <Card key={`${item.type}-${item.id}`} className="border-none shadow-md">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {item.thumbnail_url && (
                      <img src={item.thumbnail_url} alt={item.title} className="w-20 h-20 object-cover rounded-lg" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded ${item.type === 'digital' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {item.type === 'digital' ? 'Digital' : 'Hard Copy'}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id, item.type)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="font-bold text-[#1B5E5E] flex items-center">
                          <IndianRupee className="h-4 w-4" />{item.price * item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <Card className="border-none shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="h-5 w-5 text-[#0B9B9B]" />
                  <span className="font-medium">Have a coupon?</span>
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700">{appliedCoupon.code}</span>
                      <span className="text-sm text-green-600">-₹{discount}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeCoupon} className="text-red-500 h-8">Remove</Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input placeholder="Enter code" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} />
                    <Button onClick={validateCoupon} disabled={validatingCoupon} className="bg-[#0B9B9B]">
                      {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Guest Email */}
            {!user && (
              <Card className="border-none shadow-md">
                <CardContent className="p-4">
                  <label className="text-sm font-medium mb-2 block">Email Address *</label>
                  <Input type="email" placeholder="your@email.com" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} />
                </CardContent>
              </Card>
            )}

            {/* Shipping Address (for physical items) */}
            {hasPhysicalItems && (
              <Card className="border-none shadow-md">
                <CardContent className="p-4 space-y-3">
                  <div className="font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Shipping Address
                  </div>
                  <Input placeholder="Full Name *" value={shippingAddress.name} onChange={e => setShippingAddress({...shippingAddress, name: e.target.value})} />
                  <Input placeholder="Phone Number *" value={shippingAddress.phone} onChange={e => setShippingAddress({...shippingAddress, phone: e.target.value})} />
                  <Input placeholder="Address Line 1 *" value={shippingAddress.address_line1} onChange={e => setShippingAddress({...shippingAddress, address_line1: e.target.value})} />
                  <Input placeholder="Address Line 2" value={shippingAddress.address_line2} onChange={e => setShippingAddress({...shippingAddress, address_line2: e.target.value})} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="City *" value={shippingAddress.city} onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})} />
                    <Input placeholder="State *" value={shippingAddress.state} onChange={e => setShippingAddress({...shippingAddress, state: e.target.value})} />
                  </div>
                  <Input placeholder="Pincode *" value={shippingAddress.pincode} onChange={e => setShippingAddress({...shippingAddress, pincode: e.target.value})} />
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            <Card className="border-none shadow-md bg-gradient-to-br from-[#0B9B9B]/5 to-[#1B5E5E]/5">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({items.reduce((s,i) => s + i.quantity, 0)} items)</span>
                  <span className="flex items-center"><IndianRupee className="h-3 w-3" />{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-[#1B5E5E] flex items-center"><IndianRupee className="h-5 w-5" />{total}</span>
                </div>
                <Button onClick={handleCheckout} disabled={processing} className="w-full bg-[#0B9B9B] hover:bg-[#0A8A8A] h-12 text-lg">
                  {processing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ArrowRight className="h-5 w-5 mr-2" />}
                  {processing ? 'Processing...' : 'Checkout'}
                </Button>
                {hasDigitalItems && <p className="text-xs text-center text-muted-foreground">Digital items will be available instantly after payment</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
