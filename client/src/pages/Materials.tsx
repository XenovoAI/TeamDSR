import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Search, Eye, BookOpen, Lock, ShoppingCart, Check, IndianRupee, Package, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface HardCopyProduct {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
  price: number;
  original_price?: number;
  shipping_cost: number;
  stock_quantity: number;
  subject?: { id: string; name: string };
}

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [hardCopyProducts, setHardCopyProducts] = useState<HardCopyProduct[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [filteredHardCopy, setFilteredHardCopy] = useState<HardCopyProduct[]>([]);
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
  }, [searchQuery, materials, hardCopyProducts]);

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
      // Fetch digital materials
      const materialsRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/study_materials?select=*,chapter:chapters(*,subject:subjects(*))&is_active=eq.true&order=created_at.desc`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          }
        }
      );
      
      // Fetch hard copy products
      const hardCopyRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/hard_copy_products?select=*,subject:subjects(id,name)&is_active=eq.true&order=created_at.desc`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          }
        }
      );
      
      const materialsData = materialsRes.ok ? await materialsRes.json() : [];
      const hardCopyData = hardCopyRes.ok ? await hardCopyRes.json() : [];
      
      setMaterials(materialsData || []);
      setHardCopyProducts(hardCopyData || []);
      setFilteredMaterials(materialsData || []);
      setFilteredHardCopy(hardCopyData || []);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message);
      setMaterials([]);
      setFilteredMaterials([]);
      setHardCopyProducts([]);
      setFilteredHardCopy([]);
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
      setFilteredHardCopy(hardCopyProducts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filteredMats = materials.filter(m =>
      m.title?.toLowerCase().includes(query) ||
      m.chapter?.name?.toLowerCase().includes(query) ||
      m.chapter?.subject?.name?.toLowerCase().includes(query)
    );
    const filteredHC = hardCopyProducts.filter(p =>
      p.title?.toLowerCase().includes(query) ||
      p.subject?.name?.toLowerCase().includes(query)
    );
    setFilteredMaterials(filteredMats);
    setFilteredHardCopy(filteredHC);
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

  // Separate materials by type
  const digitalMaterials = filteredMaterials.filter(m => m.price && m.price > 0);
  const freeMaterials = filteredMaterials.filter(m => !m.price || m.price === 0);

  const renderMaterialCard = (material: Material, showHardCopy: boolean = false) => (
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
              {showHardCopy ? <Package className="h-8 w-8" /> : getMaterialIcon(material.material_type)}
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
            {showHardCopy ? (
              <Badge className="bg-blue-500 text-white">
                <Package className="h-3 w-3 mr-1" /> Hard Copy
              </Badge>
            ) : isFree(material) ? (
              <Badge className="bg-green-500 text-white">FREE</Badge>
            ) : isPurchased(material.id) ? (
              <Badge className="bg-[#0B9B9B] text-white">
                <Check className="h-3 w-3 mr-1" /> Purchased
              </Badge>
            ) : (
              <Badge className="bg-yellow-500 text-white">
                <Download className="h-3 w-3 mr-1" /> Digital
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
          {!showHardCopy && material.file_size && (
            <>
              <span>•</span>
              <span>{formatFileSize(material.file_size)}</span>
            </>
          )}
        </div>

        {/* Price Section */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            {showHardCopy ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#1B5E5E] flex items-center">
                  <IndianRupee className="h-4 w-4" />{(material.hard_copy_price || 0) + (material.shipping_cost || 0)}
                </span>
                <span className="text-xs text-gray-500">(incl. shipping)</span>
              </div>
            ) : isFree(material) ? (
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
            {!showHardCopy && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Download className="h-3 w-3" />
                {material.download_count || 0}
              </span>
            )}
          </div>
          
          {/* Action Buttons */}
          <Link href={`/materials/${material.slug || material.id}`}>
            <Button
              size="sm"
              className="w-full h-9 bg-gradient-to-r from-[#1B5E5E] to-[#0B9B9B] hover:from-[#0B9B9B] hover:to-[#1B5E5E]"
            >
              {showHardCopy ? (
                <>
                  <Truck className="h-4 w-4 mr-1" /> Order Now
                </>
              ) : isFree(material) || isPurchased(material.id) ? (
                <>
                  <Download className="h-4 w-4 mr-1" /> Download
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-1" /> Buy Now
                </>
              )}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

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

          {/* Category Tabs */}
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
          ) : (
            <Tabs defaultValue="hardcopy" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
                <TabsTrigger value="hardcopy" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Hard Copy</span>
                  <Badge variant="secondary" className="ml-1">{filteredHardCopy.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="digital" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Digital</span>
                  <Badge variant="secondary" className="ml-1">{digitalMaterials.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="free" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Free</span>
                  <Badge variant="secondary" className="ml-1">{freeMaterials.length}</Badge>
                </TabsTrigger>
              </TabsList>

              {/* Hard Copy Tab */}
              <TabsContent value="hardcopy">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                    <Package className="h-5 w-5 text-blue-500" />
                    Hard Copy Books
                  </h2>
                  <p className="text-sm text-muted-foreground">Physical books delivered to your doorstep</p>
                </div>
                {filteredHardCopy.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredHardCopy.map((product) => (
                      <Card key={product.id} className="border-none shadow-lg hover:shadow-xl transition-all bg-white group overflow-hidden flex flex-col">
                        <Link href={`/shop/${product.slug}`}>
                          <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center cursor-pointer">
                            {product.thumbnail_url ? (
                              <img src={product.thumbnail_url} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="h-12 w-12 text-blue-300" />
                            )}
                            <div className="absolute top-2 left-2">
                              {product.subject?.name && <Badge className="bg-blue-500 text-white">{product.subject.name}</Badge>}
                            </div>
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-purple-500 text-white"><Truck className="h-3 w-3 mr-1" />Ships in 2-3 days</Badge>
                            </div>
                            {product.stock_quantity < 10 && (
                              <Badge className="absolute bottom-2 right-2 bg-red-500">Only {product.stock_quantity} left!</Badge>
                            )}
                          </div>
                        </Link>
                        <CardContent className="p-4 flex flex-col flex-1">
                          <Link href={`/shop/${product.slug}`}>
                            <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 cursor-pointer">{product.title}</h3>
                          </Link>
                          {product.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>}
                          <div className="mt-auto">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg font-bold text-[#1B5E5E] flex items-center"><IndianRupee className="h-4 w-4" />{product.price + product.shipping_cost}</span>
                              {product.original_price && product.original_price > product.price && (
                                <span className="text-sm text-gray-400 line-through">₹{product.original_price + product.shipping_cost}</span>
                              )}
                              <span className="text-xs text-gray-500">(incl. shipping)</span>
                            </div>
                            <Link href={`/shop/${product.slug}`}>
                              <Button size="sm" className="w-full h-9 bg-blue-600 hover:bg-blue-700">
                                <ShoppingCart className="h-4 w-4 mr-1" /> Order Now
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-none shadow-lg bg-white max-w-lg mx-auto">
                    <CardContent className="p-12 text-center">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No hard copy books available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Digital Downloads Tab */}
              <TabsContent value="digital">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                    <Download className="h-5 w-5 text-[#0B9B9B]" />
                    Digital Downloads (PDF)
                  </h2>
                  <p className="text-sm text-muted-foreground">Instant download after purchase</p>
                </div>
                {digitalMaterials.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {digitalMaterials.map((material) => renderMaterialCard(material, false))}
                  </div>
                ) : (
                  <Card className="border-none shadow-lg bg-white max-w-lg mx-auto">
                    <CardContent className="p-12 text-center">
                      <Download className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No digital materials available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Free Materials Tab */}
              <TabsContent value="free">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    Free Materials
                  </h2>
                  <p className="text-sm text-muted-foreground">Download for free, no payment required</p>
                </div>
                {freeMaterials.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {freeMaterials.map((material) => renderMaterialCard(material, false))}
                  </div>
                ) : (
                  <Card className="border-none shadow-lg bg-white max-w-lg mx-auto">
                    <CardContent className="p-12 text-center">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No free materials available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
