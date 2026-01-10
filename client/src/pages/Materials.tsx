import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Search, Eye, BookOpen, Lock, ShoppingCart, Check, IndianRupee } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
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
  slug?: string;
  description?: string;
  download_count?: number;
  file_url?: string;
  thumbnail_url?: string;
  material_type?: string;
  is_premium?: boolean;
  price?: number;
  original_price?: number;
  file_size?: number;
  chapter?: {
    id: string;
    name: string;
    subject?: {
      id: string;
      name: string;
    };
  };
}

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchMaterials();
    loadRazorpayScript();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserPurchases();
    }
  }, [user]);

  useEffect(() => {
    filterMaterials();
  }, [searchQuery, materials]);

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/study_materials?select=*,chapter:chapters(*,subject:subjects(*))&is_active=eq.true&order=created_at.desc`,
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
      
      const data = await response.json();
      console.log('✅ Materials fetched:', data?.length || 0);
      setMaterials(data || []);
      setFilteredMaterials(data || []);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message);
      setMaterials([]);
      setFilteredMaterials([]);
    }
    
    setLoading(false);
  };

  const fetchUserPurchases = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/purchases/${user.id}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const ids = new Set(data.map((p: any) => p.material_id));
        setPurchasedIds(ids);
      }
    } catch (err) {
      console.error('Error fetching purchases:', err);
    }
  };

  const filterMaterials = () => {
    if (!searchQuery) {
      setFilteredMaterials(materials);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = materials.filter(m =>
      m.title?.toLowerCase().includes(query) ||
      m.chapter?.name?.toLowerCase().includes(query) ||
      m.chapter?.subject?.name?.toLowerCase().includes(query)
    );
    setFilteredMaterials(filtered);
  };

  const handlePurchase = async (material: Material) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to purchase materials",
        variant: "destructive"
      });
      return;
    }

    if (!material.price || material.price === 0) {
      // Free material - direct download
      handleDownload(material);
      return;
    }

    setProcessingPayment(material.id);

    try {
      // Create order
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

      // Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'NEETPeak',
        description: material.title,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          // Verify payment
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
            setPurchasedIds(prev => new Set([...Array.from(prev), material.id]));
            
            // Instant download after purchase
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
          setProcessingPayment(null);
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#0B9B9B',
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(null);
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
      setProcessingPayment(null);
    }
  };

  const handleDownload = async (material: Material) => {
    if (!material.file_url) {
      toast({
        title: "Error",
        description: "File not available",
        variant: "destructive"
      });
      return;
    }

    // Check if paid material and not purchased
    if (material.price && material.price > 0 && !purchasedIds.has(material.id)) {
      handlePurchase(material);
      return;
    }

    // Track download
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getMaterialIcon = (type?: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-8 w-8" />;
      case 'notes': return <BookOpen className="h-8 w-8" />;
      default: return <FileText className="h-8 w-8" />;
    }
  };

  const isPurchased = (materialId: string) => purchasedIds.has(materialId);
  const isFree = (material: Material) => !material.price || material.price === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#AFFFFF]/20 to-white">
      <Navbar />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2 text-gray-900">
              Study Materials Shop
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Premium NEET study notes, e-books, and revision guides
            </p>
            <div className="mt-4 text-sm text-[#0B9B9B] font-medium">
              {!loading && `${filteredMaterials.length} materials available`}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by title, subject, or chapter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-full border-gray-200 shadow-sm"
              />
            </div>
          </div>

          {/* Materials Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="border-none shadow-lg overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-none shadow-lg bg-white max-w-lg mx-auto">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-red-300 mx-auto mb-4" />
                <p className="text-red-600 font-medium mb-2">Error loading materials</p>
                <p className="text-gray-500 text-sm mb-4">{error}</p>
                <Button onClick={fetchMaterials} className="bg-[#0B9B9B] hover:bg-[#1B5E5E]">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filteredMaterials.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMaterials.map((material) => (
                <Card key={material.id} className="border-none shadow-lg hover:shadow-xl transition-all bg-white group overflow-hidden flex flex-col">
                  {/* Thumbnail */}
                  <Link href={`/materials/${material.slug || material.id}`}>
                    <div className="relative h-48 bg-gradient-to-br from-[#AFFFFF]/30 to-[#0DCDCD]/20 flex items-center justify-center cursor-pointer">
                      {material.thumbnail_url ? (
                        <img 
                          src={material.thumbnail_url} 
                          alt={material.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-[#0B9B9B]">
                          {getMaterialIcon(material.material_type)}
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {material.chapter?.subject?.name && (
                          <Badge variant="secondary" className="bg-white/90 text-[#1B5E5E]">
                            {material.chapter.subject.name}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {isFree(material) ? (
                          <Badge className="bg-green-500 text-white">FREE</Badge>
                        ) : isPurchased(material.id) ? (
                          <Badge className="bg-[#0B9B9B] text-white">
                            <Check className="h-3 w-3 mr-1" /> Purchased
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500 text-white">
                            <Lock className="h-3 w-3 mr-1" /> Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                  
                  <CardContent className="p-4 flex flex-col flex-1">
                    <Link href={`/materials/${material.slug || material.id}`}>
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-[#0B9B9B] transition-colors cursor-pointer">
                        {material.title}
                      </h3>
                    </Link>
                    
                    {material.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {material.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      {material.chapter?.name && (
                        <span className="truncate">{material.chapter.name}</span>
                      )}
                      {material.file_size && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(material.file_size)}</span>
                        </>
                      )}
                    </div>

                    {/* Price Section */}
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-3">
                        {isFree(material) ? (
                          <span className="text-lg font-bold text-green-600">Free</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-[#1B5E5E] flex items-center">
                              <IndianRupee className="h-4 w-4" />{material.price}
                            </span>
                            {material.original_price && material.original_price > (material.price || 0) && (
                              <span className="text-sm text-gray-400 line-through flex items-center">
                                <IndianRupee className="h-3 w-3" />{material.original_price}
                              </span>
                            )}
                          </div>
                        )}
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {material.download_count || 0}
                        </span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {isFree(material) || isPurchased(material.id) ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.preventDefault();
                                material.file_url && window.open(material.file_url, '_blank');
                              }}
                              className="flex-1 h-9"
                            >
                              <Eye className="h-4 w-4 mr-1" /> Preview
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDownload(material);
                              }}
                              className="flex-1 h-9 bg-[#0B9B9B] hover:bg-[#1B5E5E]"
                            >
                              <Download className="h-4 w-4 mr-1" /> Download
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePurchase(material);
                            }}
                            disabled={processingPayment === material.id}
                            className="w-full h-9 bg-gradient-to-r from-[#1B5E5E] to-[#0B9B9B] hover:from-[#0B9B9B] hover:to-[#1B5E5E]"
                          >
                            {processingPayment === material.id ? (
                              'Processing...'
                            ) : (
                              <>
                                <ShoppingCart className="h-4 w-4 mr-1" /> Buy Now
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-lg bg-white max-w-lg mx-auto">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-[#AFFFFF]/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-[#0B9B9B]" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {searchQuery ? 'No Results Found' : 'No Materials Yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? `No materials found matching "${searchQuery}".` 
                    : 'Study materials will appear here once added by admins.'}
                </p>
                {searchQuery && (
                  <Button 
                    onClick={() => setSearchQuery('')}
                    className="bg-[#0B9B9B] hover:bg-[#1B5E5E]"
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
