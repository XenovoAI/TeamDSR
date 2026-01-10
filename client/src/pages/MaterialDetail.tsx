import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, FileText, Download, Share2, Eye, Loader2, ShoppingCart, 
  Check, IndianRupee, Lock, BookOpen, Clock, Users, Star, Shield,
  CheckCircle, Smartphone, Laptop, FileDown
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
  chapter?: {
    id: string;
    name: string;
    subject?: {
      id: string;
      name: string;
    };
  };
}

export default function MaterialDetail() {
  const [, params] = useRoute("/materials/:slug");
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
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

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to purchase materials",
        variant: "destructive"
      });
      return;
    }

    if (!material?.price || material.price === 0) {
      handleDownload();
      return;
    }

    setProcessingPayment(true);

    try {
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: material.price,
          materialId: material.id,
          userId: user.id,
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
        description: material.title,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              materialId: material.id,
              userId: user.id,
              amount: material.price,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            toast({
              title: "Purchase Successful!",
              description: `You now have access to ${material.title}`,
            });
            setIsPurchased(true);
            
            if (material.file_url) {
              setTimeout(() => {
                window.open(material.file_url, '_blank');
                toast({
                  title: "Download Started",
                  description: "Your file is downloading. You can also access it from your Dashboard.",
                });
              }, 1000);
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
    <div className="min-h-screen bg-gradient-to-b from-[#AFFFFF]/10 to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-24 pb-12 md:pt-28">
        {/* Back Button */}
        <Link href="/materials">
          <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-[#0B9B9B]">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Materials
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
              {/* Thumbnail */}
              <div className="relative h-64 md:h-80 bg-gradient-to-br from-[#AFFFFF]/40 to-[#0DCDCD]/30 flex items-center justify-center">
                {material.thumbnail_url ? (
                  <img 
                    src={material.thumbnail_url} 
                    alt={material.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="h-24 w-24 text-[#0B9B9B]/50" />
                )}
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {material.chapter?.subject?.name && (
                    <Badge className="bg-[#0B9B9B] text-white px-3 py-1">
                      {material.chapter.subject.name}
                    </Badge>
                  )}
                  {material.chapter?.name && (
                    <Badge variant="secondary" className="bg-white/90 text-[#1B5E5E] px-3 py-1">
                      {material.chapter.name}
                    </Badge>
                  )}
                </div>
                
                <div className="absolute top-4 right-4">
                  {isFree ? (
                    <Badge className="bg-green-500 text-white text-sm px-4 py-1">FREE</Badge>
                  ) : isPurchased ? (
                    <Badge className="bg-[#0B9B9B] text-white text-sm px-4 py-1">
                      <Check className="h-3 w-3 mr-1" /> Owned
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500 text-white text-sm px-4 py-1">
                      <Lock className="h-3 w-3 mr-1" /> Premium
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Title & Description */}
              <div className="p-6 md:p-8">
                <h1 className="font-heading text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                  {material.title}
                </h1>
                
                {material.description && (
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
                    {material.description}
                  </p>
                )}
                
                {/* Stats */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-[#0B9B9B]" />
                    <span>{material.download_count || 0} downloads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileDown className="h-4 w-4 text-[#0B9B9B]" />
                    <span>{formatFileSize(material.file_size)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#0B9B9B]" />
                    <span>{material.material_type?.toUpperCase() || 'PDF'}</span>
                  </div>
                  {material.created_at && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#0B9B9B]" />
                      <span>Added {new Date(material.created_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* What's Included */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 md:p-8">
                <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#0B9B9B]" />
                  What's Included
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "Complete chapter coverage",
                    "NEET-focused content",
                    "Easy to understand explanations",
                    "Important formulas & concepts",
                    "Practice questions included",
                    "Instant digital download",
                    "Lifetime access",
                    "Mobile & desktop compatible"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-[#AFFFFF]/50 flex items-center justify-center">
                        <Check className="h-4 w-4 text-[#1B5E5E]" />
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Why Choose This */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 md:p-8">
                <h2 className="font-heading text-xl font-bold mb-6">Why Choose NEETPeak Materials?</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="h-14 w-14 rounded-2xl bg-[#AFFFFF]/40 flex items-center justify-center mx-auto mb-3">
                      <Star className="h-7 w-7 text-[#0B9B9B]" />
                    </div>
                    <h3 className="font-bold mb-1">Expert Content</h3>
                    <p className="text-sm text-muted-foreground">Created by NEET experts and toppers</p>
                  </div>
                  <div className="text-center">
                    <div className="h-14 w-14 rounded-2xl bg-[#0DCDCD]/20 flex items-center justify-center mx-auto mb-3">
                      <Users className="h-7 w-7 text-[#1B5E5E]" />
                    </div>
                    <h3 className="font-bold mb-1">Trusted by Students</h3>
                    <p className="text-sm text-muted-foreground">Thousands of successful aspirants</p>
                  </div>
                  <div className="text-center">
                    <div className="h-14 w-14 rounded-2xl bg-[#5DDDDD]/20 flex items-center justify-center mx-auto mb-3">
                      <Shield className="h-7 w-7 text-[#0B9B9B]" />
                    </div>
                    <h3 className="font-bold mb-1">Secure Payment</h3>
                    <p className="text-sm text-muted-foreground">100% safe & secure checkout</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Card - Right Side (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-none shadow-xl bg-white overflow-hidden">
                <CardContent className="p-0">
                  {/* Price Header */}
                  <div className="bg-gradient-to-r from-[#1B5E5E] to-[#0B9B9B] p-6 text-white">
                    {isFree ? (
                      <div className="text-center">
                        <span className="text-4xl font-bold">FREE</span>
                        <p className="text-white/80 mt-1">No payment required</p>
                      </div>
                    ) : isPurchased ? (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Check className="h-6 w-6" />
                          <span className="text-2xl font-bold">Purchased</span>
                        </div>
                        <p className="text-white/80">You own this material</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-4xl font-bold flex items-center">
                            <IndianRupee className="h-8 w-8" />{material.price}
                          </span>
                          {material.original_price && material.original_price > (material.price || 0) && (
                            <span className="text-xl text-white/60 line-through flex items-center">
                              <IndianRupee className="h-5 w-5" />{material.original_price}
                            </span>
                          )}
                        </div>
                        {discountPercent > 0 && (
                          <Badge className="mt-2 bg-yellow-400 text-yellow-900">
                            {discountPercent}% OFF - Limited Time!
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="p-6 space-y-3">
                    {canAccess ? (
                      <>
                        <Button 
                          size="lg" 
                          onClick={handleDownload}
                          className="w-full h-12 rounded-xl bg-[#0B9B9B] hover:bg-[#1B5E5E] text-base"
                        >
                          <Download className="mr-2 h-5 w-5" /> Download Now
                        </Button>
                        {material.file_url && (
                          <Button 
                            size="lg" 
                            variant="outline" 
                            onClick={() => window.open(material.file_url, '_blank')}
                            className="w-full h-12 rounded-xl border-2 text-base"
                          >
                            <Eye className="mr-2 h-5 w-5" /> Preview File
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button 
                        size="lg" 
                        onClick={handlePurchase}
                        disabled={processingPayment}
                        className="w-full h-14 rounded-xl bg-gradient-to-r from-[#1B5E5E] to-[#0B9B9B] hover:from-[#0B9B9B] hover:to-[#1B5E5E] text-lg font-bold"
                      >
                        {processingPayment ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="mr-2 h-5 w-5" /> Buy Now
                          </>
                        )}
                      </Button>
                    )}
                    
                    <Button 
                      size="lg" 
                      variant="ghost" 
                      onClick={handleShare}
                      className="w-full h-10 rounded-xl text-muted-foreground hover:text-[#0B9B9B]"
                    >
                      <Share2 className="mr-2 h-4 w-4" /> Share with Friends
                    </Button>
                  </div>
                  
                  {/* Trust Badges */}
                  <div className="px-6 pb-6">
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span>Secure payment via Razorpay</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Download className="h-4 w-4 text-[#0B9B9B]" />
                        <span>Instant download after purchase</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Smartphone className="h-4 w-4 text-[#0B9B9B]" />
                        <span>Access on any device</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 text-[#0B9B9B]" />
                        <span>Lifetime access included</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Help Card */}
              <Card className="border-none shadow-md mt-4 bg-[#AFFFFF]/20">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Need help? Contact us at
                  </p>
                  <a href="mailto:support@neetpeak.com" className="text-[#0B9B9B] font-medium text-sm hover:underline">
                    support@neetpeak.com
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
