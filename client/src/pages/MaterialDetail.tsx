import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Download, Share2, Loader2, Check, Lock, Package, X, Tag, BookOpen } from "lucide-react";
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
  name: string; phone: string; address_line1: string; address_line2: string;
  city: string; state: string; pincode: string;
}

export default function MaterialDetail() {
  const [, params] = useRoute("/materials/:slug");
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string; code: string; discount_type: 'percentage' | 'fixed';
    discount_value: number; max_discount_amount?: number;
  } | null>(null);
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

  useEffect(() => { if (params?.slug) fetchMaterial(params.slug); }, [params?.slug]);
  useEffect(() => { if (user && material) checkPurchaseStatus(); }, [user, material]);

  const checkPurchaseStatus = async () => {
    if (!user || !material) return;
    try {
      const res = await fetch(`/api/check-purchase/${user.id}/${material.id}`);
      const data = await res.json();
      setIsPurchased(data.purchased);
    } catch (err) {}
  };

  const validateCoupon = async (deliveryType: 'digital' | 'physical' = 'digital') => {
    if (!couponCode.trim()) { toast({ title: "Enter a coupon code", variant: "destructive" }); return; }
    setValidatingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), materialId: material?.id, deliveryType, userId: user?.id }),
      });
      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) { toast({ title: "Server Error", variant: "destructive" }); return; }
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon(data.coupon);
        setShowCouponInput(false);
        toast({ title: "Coupon Applied!", description: `₹${data.coupon.discount_value} off` });
      } else {
        toast({ title: "Invalid Coupon", description: data.error, variant: "destructive" });
      }
    } catch (err) { toast({ title: "Error", variant: "destructive" }); }
    finally { setValidatingCoupon(false); }
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(''); };

  const calculateDiscount = (price: number) => {
    if (!appliedCoupon) return 0;
    let d = appliedCoupon.discount_type === 'percentage' ? (price * appliedCoupon.discount_value) / 100 : appliedCoupon.discount_value;
    if (appliedCoupon.discount_type === 'percentage' && appliedCoupon.max_discount_amount) d = Math.min(d, appliedCoupon.max_discount_amount);
    return Math.min(d, price);
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


  const handlePurchase = async (type: 'digital' | 'physical' = 'digital') => {
    if (!user) { toast({ title: "Please login first", variant: "destructive" }); return; }
    if (type === 'physical' && (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address_line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode)) {
      toast({ title: "Fill all address fields", variant: "destructive" }); return;
    }
    const basePrice = type === 'physical' ? (material?.hard_copy_price || 0) + (material?.shipping_cost || 0) : (material?.price || 0);
    const discount = calculateDiscount(basePrice);
    const finalPrice = basePrice - discount;
    if (finalPrice === 0 && type === 'digital') { handleDownload(); return; }
    setProcessingPayment(true);
    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalPrice, originalAmount: basePrice, discountAmount: discount, couponId: appliedCoupon?.id, couponCode: appliedCoupon?.code, materialId: material?.id, userId: user.id, deliveryType: type, shippingAddress: type === 'physical' ? shippingAddress : null }),
      });
      const orderData = await orderRes.json();
      if (!orderData.orderId) throw new Error('Failed');
      const razorpay = new window.Razorpay({
        key: orderData.keyId, amount: orderData.amount, currency: orderData.currency, name: 'NEETPeak',
        description: material?.title, order_id: orderData.orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, materialId: material?.id, userId: user.id, amount: finalPrice, originalAmount: basePrice, discountAmount: discount, couponId: appliedCoupon?.id, couponCode: appliedCoupon?.code, deliveryType: type, shippingAddress: type === 'physical' ? shippingAddress : null }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            toast({ title: "Purchase Successful! 🎉" });
            setIsPurchased(true); setShowAddressModal(false); removeCoupon();
            if (type === 'digital' && material?.file_url) setTimeout(() => window.open(material.file_url, '_blank'), 500);
          } else toast({ title: "Payment Failed", variant: "destructive" });
          setProcessingPayment(false);
        },
        prefill: { email: user.email }, theme: { color: '#0B9B9B' },
        modal: { ondismiss: () => setProcessingPayment(false) }
      });
      razorpay.open();
    } catch (err) { toast({ title: "Error", variant: "destructive" }); setProcessingPayment(false); }
  };


  const isFree = !material?.price || material.price === 0;
  const canAccess = isFree || isPurchased;
  const hardCopyTotal = (material?.hard_copy_price || 0) + (material?.shipping_cost || 0);
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
      
      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:w-[400px] md:rounded-2xl rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-3 border-b flex items-center justify-between md:rounded-t-2xl">
              <span className="font-semibold">Delivery Address</span>
              <button onClick={() => setShowAddressModal(false)} className="p-1"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-3 space-y-2">
              <Input placeholder="Full Name *" value={shippingAddress.name} onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})} className="h-10" />
              <Input placeholder="Phone *" type="tel" value={shippingAddress.phone} onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})} className="h-10" />
              <Input placeholder="Address *" value={shippingAddress.address_line1} onChange={(e) => setShippingAddress({...shippingAddress, address_line1: e.target.value})} className="h-10" />
              <Input placeholder="Landmark (Optional)" value={shippingAddress.address_line2} onChange={(e) => setShippingAddress({...shippingAddress, address_line2: e.target.value})} className="h-10" />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="City *" value={shippingAddress.city} onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} className="h-10" />
                <Input placeholder="State *" value={shippingAddress.state} onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})} className="h-10" />
              </div>
              <Input placeholder="Pincode *" type="tel" value={shippingAddress.pincode} onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})} className="h-10" />
            </div>
            <div className="p-3 border-t">
              <Button onClick={() => handlePurchase('physical')} disabled={processingPayment} className="w-full h-11 bg-[#0B9B9B] hover:bg-[#1B5E5E] font-semibold">
                {processingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pay ₹${appliedCoupon ? hardCopyFinalPrice : hardCopyTotal}`}
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

            {/* Coupon Section */}
            {!canAccess && !isFree && (
              <div className="mt-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2">
                    <span className="text-sm font-medium text-green-700 flex items-center gap-1">
                      <Tag className="h-3 w-3" />{appliedCoupon.code} applied - ₹{digitalDiscount} off
                    </span>
                    <button onClick={removeCoupon} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                ) : showCouponInput ? (
                  <div className="flex gap-2">
                    <Input placeholder="Enter code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="h-9 text-sm uppercase flex-1" />
                    <Button onClick={() => validateCoupon('digital')} disabled={validatingCoupon} size="sm" className="h-9 bg-[#0B9B9B]">
                      {validatingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
                    </Button>
                    <Button onClick={() => setShowCouponInput(false)} variant="ghost" size="sm" className="h-9 px-2">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <button onClick={() => setShowCouponInput(true)} className="text-sm text-[#0B9B9B] hover:underline flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Have a coupon code?
                  </button>
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
                  <Button onClick={() => handlePurchase('digital')} disabled={processingPayment} className="w-full h-11 bg-[#0B9B9B] hover:bg-[#1B5E5E] font-semibold">
                    {processingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <>
                        <Download className="mr-2 h-4 w-4" /> 
                        Buy for ₹{appliedCoupon ? digitalFinalPrice : material.price}
                      </>
                    )}
                  </Button>
                  {material.has_hard_copy && (
                    <Button onClick={() => setShowAddressModal(true)} variant="outline" className="w-full h-11 border-[#0B9B9B] text-[#0B9B9B] hover:bg-[#0B9B9B]/5">
                      <Package className="mr-2 h-4 w-4" /> Get Hard Copy - ₹{appliedCoupon ? hardCopyFinalPrice : hardCopyTotal}
                    </Button>
                  )}
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
              <Button onClick={() => handlePurchase('digital')} disabled={processingPayment} className="w-full h-10 bg-[#0B9B9B] font-semibold text-sm">
                {processingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buy Now'}
              </Button>
            )}
          </div>
          {!canAccess && material.has_hard_copy && (
            <Button onClick={() => setShowAddressModal(true)} variant="outline" size="icon" className="h-10 w-10 border-[#0B9B9B] text-[#0B9B9B]">
              <Package className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}