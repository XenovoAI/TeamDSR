import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, FileText, Download, Share2, Eye, Loader2,
  Check, IndianRupee, Lock, BookOpen, Clock, Star, Shield,
  CheckCircle, Smartphone, FileDown, Package, X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Material {
  id: string;
  title: string;
  slug: string;
  description?: string;
  download_count?: number;
  file_url?: string;
  thumbnail_url?: string;
  material_type?: string;
  is_premium?: boolean;
  price?: number;
  original_price?: number;
  file_size?: number;
  created_at?: string;
  has_hard_copy?: boolean;
  hard_copy_price?: number;
  shipping_cost?: number;
  chapter?: {
    id: string;
    name: string;
    subject?: {
      id: string;
      name: string;
    };
  };
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

export default function MaterialDetail() {
  const [, params] = useRoute("/materials/:slug");
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (params?.slug) {
      fetchMaterial(params.slug);
    }
  }, [params?.slug]);

  useEffect(() => {
    if (user && material) {
      checkPurchaseStatus();
    }
  }, [user, material]);

  const checkPurchaseStatus = async () => {
    if (!user || !material) return;
    
    try {
      const response = await fetch(`/api/check-purchase/${user.id}/${material.id}`);
      const data = await response.json();
      setIsPurchased(data.purchased);
    } catch (err) {
      console.error('Error checking purchase:', err);
    }
  };

  const fetchMaterial = async (slugOrId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/study_materials?slug=eq.${encodeURIComponent(slugOrId)}&select=*,chapter:chapters(*,subject:subjects(*))`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          }
        }
      );
      
      let data = [];
      if (response.ok) {
        data = await response.json();
      }
      
      if (!data || data.length === 0) {
        response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/study_materials?id=eq.${encodeURIComponent(slugOrId)}&select=*,chapter:chapters(*,subject:subjects(*))`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        data = await response.json();
      }
      
      if (data && data.length > 0) {
        setMaterial(data[0]);
      } else {
        setError('Material not found');
      }
    } catch (err: any) {
      console.error('Error fetching material:', err);
      setError(err.message);
    }
    
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!material?.file_url) {
      toast({
        title: "Error",
        description: "File not available",
        variant: "destructive"
      });
      return;
    }

    if (user) {
      try {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/study_materials?id=eq.${material.id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              download_count: (material.download_count || 0) + 1
            })
          }
        );
      } catch (e) {
        console.error('Failed to track download:', e);
      }
    }

    window.open(material.file_url, '_blank');
    
    toast({
      title: "Download Started",
      description: `Downloading ${material.title}`,
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: material?.title,
          text: material?.description,
          url: url,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "Material link copied to clipboard",
      });
    }
  };

  const handlePurchase = async (type: 'digital' | 'physical' = 'digital') => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to purchase materials",
        variant: "destructive"
      });
      return;
    }

    // For physical purchase, validate address
    if (type === 'physical') {
      if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address_line1 || 
          !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
        toast({
          title: "Address Required",
          description: "Please fill in all required address fields",
          variant: "destructive"
        });
        return;
      }
    }

    const price = type === 'physical' 
      ? (material?.hard_copy_price || 0) + (material?.shipping_cost || 0)
      : (material?.price || 0);

    if (price === 0 && type === 'digital') {
      handleDownload();
      return;
    }

    setProcessingPayment(true);

    try {
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: price,
          materialId: material?.id,
          userId: user.id,
          deliveryType: type,
          shippingAddress: type === 'physical' ? shippingAddress : null,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.orderId) {
        throw new Error('Failed to create order');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'NEETPeak',
        description: type === 'physical' ? `${material?.title} (Hard Copy)` : material?.title,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              materialId: material?.id,
              userId: user.id,
              amount: price,
              deliveryType: type,
              shippingAddress: type === 'physical' ? shippingAddress : null,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            toast({
              title: "Purchase Successful! 🎉",
              description: type === 'physical' 
                ? `Your hard copy will be shipped soon!`
                : `You now have access to ${material?.title}`,
            });
            setIsPurchased(true);
            setShowAddressModal(false);
            
            if (type === 'digital' && material?.file_url) {
              setTimeout(() => {
                window.open(material.file_url, '_blank');
              }, 500);
            }
          } else {
            toast({
              title: "Payment Failed",
              description: "Please try again or contact support",
              variant: "destructive"
            });
          }
          setProcessingPayment(false);
        },
        prefill: {
          email: user.email,
          contact: shippingAddress.phone || '',
        },
        theme: {
          color: '#0B9B9B',
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to process payment",
        variant: "destructive"
      });
      setProcessingPayment(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isFree = !material?.price || material.price === 0;
  const canAccess = isFree || isPurchased;
  const discountPercent = material?.original_price && material?.price 
    ? Math.round(((material.original_price - material.price) / material.original_price) * 100)
    : 0;
  const hardCopyTotal = (material?.hard_copy_price || 0) + (material?.shipping_cost || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#AFFFFF]/20 to-white">
        <Navbar />
        <div className="pt-28 pb-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0B9B9B]" />
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#AFFFFF]/20 to-white">
        <Navbar />
        <div className="pt-28 pb-16">
          <div className="container mx-auto px-4 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Material Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || 'The requested material does not exist.'}</p>
            <Link href="/materials">
              <Button className="bg-[#0B9B9B] hover:bg-[#1B5E5E]">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Materials
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-8">
      <Navbar />
      
      {/* Address Modal for Hard Copy */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:w-[450px] md:rounded-2xl rounded-t-3xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">Shipping Address</h3>
              <button onClick={() => setShowAddressModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              <Input
                placeholder="Full Name *"
                value={shippingAddress.name}
                onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                className="h-12"
              />
              <Input
                placeholder="Phone Number *"
                type="tel"
                value={shippingAddress.phone}
                onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                className="h-12"
              />
              <Input
                placeholder="Address Line 1 *"
                value={shippingAddress.address_line1}
                onChange={(e) => setShippingAddress({...shippingAddress, address_line1: e.target.value})}
                className="h-12"
              />
              <Input
                placeholder="Address Line 2 (Optional)"
                value={shippingAddress.address_line2}
                onChange={(e) => setShippingAddress({...shippingAddress, address_line2: e.target.value})}
                className="h-12"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="City *"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                  className="h-12"
                />
                <Input
                  placeholder="State *"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                  className="h-12"
                />
              </div>
              <Input
                placeholder="Pincode *"
                type="tel"
                value={shippingAddress.pincode}
                onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})}
                className="h-12"
              />
            </div>
            
            <div className="sticky bottom-0 bg-white border-t p-4">
              <Button 
                onClick={() => handlePurchase('physical')}
                disabled={processingPayment}
                className="w-full h-14 text-lg font-bold bg-[#0B9B9B] hover:bg-[#1B5E5E] rounded-xl"
              >
                {processingPayment ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>Pay ₹{hardCopyTotal}</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 pt-20 md:pt-24">
        {/* Back Button */}
        <Link href="/materials">
          <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </Link>

        {/* Main Content */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left - Product Info */}
          <div className="lg:col-span-3 space-y-4">
            {/* Image */}
            <div className="relative aspect-[4/3] md:aspect-[16/9] bg-white rounded-2xl overflow-hidden shadow-sm">
              {material.thumbnail_url ? (
                <img 
                  src={material.thumbnail_url} 
                  alt={material.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#AFFFFF]/40 to-[#0DCDCD]/30 flex items-center justify-center">
                  <FileText className="h-20 w-20 text-[#0B9B9B]/50" />
                </div>
              )}
              
              {/* Badges on image */}
              <div className="absolute top-3 left-3 flex gap-2">
                {material.chapter?.subject?.name && (
                  <Badge className="bg-[#0B9B9B] text-white text-xs">
                    {material.chapter.subject.name}
                  </Badge>
                )}
              </div>
              
              <div className="absolute top-3 right-3">
                {isFree ? (
                  <Badge className="bg-green-500 text-white">FREE</Badge>
                ) : isPurchased ? (
                  <Badge className="bg-[#0B9B9B] text-white">
                    <Check className="h-3 w-3 mr-1" /> Owned
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500 text-white">
                    <Lock className="h-3 w-3 mr-1" /> Premium
                  </Badge>
                )}
              </div>
            </div>

            {/* Title & Info */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm">
              <h1 className="font-bold text-xl md:text-2xl text-gray-900 mb-2">
                {material.title}
              </h1>
              
              {material.description && (
                <p className="text-muted-foreground text-sm md:text-base mb-4">
                  {material.description}
                </p>
              )}
              
              {/* Stats Row */}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                  <Download className="h-3 w-3" /> {material.download_count || 0}
                </span>
                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                  <FileDown className="h-3 w-3" /> {formatFileSize(material.file_size)}
                </span>
                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                  <BookOpen className="h-3 w-3" /> {material.material_type?.toUpperCase() || 'PDF'}
                </span>
                {material.created_at && (
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                    <Clock className="h-3 w-3" /> {new Date(material.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* What's Included - Hidden on mobile, shown on desktop */}
            <div className="hidden md:block bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#0B9B9B]" />
                What's Included
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  "Complete chapter coverage",
                  "NEET-focused content",
                  "Important formulas",
                  "Practice questions",
                  "Instant download",
                  "Lifetime access"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#0B9B9B]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Purchase Card (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-24">
              <Card className="border-none shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  {/* Price Header */}
                  <div className="bg-gradient-to-r from-[#1B5E5E] to-[#0B9B9B] p-5 text-white text-center">
                    {isFree ? (
                      <span className="text-3xl font-bold">FREE</span>
                    ) : isPurchased ? (
                      <div className="flex items-center justify-center gap-2">
                        <Check className="h-6 w-6" />
                        <span className="text-2xl font-bold">Purchased</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-3xl font-bold">₹{material.price}</span>
                          {material.original_price && material.original_price > (material.price || 0) && (
                            <span className="text-lg text-white/60 line-through">₹{material.original_price}</span>
                          )}
                        </div>
                        {discountPercent > 0 && (
                          <Badge className="mt-2 bg-yellow-400 text-yellow-900 text-xs">
                            {discountPercent}% OFF
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Buttons */}
                  <div className="p-5 space-y-3">
                    {canAccess ? (
                      <>
                        <Button 
                          size="lg" 
                          onClick={handleDownload}
                          className="w-full h-12 bg-[#0B9B9B] hover:bg-[#1B5E5E]"
                        >
                          <Download className="mr-2 h-5 w-5" /> Download Now
                        </Button>
                        {material.file_url && (
                          <Button 
                            size="lg" 
                            variant="outline" 
                            onClick={() => window.open(material.file_url, '_blank')}
                            className="w-full h-12"
                          >
                            <Eye className="mr-2 h-5 w-5" /> Preview
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        <Button 
                          size="lg" 
                          onClick={() => handlePurchase('digital')}
                          disabled={processingPayment}
                          className="w-full h-12 bg-[#0B9B9B] hover:bg-[#1B5E5E] font-bold"
                        >
                          {processingPayment ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              <Download className="mr-2 h-5 w-5" /> Buy Digital - ₹{material.price}
                            </>
                          )}
                        </Button>
                        
                        {material.has_hard_copy && (
                          <Button 
                            size="lg" 
                            variant="outline"
                            onClick={() => setShowAddressModal(true)}
                            className="w-full h-12 border-2 border-[#0B9B9B] text-[#1B5E5E]"
                          >
                            <Package className="mr-2 h-5 w-5" /> 
                            Hard Copy - ₹{hardCopyTotal}
                          </Button>
                        )}
                      </>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      onClick={handleShare}
                      className="w-full text-muted-foreground"
                    >
                      <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                  </div>
                  
                  {/* Trust */}
                  <div className="px-5 pb-5 pt-2 border-t">
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-500" />
                        Secure payment via Razorpay
                      </div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-[#0B9B9B]" />
                        Access on any device
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-3 md:hidden z-40">
        <div className="flex items-center gap-3">
          {/* Price */}
          <div className="flex-shrink-0">
            {isFree ? (
              <span className="text-xl font-bold text-green-600">FREE</span>
            ) : isPurchased ? (
              <span className="text-lg font-bold text-[#0B9B9B]">Owned</span>
            ) : (
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold text-gray-900">₹{material.price}</span>
                  {material.original_price && material.original_price > (material.price || 0) && (
                    <span className="text-sm text-gray-400 line-through">₹{material.original_price}</span>
                  )}
                </div>
                {discountPercent > 0 && (
                  <span className="text-xs text-green-600 font-medium">{discountPercent}% off</span>
                )}
              </div>
            )}
          </div>
          
          {/* Buttons */}
          <div className="flex-1 flex gap-2">
            {canAccess ? (
              <Button 
                onClick={handleDownload}
                className="flex-1 h-12 bg-[#0B9B9B] hover:bg-[#1B5E5E] font-bold text-base rounded-xl"
              >
                <Download className="mr-2 h-5 w-5" /> Download
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => handlePurchase('digital')}
                  disabled={processingPayment}
                  className="flex-1 h-12 bg-[#0B9B9B] hover:bg-[#1B5E5E] font-bold text-base rounded-xl"
                >
                  {processingPayment ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Buy Digital'
                  )}
                </Button>
                
                {material.has_hard_copy && (
                  <Button 
                    variant="outline"
                    onClick={() => setShowAddressModal(true)}
                    className="h-12 px-4 border-2 border-[#0B9B9B] text-[#1B5E5E] font-bold rounded-xl"
                  >
                    <Package className="h-5 w-5" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Hard copy price hint */}
        {!canAccess && material.has_hard_copy && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            Hard copy available for ₹{hardCopyTotal} (incl. shipping)
          </p>
        )}
      </div>
      
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
