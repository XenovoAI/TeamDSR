import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, Pencil, Trash2, Tag, Percent, IndianRupee, Calendar, 
  Package, X, Loader2, ChevronDown, ChevronUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  default_discount_value: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  usage_limit?: number;
  times_used: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  created_at: string;
}

interface CouponProduct {
  id: string;
  coupon_id: string;
  material_id: string;
  discount_value: number;
  applies_to: 'digital' | 'hard_copy' | 'both';
  material?: { id: string; title: string };
}

interface Material {
  id: string;
  title: string;
}

export default function CouponsManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [expandedCoupon, setExpandedCoupon] = useState<string | null>(null);
  const [couponProducts, setCouponProducts] = useState<CouponProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    default_discount_value: 0,
    is_active: true,
    start_date: '',
    end_date: '',
    usage_limit: '',
    min_purchase_amount: '',
    max_discount_amount: '',
  });

  const [productForm, setProductForm] = useState({
    material_id: '',
    discount_value: '',
    applies_to: 'both' as 'digital' | 'hard_copy' | 'both',
  });

  useEffect(() => {
    fetchCoupons();
    fetchMaterials();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/admin/coupons');
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Server returned non-JSON response. Status:', response.status);
        toast({ 
          title: "Server Error", 
          description: "Please restart the server (Ctrl+C then npm run dev)", 
          variant: "destructive" 
        });
        setCoupons([]);
        return;
      }
      
      const data = await response.json();
      if (Array.isArray(data)) {
        setCoupons(data);
      } else if (data.error) {
        console.error('Error from server:', data.error);
        toast({ title: "Error", description: data.error, variant: "destructive" });
        setCoupons([]);
      } else {
        setCoupons([]);
      }
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      toast({ 
        title: "Error", 
        description: error.message?.includes('Unexpected token') 
          ? "Server not responding. Please restart the server." 
          : "Failed to fetch coupons", 
        variant: "destructive" 
      });
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(
        `${supabaseUrl}/rest/v1/study_materials?select=id,title&order=title`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          }
        }
      );
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchCouponProducts = async (couponId: string) => {
    setLoadingProducts(true);
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}/products`);
      const data = await response.json();
      setCouponProducts(data);
    } catch (error) {
      console.error('Error fetching coupon products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code) {
      toast({ title: "Error", description: "Coupon code is required", variant: "destructive" });
      return;
    }

    try {
      const url = editingCoupon 
        ? `/api/admin/coupons/${editingCoupon.id}`
        : '/api/admin/coupons';
      
      const response = await fetch(url, {
        method: editingCoupon ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
          min_purchase_amount: formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount) : null,
          max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to save coupon');

      toast({ title: "Success", description: `Coupon ${editingCoupon ? 'updated' : 'created'} successfully` });
      setShowModal(false);
      resetForm();
      fetchCoupons();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete coupon');
      
      toast({ title: "Success", description: "Coupon deleted successfully" });
      fetchCoupons();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !coupon.is_active }),
      });

      if (!response.ok) throw new Error('Failed to update coupon');
      fetchCoupons();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAddProductDiscount = async () => {
    if (!expandedCoupon || !productForm.material_id || !productForm.discount_value) {
      toast({ title: "Error", description: "Select a product and enter discount", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(`/api/admin/coupons/${expandedCoupon}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material_id: productForm.material_id,
          discount_value: parseFloat(productForm.discount_value),
          applies_to: productForm.applies_to,
        }),
      });

      if (!response.ok) throw new Error('Failed to add product discount');
      
      toast({ title: "Success", description: "Product discount added" });
      setProductForm({ material_id: '', discount_value: '', applies_to: 'both' });
      fetchCouponProducts(expandedCoupon);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRemoveProductDiscount = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/coupon-products/${productId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to remove product discount');
      
      if (expandedCoupon) fetchCouponProducts(expandedCoupon);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      default_discount_value: 0,
      is_active: true,
      start_date: '',
      end_date: '',
      usage_limit: '',
      min_purchase_amount: '',
      max_discount_amount: '',
    });
    setEditingCoupon(null);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      default_discount_value: coupon.default_discount_value,
      is_active: coupon.is_active,
      start_date: coupon.start_date?.split('T')[0] || '',
      end_date: coupon.end_date?.split('T')[0] || '',
      usage_limit: coupon.usage_limit?.toString() || '',
      min_purchase_amount: coupon.min_purchase_amount?.toString() || '',
      max_discount_amount: coupon.max_discount_amount?.toString() || '',
    });
    setShowModal(true);
  };

  const toggleExpand = (couponId: string) => {
    if (expandedCoupon === couponId) {
      setExpandedCoupon(null);
      setCouponProducts([]);
    } else {
      setExpandedCoupon(couponId);
      fetchCouponProducts(couponId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Coupon Management</h1>
            <p className="text-muted-foreground text-sm">Create and manage discount coupons</p>
          </div>
          <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-[#0B9B9B] hover:bg-[#1B5E5E]">
            <Plus className="h-4 w-4 mr-2" /> New Coupon
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#0B9B9B]" />
          </div>
        ) : coupons.length === 0 ? (
          <Card className="text-center py-12">
            <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground">No coupons yet. Create your first coupon!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <Card key={coupon.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#0B9B9B] to-[#0DCDCD] flex items-center justify-center">
                        <Tag className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{coupon.code}</span>
                          <Badge variant={coupon.is_active ? "default" : "secondary"}>
                            {coupon.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{coupon.description || 'No description'}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {coupon.discount_type === 'percentage' ? <Percent className="h-3 w-3" /> : <IndianRupee className="h-3 w-3" />}
                            {coupon.default_discount_value}{coupon.discount_type === 'percentage' ? '%' : ''} default
                          </span>
                          <span>Used: {coupon.times_used}{coupon.usage_limit ? `/${coupon.usage_limit}` : ''}</span>
                          {coupon.end_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Expires: {new Date(coupon.end_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={coupon.is_active} onCheckedChange={() => handleToggleActive(coupon)} />
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(coupon)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toggleExpand(coupon.id)}>
                        {expandedCoupon === coupon.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  {expandedCoupon === coupon.id && (
                    <div className="border-t bg-gray-50 p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" /> Product-Specific Discounts
                      </h4>
                      
                      {loadingProducts ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          {couponProducts.length > 0 && (
                            <div className="space-y-2 mb-4">
                              {couponProducts.map((cp) => (
                                <div key={cp.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                  <div>
                                    <span className="font-medium">{cp.material?.title}</span>
                                    <span className="text-sm text-muted-foreground ml-2">
                                      {coupon.discount_type === 'percentage' ? `${cp.discount_value}%` : `₹${cp.discount_value}`} off
                                      ({cp.applies_to})
                                    </span>
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={() => handleRemoveProductDiscount(cp.id)}>
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <label className="text-xs text-muted-foreground">Product</label>
                              <Select value={productForm.material_id} onValueChange={(v) => setProductForm({...productForm, material_id: v})}>
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {materials.map((m) => (
                                    <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="w-24">
                              <label className="text-xs text-muted-foreground">Discount</label>
                              <Input
                                type="number"
                                placeholder={coupon.discount_type === 'percentage' ? '%' : '₹'}
                                value={productForm.discount_value}
                                onChange={(e) => setProductForm({...productForm, discount_value: e.target.value})}
                                className="h-10"
                              />
                            </div>
                            <div className="w-32">
                              <label className="text-xs text-muted-foreground">Applies To</label>
                              <Select value={productForm.applies_to} onValueChange={(v: any) => setProductForm({...productForm, applies_to: v})}>
                                <SelectTrigger className="h-10">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="both">Both</SelectItem>
                                  <SelectItem value="digital">Digital</SelectItem>
                                  <SelectItem value="hard_copy">Hard Copy</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button onClick={handleAddProductDiscount} className="h-10 bg-[#0B9B9B]">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Coupon Code *</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="e.g., NEET2025"
                    className="uppercase"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="e.g., New Year Discount"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Discount Type</label>
                    <Select value={formData.discount_type} onValueChange={(v: any) => setFormData({...formData, discount_type: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Default Discount</label>
                    <Input
                      type="number"
                      value={formData.default_discount_value}
                      onChange={(e) => setFormData({...formData, default_discount_value: parseFloat(e.target.value) || 0})}
                      placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Usage Limit</label>
                    <Input
                      type="number"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                      placeholder="Unlimited"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Min Purchase (₹)</label>
                    <Input
                      type="number"
                      value={formData.min_purchase_amount}
                      onChange={(e) => setFormData({...formData, min_purchase_amount: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                {formData.discount_type === 'percentage' && (
                  <div>
                    <label className="text-sm font-medium">Max Discount (₹)</label>
                    <Input
                      type="number"
                      value={formData.max_discount_amount}
                      onChange={(e) => setFormData({...formData, max_discount_amount: e.target.value})}
                      placeholder="No limit"
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <label className="text-sm">Active</label>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-[#0B9B9B] hover:bg-[#1B5E5E]">
                    {editingCoupon ? 'Update' : 'Create'} Coupon
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
