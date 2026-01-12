import { useEffect, useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Download, Share2, Loader2, Check, Lock, Package, X, Tag, BookOpen, Percent, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

declare global { interface Window { Razorpay: any; } }

interface Material {
  id: string; title: string; slug: string; description?: string; download_count?: number;
  file_url?: string; thumbnail_url?: string; material_type?: string; is_premium?: boolean;
  price?: number; original_price?: number; file_size?: number; created_at?: string;
  has_hard_copy?: boolean; hard_copy_price?: number; shipping_cost?: number;
  chapter?: { id: string; name: string; subject?: { id: string; name: string; }; };
}

interface ShippingAddress {
  name: string; phone: string; email: string; address_line1: string; address_line2: string;
  city: string; state: string; pincode: string;
}

export default function MaterialDetail() {
  const [, params] = useRoute("/materials/:slug");
  const [, setLocation] = useLocation();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutType, setCheckoutType] = useState<'digital' | 'physical'>('digital');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string; code: string; discount_type: 'percentage' | 'fixed';
    discount_value: number; max_discount_amount?: number;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [guestInfo, setGuestInfo] = useState<ShippingAddress>({
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

  useEffect(() => { if (params?.slug) fetchMaterial(params.slug); }, [params?.slug]);
  useEffect(() => { if (user && material) checkPurchaseStatus(); }, [user, material]);

  const checkPurchaseStatus = async () => {
    if (!user || !material) return;
    try {
      const res = await fetch(`/api/check-purchase/${user.id}/${material.id}`);
      const data = await res.json();
      // API only returns true for digital purchases, not physical
      setIsPurchased(data.purchased);
    } catch (err) {}
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) { toast({ title: "Enter a coupon code", variant: "destructive" }); return; }
    setValidatingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), materialId: material?.id, deliveryType: checkoutType, userId: user?.id }),
      });
      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) { toast({ title: "Server Error", variant: "destructive" }); return; }
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon(data.coupon);
        toast({ title: "🎉 Coupon Applied!", description: `You save ₹${calculateDiscountAmount(data.coupon)}` });
      } else {
        toast({ title: "Invalid Coupon", description: data.error, variant: "destructive" });
      }
    } catch (err) { toast({ title: "Error", variant: "destructive" }); }
    finally { setValidatingCoupon(false); }
  };

  const calculateDiscountAmount = (coupon: any) => {
    const basePrice = checkoutType === 'physical' ? hardCopyTotal : (material?.price || 0);
    if (!coupon) return 0;
    let d = coupon.discount_type === 'percentage' ? (basePrice * coupon.discount_value) / 100 : coupon.discount_value;
    if (coupon.discount_type === 'percentage' && coupon.max_discount_amount) d = Math.min(d, coupon.max_discount_amount);
    return Math.min(d, basePrice);
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(''); };

  const calculateDiscount = (price: number) => {
    if (!appliedCoupon) return 0;
    let d = appliedCoupon.discount_type === 'percentage' ? (price * appliedCoupon.discount_value) / 100 : appliedCoupon.discount_value;
    if (appliedCoupon.discount_type === 'percentage' && appliedCoupon.max_discount_amount) d = Math.min(d, appliedCoupon.max_discount_amount);
    return Math.min(d, price);
  };

  const openCheckout = (type: 'digital' | 'physical') => {
    setCheckoutType(type);
    setShowCheckoutModal(true);
    // Pre-fill email if logged in
    if (user?.email) {
      setGuestInfo(prev => ({ ...prev, email: user.email || '' }));
    }
  };


  const fetchMaterial = async (slugOrId: string) => {
    setLoading(true); setError(null);
    try {
      const headers = { 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` };
      let res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/study_materials?slug=eq.${encodeURIComponent(slugOrId)}&select=*,chapter:chapters(*,subject:subjects(*))`, { headers });
      let data = res.ok ? await res.json() : [];
      if (!data?.length) {
        res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/study_materials?id=eq.${encodeURIComponent(slugOrId)}&select=*,chapter:chapters(*,subject:subjects(*))`, { headers });
        data = await res.json();
      }
      data?.length ? setMaterial(data[0]) : setError('Material not found');
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!material?.file_url) { toast({ title: "File not available", variant: "destructive" }); return; }
    if (user) {
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/study_materials?id=eq.${material.id}`, {
          method: 'PATCH', headers: { 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ download_count: (material.download_count || 0) + 1 })
        });
      } catch (e) {}
    }
    window.open(material.file_url, '_blank');
    toast({ title: "Download Started" });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: material?.title, url }); } catch {} }
    else { navigator.clipboard.writeText(url); toast({ title: "Link Copied" }); }
  };


  const handlePurchase = async () => {
    // Validate required fields
    if (!guestInfo.email) { toast({ title: "Email is required", variant: "destructive" }); return; }
    if (checkoutType === 'physical') {
      if (!guestInfo.name || !guestInfo.phone || !guestInfo.address_line1 || !guestInfo.city || !guestInfo.state || !guestInfo.pincode) {
        toast({ title: "Fill all address fields", variant: "destructive" }); return;
      }
    }
    
    const basePrice = checkoutType === 'physical' ? hardCopyTotal : (material?.price || 0);
    const discount = calculateDiscount(basePrice);
    const finalPrice = basePrice - discount;
    
    if (finalPrice === 0 && checkoutType === 'digital') { handleDownload(); setShowCheckoutModal(false); return; }
    
    setProcessingPayment(true);
    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: finalPrice, 
          originalAmount: basePrice, 
          discountAmount: discount, 
          couponId: appliedCoupon?.id, 
          couponCode: appliedCoupon?.code, 
          materialId: material?.id, 
          userId: user?.id || null,
          guestEmail: guestInfo.email,
          deliveryType: checkoutType, 
          shippingAddress: checkoutType === 'physical' ? guestInfo : null 
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.orderId) throw new Error('Failed to create order');
      
      const razorpay = new window.Razorpay({
        key: orderData.keyId, amount: orderData.amount, currency: orderData.currency, name: 'NEETPeak',
        description: material?.title, order_id: orderData.orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              ...response, 
              materialId: material?.id, 
              userId: user?.id || null,
              guestEmail: guestInfo.email,
              amount: finalPrice, 
              originalAmount: basePrice, 
              discountAmount: discount, 
              couponId: appliedCoupon?.id, 
              couponCode: appliedCoupon?.code, 
              deliveryType: checkoutType, 
              shippingAddress: checkoutType === 'physical' ? guestInfo : null 
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            toast({ title: "🎉 Purchase Successful!", description: checkoutType === 'digital' ? "Your download will start shortly" : "You'll receive tracking info via email" });
            setIsPurchased(true); setShowCheckoutModal(false); removeCoupon();
            if (checkoutType === 'digital' && material?.file_url) setTimeout(() => window.open(material.file_url, '_blank'), 500);
          } else toast({ title: "Payment Failed", variant: "destructive" });
          setProcessingPayment(false);
        },
        prefill: { email: guestInfo.email, contact: guestInfo.phone },
        theme: { color: '#0B9B9B' },
        modal: { ondismiss: () => setProcessingPayment(false) }
      });
      razorpay.open();
    } catch (err) { toast({ title: "Error", variant: "destructive" }); setProcessingPayment(false); }
  };


  const isFree = !material?.price || material.price === 0;
  const canAccess = isFree || isPurchased;
  const hardCopyTotal = (material?.hard_copy_price || 0) + (material?.shipping_cost || 0);
  const currentPrice = checkoutType === 'physical' ? hardCopyTotal : (material?.price || 0);
  const discount = calculateDiscount(currentPrice);
  const finalPrice = currentPrice - discount;
  const digitalDiscount = calculateDiscount(material?.price || 0);
  const digitalFinalPrice = (material?.price || 0) - digitalDiscount;
  const hardCopyDiscount = calculateDiscount(hardCopyTotal);
  const hardCopyFinalPrice = hardCopyTotal - hardCopyDiscount;

  if (loading) return (
    <div className="min-h-screen bg-white"><Navbar />
      <div className="pt-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#0B9B9B]" /></div>
    </div>
  );

  if (error || !material) return (
    <div className="min-h-screen bg-white"><Navbar />
      <div className="pt-20 px-4 text-center">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-4">Material not found</p>
        <Link href="/materials"><Button size="sm" className="bg-[#0B9B9B]"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button></Link>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <Navbar />
      
      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:w-[450px] md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between md:rounded-t-2xl">
              <div>
                <span className="font-bold text-lg">{checkoutType === 'physical' ? '📦 Hard Copy Order' : '📥 Digital Download'}</span>
                <p className="text-xs text-gray-500">{material.title}</p>
              </div>
              <button onClick={() => setShowCheckoutModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="h-5 w-5" /></button>
            </div>
            
            {/* Coupon Section - Prominent */}
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

            {/* Form */}
            <div className="p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Address *</label>
                <Input 
                  placeholder="your@email.com" 
                  type="email"
                  value={guestInfo.email} 
                  onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})} 
                  className="h-11 mt-1" 
                />
                <p className="text-xs text-gray-500 mt-1">We'll send your {checkoutType === 'digital' ? 'download link' : 'order updates'} here</p>
              </div>
              
              {checkoutType === 'physical' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Full Name *</label>
                      <Input placeholder="John Doe" value={guestInfo.name} onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})} className="h-11 mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone *</label>
                      <Input placeholder="9876543210" type="tel" value={guestInfo.phone} onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})} className="h-11 mt-1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Address *</label>
                    <Input placeholder="House/Flat No., Street, Area" value={guestInfo.address_line1} onChange={(e) => setGuestInfo({...guestInfo, address_line1: e.target.value})} className="h-11 mt-1" />
                  </div>
                  <Input placeholder="Landmark (Optional)" value={guestInfo.address_line2} onChange={(e) => setGuestInfo({...guestInfo, address_line2: e.target.value})} className="h-11" />
                  <div className="grid grid-cols-3 gap-3">
                    <Input placeholder="City *" value={guestInfo.city} onChange={(e) => setGuestInfo({...guestInfo, city: e.target.value})} className="h-11" />
                    <Input placeholder="State *" value={guestInfo.state} onChange={(e) => setGuestInfo({...guestInfo, state: e.target.value})} className="h-11" />
                    <Input placeholder="Pincode *" type="tel" value={guestInfo.pincode} onChange={(e) => setGuestInfo({...guestInfo, pincode: e.target.value})} className="h-11" />
                  </div>
                </>
              )}
            </div>

            {/* Price Summary */}
            <div className="p-4 bg-gray-50 border-t">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{checkoutType === 'physical' ? 'Product + Shipping' : 'Price'}</span>
                  <span>₹{currentPrice}</span>
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

            {/* Pay Button */}
            <div className="p-4">
              <Button onClick={handlePurchase} disabled={processingPayment} className="w-full h-12 bg-[#0B9B9B] hover:bg-[#1B5E5E] font-bold text-lg">
                {processingPayment ? <Loader2 className="h-5 w-5 animate-spin" /> : `Pay ₹${finalPrice}`}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-2">🔒 Secure payment via Razorpay</p>
            </div>
          </div>
        </div>
      )}


      {/* Header */}
      <div className="pt-14 md:pt-16 px-4 py-2 border-b">
        <div className="max-w-5xl mx-auto">
          <Link href="/materials">
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#0B9B9B]">
              <ArrowLeft className="h-4 w-4" /> Back to Materials
            </button>
          </Link>
        </div>
      </div>

      {/* Content - Two Column on Desktop */}
      <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">
        <div className="md:flex md:gap-8">
          
          {/* Left - Image */}
          <div className="md:w-[45%] md:flex-shrink-0">
            <div className="relative aspect-[4/5] md:aspect-[3/4] bg-[#1a1f3c] rounded-xl overflow-hidden shadow-lg">
              {material.thumbnail_url ? (
                <img src={material.thumbnail_url} alt={material.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1a1f3c] to-[#2d3561] flex items-center justify-center">
                  <FileText className="h-20 w-20 text-white/20" />
                </div>
              )}
              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {material.chapter?.subject?.name && <Badge className="bg-[#0B9B9B] text-white text-xs">{material.chapter.subject.name}</Badge>}
                {material.chapter?.name && <Badge className="bg-blue-500 text-white text-xs">{material.chapter.name}</Badge>}
              </div>
              {/* Price Badge */}
              {!isFree && !isPurchased && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-[#0B9B9B] text-white font-bold px-3 py-1">₹{appliedCoupon ? digitalFinalPrice : material.price}</Badge>
                </div>
              )}
            </div>
          </div>


          {/* Right - Info */}
          <div className="mt-4 md:mt-0 md:flex-1">
            {/* Title */}
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{material.title}</h1>
            
            {/* Description */}
            {material.description && (
              <p className="mt-2 text-sm md:text-base text-gray-600 leading-relaxed">{material.description}</p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Download className="h-4 w-4" /> {material.download_count || 0} downloads
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> {material.chapter?.subject?.name || 'PDF'}
              </span>
            </div>

            {/* Coupon Section - Always visible for paid materials */}
            {!canAccess && !isFree && (
              <div className="mt-4 p-3 bg-gradient-to-r from-[#0B9B9B]/5 to-[#0DCDCD]/10 rounded-xl border border-[#0B9B9B]/20">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-4 w-4 text-[#0B9B9B]" />
                  <span className="text-sm font-semibold text-[#1B5E5E]">Have a Coupon Code?</span>
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-100 rounded-lg p-2">
                    <span className="text-sm font-bold text-green-700 flex items-center gap-1">
                      <Check className="h-4 w-4" /> {appliedCoupon.code} - ₹{digitalDiscount} off!
                    </span>
                    <button onClick={removeCoupon} className="text-xs text-red-500 font-medium">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter code" 
                      value={couponCode} 
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                      className="h-9 text-sm uppercase flex-1 border-dashed" 
                    />
                    <Button onClick={validateCoupon} disabled={validatingCoupon || !couponCode} size="sm" className="h-9 bg-[#0B9B9B]">
                      {validatingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                )}
              </div>
            )}


            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              {canAccess ? (
                <>
                  <Button onClick={handleDownload} className="w-full h-11 bg-[#0B9B9B] hover:bg-[#1B5E5E] font-semibold">
                    <Download className="mr-2 h-4 w-4" /> Download Now
                  </Button>
                  {isPurchased && (
                    <p className="text-center text-sm text-green-600 flex items-center justify-center gap-1">
                      <Check className="h-4 w-4" /> You own this material
                    </p>
                  )}
                </>
              ) : isFree ? (
                <Button onClick={handleDownload} className="w-full h-11 bg-green-500 hover:bg-green-600 font-semibold">
                  <Download className="mr-2 h-4 w-4" /> Download Free
                </Button>
              ) : (
                <>
                  <Button onClick={() => openCheckout('digital')} disabled={processingPayment} className="w-full h-11 bg-[#0B9B9B] hover:bg-[#1B5E5E] font-semibold">
                    {processingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <>
                        <Download className="mr-2 h-4 w-4" /> 
                        Buy Digital - ₹{appliedCoupon ? digitalFinalPrice : material.price}
                      </>
                    )}
                  </Button>
                  {material.has_hard_copy && (
                    <Button onClick={() => openCheckout('physical')} variant="outline" className="w-full h-11 border-[#0B9B9B] text-[#0B9B9B] hover:bg-[#0B9B9B]/5">
                      <Package className="mr-2 h-4 w-4" /> Get Hard Copy - ₹{appliedCoupon ? hardCopyFinalPrice : hardCopyTotal}
                    </Button>
                  )}
                  <p className="text-xs text-center text-gray-500">No login required • Instant access after payment</p>
                </>
              )}
              
              <Button onClick={handleShare} variant="outline" className="w-full h-11">
                <Share2 className="mr-2 h-4 w-4" /> Share Material
              </Button>
            </div>
          </div>
        </div>
      </div>


      {/* Mobile Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 md:hidden z-40">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {isFree ? <span className="text-lg font-bold text-green-600">FREE</span>
            : isPurchased ? <span className="text-sm font-bold text-[#0B9B9B]">Owned</span>
            : <span className="text-xl font-bold">₹{appliedCoupon ? digitalFinalPrice : material.price}</span>}
          </div>
          <div className="flex-1">
            {canAccess ? (
              <Button onClick={handleDownload} className="w-full h-10 bg-[#0B9B9B] font-semibold text-sm">
                <Download className="mr-1 h-4 w-4" /> Download
              </Button>
            ) : (
              <Button onClick={() => openCheckout('digital')} disabled={processingPayment} className="w-full h-10 bg-[#0B9B9B] font-semibold text-sm">
                {processingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buy Now'}
              </Button>
            )}
          </div>
          {!canAccess && material.has_hard_copy && (
            <Button onClick={() => openCheckout('physical')} variant="outline" size="icon" className="h-10 w-10 border-[#0B9B9B] text-[#0B9B9B]">
              <Package className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}