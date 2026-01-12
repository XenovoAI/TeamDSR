import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Package, Share2, Loader2, X, Tag, Truck, ShoppingCart, Check, Gift, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

declare global { interface Window { Razorpay: any; } }

interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
  price: number;
  original_price?: number;
  shipping_cost: number;
  stock_quantity: number;
  weight_kg: number;
  dimensions_cm: string;
  subject?: { id: string; name: string };
}

interface ShippingAddress {
  name: string;
  phone: string;
  email: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
}

export default function HardCopyDetail() {
  const [, params] = useRoute("/shop/:slug");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '', phone: '', email: '', address_line1: '', address_line2: '', city: '', state: '', pincode: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => { if (params?.slug) fetchProduct(params.slug); }, [params?.slug]);
  
  useEffect(() => {
    // Pre-fill email if logged in
    if (user?.email) {
      setShippingAddress(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);

  const fetchProduct = async (slugOrId: string) => {
    setLoading(true);
    try {
      const headers = { 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` };
      let res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/hard_copy_products?slug=eq.${encodeURIComponent(slugOrId)}&is_active=eq.true&select=*,subject:subjects(id,name)`, { headers });
      let data = res.ok ? await res.json() : [];
      if (!data?.length) {
        res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/hard_copy_products?id=eq.${encodeURIComponent(slugOrId)}&is_active=eq.true&select=*,subject:subjects(id,name)`, { headers });
        data = await res.json();
      }
      data?.length ? setProduct(data[0]) : setError('Product not found');
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), materialId: product?.id, deliveryType: 'physical', userId: user?.id }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon(data.coupon);
        toast({ title: "🎉 Coupon Applied!", description: `You save ₹${calculateDiscount(totalPrice)}` });
      } else {
        toast({ title: "Invalid Coupon", description: data.error, variant: "destructive" });
      }
    } catch (err) { toast({ title: "Error", variant: "destructive" }); }
    setValidatingCoupon(false);
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(''); };

  const totalPrice = product ? product.price + product.shipping_cost : 0;
  
  const calculateDiscount = (price: number) => {
    if (!appliedCoupon) return 0;
    let d = appliedCoupon.discount_type === 'percentage' ? (price * appliedCoupon.discount_value) / 100 : appliedCoupon.discount_value;
    if (appliedCoupon.max_discount_amount) d = Math.min(d, appliedCoupon.max_discount_amount);
    return Math.min(d, price);
  };

  const discount = calculateDiscount(totalPrice);
  const finalPrice = totalPrice - discount;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: product?.title, url }); } catch {} }
    else { navigator.clipboard.writeText(url); toast({ title: "Link Copied" }); }
  };


  const handlePurchase = async () => {
    if (!shippingAddress.email) { toast({ title: "Email is required", variant: "destructive" }); return; }
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address_line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      toast({ title: "Fill all address fields", variant: "destructive" }); return;
    }
    if (!product) return;

    setProcessingPayment(true);
    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalPrice,
          originalAmount: totalPrice,
          discountAmount: discount,
          couponId: appliedCoupon?.id,
          couponCode: appliedCoupon?.code,
          productId: product.id,
          productType: 'hardcopy',
          userId: user?.id || null,
          guestEmail: shippingAddress.email,
          deliveryType: 'physical',
          shippingAddress,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.orderId) throw new Error('Failed to create order');

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'NEETPeak',
        description: product.title,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              productId: product.id,
              productType: 'hardcopy',
              userId: user?.id || null,
              guestEmail: shippingAddress.email,
              amount: finalPrice,
              originalAmount: totalPrice,
              discountAmount: discount,
              couponId: appliedCoupon?.id,
              couponCode: appliedCoupon?.code,
              deliveryType: 'physical',
              shippingAddress,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setOrderSuccess(true);
            setShowAddressModal(false);
            toast({ title: "Order Placed! 🎉", description: "You'll receive tracking info soon" });
          } else {
            toast({ title: "Payment Failed", variant: "destructive" });
          }
          setProcessingPayment(false);
        },
        prefill: { email: shippingAddress.email, contact: shippingAddress.phone },
        theme: { color: '#0B9B9B' },
        modal: { ondismiss: () => setProcessingPayment(false) }
      });
      razorpay.open();
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
      setProcessingPayment(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white"><Navbar />
      <div className="pt-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#0B9B9B]" /></div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-white"><Navbar />
      <div className="pt-20 px-4 text-center">
        <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-4">Product not found</p>
        <Link href="/materials"><Button size="sm" className="bg-[#0B9B9B]"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button></Link>
      </div>
    </div>
  );

  if (orderSuccess) return (
    <div className="min-h-screen bg-white"><Navbar />
      <div className="pt-24 px-4 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
        <p className="text-gray-600 mb-6">Your order for "{product.title}" has been placed successfully. You'll receive tracking information at {shippingAddress.email} once shipped.</p>
        <div className="space-y-3">
          <Link href="/materials"><Button className="w-full bg-[#0B9B9B]">Continue Shopping</Button></Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <Navbar />

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:w-[450px] md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between md:rounded-t-2xl">
              <div>
                <span className="font-bold text-lg">📦 Order Details</span>
                <p className="text-xs text-gray-500">{product.title}</p>
              </div>
              <button onClick={() => setShowAddressModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="h-5 w-5" /></button>
            </div>
            
            {/* Coupon Section */}
            <div className="p-4 bg-gradient-to-r from-[#0B9B9B]/5 to-[#0DCDCD]/5 border-b">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-[#0B9B9B]" />
                <span className="font-semibold text-sm">Have a Coupon?</span>
              </div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-100 border border-green-300 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-green-700">{appliedCoupon.code}</span>
                      <p className="text-xs text-green-600">You save ₹{discount}!</p>
                    </div>
                  </div>
                  <button onClick={removeCoupon} className="text-sm text-red-500 hover:text-red-700 font-medium">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter coupon code" 
                    value={couponCode} 
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                    className="h-11 uppercase font-medium flex-1 border-2 border-dashed border-gray-300 focus:border-[#0B9B9B]" 
                  />
                  <Button onClick={validateCoupon} disabled={validatingCoupon || !couponCode} className="h-11 px-6 bg-[#0B9B9B]">
                    {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Address *</label>
                <Input placeholder="your@email.com" type="email" value={shippingAddress.email} onChange={(e) => setShippingAddress({...shippingAddress, email: e.target.value})} className="h-11 mt-1" />
                <p className="text-xs text-gray-500 mt-1">We'll send tracking updates here</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name *</label>
                  <Input placeholder="John Doe" value={shippingAddress.name} onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})} className="h-11 mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone *</label>
                  <Input placeholder="9876543210" type="tel" value={shippingAddress.phone} onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})} className="h-11 mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Address *</label>
                <Input placeholder="House/Flat No., Street, Area" value={shippingAddress.address_line1} onChange={(e) => setShippingAddress({...shippingAddress, address_line1: e.target.value})} className="h-11 mt-1" />
              </div>
              <Input placeholder="Landmark (Optional)" value={shippingAddress.address_line2} onChange={(e) => setShippingAddress({...shippingAddress, address_line2: e.target.value})} className="h-11" />
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="City *" value={shippingAddress.city} onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} className="h-11" />
                <Input placeholder="State *" value={shippingAddress.state} onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})} className="h-11" />
                <Input placeholder="Pincode *" type="tel" value={shippingAddress.pincode} onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})} className="h-11" />
              </div>
            </div>
            
            {/* Price Summary */}
            <div className="p-4 bg-gray-50 border-t">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product Price</span>
                  <span>₹{product.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>₹{product.shipping_cost}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1"><Percent className="h-3 w-3" /> Coupon Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-[#0B9B9B]">₹{finalPrice}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <Button onClick={handlePurchase} disabled={processingPayment} className="w-full h-12 bg-[#0B9B9B] hover:bg-[#1B5E5E] font-bold text-lg">
                {processingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pay ₹${finalPrice}`}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-2">🔒 Secure payment via Razorpay</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pt-14 md:pt-16 px-4 py-2 border-b bg-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto">
          <Link href="/materials">
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#0B9B9B]">
              <ArrowLeft className="h-4 w-4" /> Back to Shop
            </button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <div className="md:flex md:gap-10">
          {/* Image */}
          <div className="md:w-[40%] md:flex-shrink-0">
            <div className="relative aspect-square md:aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden shadow-lg border">
              {product.thumbnail_url ? (
                <img src={product.thumbnail_url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                  <Package className="h-20 w-20 text-blue-200" />
                </div>
              )}
              {/* Badges on image */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.subject?.name && (
                  <Badge className="bg-blue-600 text-white shadow-md">{product.subject.name}</Badge>
                )}
              </div>
              <div className="absolute top-3 right-3">
                <Badge className="bg-purple-600 text-white shadow-md">
                  <Truck className="h-3 w-3 mr-1" />2-3 Days Delivery
                </Badge>
              </div>
              {product.stock_quantity < 10 && (
                <Badge className="absolute bottom-3 right-3 bg-red-500 text-white shadow-md">
                  Only {product.stock_quantity} left!
                </Badge>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 md:mt-0 md:flex-1 space-y-5">
            {/* Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>
            </div>

            {/* Description - Formatted */}
            {product.description && (
              <div className="bg-gray-50 rounded-xl p-4 border">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#0B9B9B]" /> Product Details
                </h3>
                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {product.description.split(/[✅🎯]/g).map((part, i) => {
                    if (!part.trim()) return null;
                    return (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{part.trim()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Card */}
            <div className="bg-gradient-to-r from-[#0B9B9B]/5 to-[#0DCDCD]/10 rounded-xl p-4 border border-[#0B9B9B]/20">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-[#1B5E5E]">₹{appliedCoupon ? finalPrice : totalPrice}</span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-lg text-gray-400 line-through">₹{product.original_price + product.shipping_cost}</span>
                )}
                <Badge className="bg-green-500 text-white">Includes Shipping</Badge>
              </div>
              <p className="text-sm text-gray-500">Product ₹{product.price} + Shipping ₹{product.shipping_cost}</p>
            </div>

            {/* Coupon Section */}
            <div className="bg-white rounded-xl p-4 border-2 border-dashed border-[#0B9B9B]/30">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="h-5 w-5 text-[#0B9B9B]" />
                <span className="font-semibold text-[#1B5E5E]">Have a Coupon Code?</span>
              </div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-green-700">{appliedCoupon.code}</span>
                      <p className="text-xs text-green-600">You save ₹{discount}!</p>
                    </div>
                  </div>
                  <button onClick={removeCoupon} className="text-sm text-red-500 hover:text-red-700 font-medium">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input 
                    placeholder="ENTER CODE" 
                    value={couponCode} 
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                    className="h-11 uppercase font-medium flex-1 text-center tracking-wider" 
                  />
                  <Button onClick={validateCoupon} disabled={validatingCoupon || !couponCode} className="h-11 px-6 bg-[#0B9B9B]">
                    {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
              )}
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border text-center">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Weight</span>
                <p className="font-bold text-lg text-gray-800 mt-1">{product.weight_kg} kg</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border text-center">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Dimensions</span>
                <p className="font-bold text-lg text-gray-800 mt-1">{product.dimensions_cm.replace(/x/g, ' × ')}</p>
              </div>
            </div>

            {/* Actions - Desktop */}
            <div className="hidden md:block space-y-3">
              <Button onClick={() => setShowAddressModal(true)} className="w-full h-14 bg-[#0B9B9B] hover:bg-[#1B5E5E] font-bold text-lg rounded-xl">
                <ShoppingCart className="mr-2 h-5 w-5" /> Buy Now - ₹{appliedCoupon ? finalPrice : totalPrice}
              </Button>
              <p className="text-xs text-center text-gray-500">🔒 No login required • Secure payment via Razorpay</p>
              <Button onClick={handleShare} variant="outline" className="w-full h-11 rounded-xl">
                <Share2 className="mr-2 h-4 w-4" /> Share Product
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 md:hidden z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <span className="text-xl font-bold text-[#1B5E5E]">₹{appliedCoupon ? finalPrice : totalPrice}</span>
            <p className="text-xs text-gray-500">incl. shipping</p>
          </div>
          <Button onClick={() => setShowAddressModal(true)} className="flex-1 h-12 bg-[#0B9B9B] font-bold rounded-xl">
            <ShoppingCart className="mr-2 h-4 w-4" /> Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
