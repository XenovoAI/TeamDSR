import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Package, Share2, Loader2, X, Tag, Truck, ShoppingCart, Check } from "lucide-react";
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
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: ''
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
        setShowCouponInput(false);
        toast({ title: "Coupon Applied!" });
      } else {
        toast({ title: "Invalid Coupon", description: data.error, variant: "destructive" });
      }
    } catch (err) { toast({ title: "Error", variant: "destructive" }); }
    setValidatingCoupon(false);
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(''); };

  const calculateDiscount = (price: number) => {
    if (!appliedCoupon) return 0;
    let d = appliedCoupon.discount_type === 'percentage' ? (price * appliedCoupon.discount_value) / 100 : appliedCoupon.discount_value;
    if (appliedCoupon.max_discount_amount) d = Math.min(d, appliedCoupon.max_discount_amount);
    return Math.min(d, price);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: product?.title, url }); } catch {} }
    else { navigator.clipboard.writeText(url); toast({ title: "Link Copied" }); }
  };


  const handlePurchase = async () => {
    if (!user) { toast({ title: "Please login first", variant: "destructive" }); return; }
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address_line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      toast({ title: "Fill all address fields", variant: "destructive" }); return;
    }
    if (!product) return;

    const basePrice = product.price + product.shipping_cost;
    const discount = calculateDiscount(basePrice);
    const finalPrice = basePrice - discount;

    setProcessingPayment(true);
    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalPrice,
          originalAmount: basePrice,
          discountAmount: discount,
          couponId: appliedCoupon?.id,
          couponCode: appliedCoupon?.code,
          productId: product.id,
          productType: 'hardcopy',
          userId: user.id,
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
              userId: user.id,
              amount: finalPrice,
              originalAmount: basePrice,
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
        prefill: { email: user.email },
        theme: { color: '#0B9B9B' },
        modal: { ondismiss: () => setProcessingPayment(false) }
      });
      razorpay.open();
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
      setProcessingPayment(false);
    }
  };

  const totalPrice = product ? product.price + product.shipping_cost : 0;
  const discount = calculateDiscount(totalPrice);
  const finalPrice = totalPrice - discount;

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
        <p className="text-gray-600 mb-6">Your order for "{product.title}" has been placed successfully. You'll receive tracking information via email once shipped.</p>
        <div className="space-y-3">
          <Link href="/dashboard"><Button className="w-full bg-[#0B9B9B]">View My Orders</Button></Link>
          <Link href="/materials"><Button variant="outline" className="w-full">Continue Shopping</Button></Link>
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
          <div className="bg-white w-full md:w-[400px] md:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-3 border-b flex items-center justify-between">
              <span className="font-semibold">Delivery Address</span>
              <button onClick={() => setShowAddressModal(false)} className="p-1"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <Input placeholder="Full Name *" value={shippingAddress.name} onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})} />
              <Input placeholder="Phone Number *" type="tel" value={shippingAddress.phone} onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})} />
              <Input placeholder="Address Line 1 *" value={shippingAddress.address_line1} onChange={(e) => setShippingAddress({...shippingAddress, address_line1: e.target.value})} />
              <Input placeholder="Landmark (Optional)" value={shippingAddress.address_line2} onChange={(e) => setShippingAddress({...shippingAddress, address_line2: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="City *" value={shippingAddress.city} onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} />
                <Input placeholder="State *" value={shippingAddress.state} onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})} />
              </div>
              <Input placeholder="Pincode *" type="tel" value={shippingAddress.pincode} onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})} />
            </div>
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between text-sm mb-2">
                <span>Product Price</span><span>₹{product.price}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Shipping</span><span>₹{product.shipping_cost}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 mb-2">
                  <span>Discount</span><span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span><span>₹{finalPrice}</span>
              </div>
            </div>
            <div className="p-4">
              <Button onClick={handlePurchase} disabled={processingPayment} className="w-full h-12 bg-[#0B9B9B] hover:bg-[#1B5E5E] font-semibold">
                {processingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pay ₹${finalPrice}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pt-14 md:pt-16 px-4 py-2 border-b">
        <div className="max-w-5xl mx-auto">
          <Link href="/materials">
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#0B9B9B]">
              <ArrowLeft className="h-4 w-4" /> Back to Shop
            </button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">
        <div className="md:flex md:gap-8">
          {/* Image */}
          <div className="md:w-[45%] md:flex-shrink-0">
            <div className="relative aspect-[4/5] md:aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden shadow-lg">
              {product.thumbnail_url ? (
                <img src={product.thumbnail_url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Package className="h-20 w-20 text-gray-300" /></div>
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                {product.subject?.name && <Badge className="bg-blue-500 text-white">{product.subject.name}</Badge>}
                <Badge className="bg-purple-500 text-white"><Truck className="h-3 w-3 mr-1" />Ships in 2-3 days</Badge>
              </div>
              {product.stock_quantity < 10 && (
                <Badge className="absolute top-3 right-3 bg-red-500">Only {product.stock_quantity} left!</Badge>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 md:mt-0 md:flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{product.title}</h1>
            {product.description && <p className="mt-2 text-gray-600">{product.description}</p>}

            {/* Price */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl font-bold text-[#1B5E5E]">₹{appliedCoupon ? finalPrice : totalPrice}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-lg text-gray-400 line-through">₹{product.original_price + product.shipping_cost}</span>
              )}
              <Badge className="bg-green-500">Free Shipping on ₹{product.shipping_cost}+</Badge>
            </div>

            <p className="text-sm text-gray-500 mt-1">Includes ₹{product.shipping_cost} shipping</p>

            {/* Coupon */}
            <div className="mt-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2">
                  <span className="text-sm font-medium text-green-700 flex items-center gap-1">
                    <Tag className="h-3 w-3" />{appliedCoupon.code} - ₹{discount} off
                  </span>
                  <button onClick={removeCoupon} className="text-xs text-red-500">Remove</button>
                </div>
              ) : showCouponInput ? (
                <div className="flex gap-2">
                  <Input placeholder="Enter code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="uppercase flex-1" />
                  <Button onClick={validateCoupon} disabled={validatingCoupon} size="sm" className="bg-[#0B9B9B]">
                    {validatingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
                  </Button>
                  <Button onClick={() => setShowCouponInput(false)} variant="ghost" size="sm"><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <button onClick={() => setShowCouponInput(true)} className="text-sm text-[#0B9B9B] hover:underline flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Have a coupon code?
                </button>
              )}
            </div>

            {/* Specs */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-500">Weight</span>
                <p className="font-medium">{product.weight_kg} kg</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-500">Dimensions</span>
                <p className="font-medium">{product.dimensions_cm}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <Button onClick={() => setShowAddressModal(true)} className="w-full h-12 bg-[#0B9B9B] hover:bg-[#1B5E5E] font-semibold text-lg">
                <ShoppingCart className="mr-2 h-5 w-5" /> Buy Now - ₹{appliedCoupon ? finalPrice : totalPrice}
              </Button>
              <Button onClick={handleShare} variant="outline" className="w-full h-11">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 md:hidden z-40">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-xl font-bold">₹{appliedCoupon ? finalPrice : totalPrice}</span>
            <p className="text-xs text-gray-500">incl. shipping</p>
          </div>
          <Button onClick={() => setShowAddressModal(true)} className="flex-1 h-11 bg-[#0B9B9B] font-semibold">
            <ShoppingCart className="mr-1 h-4 w-4" /> Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
