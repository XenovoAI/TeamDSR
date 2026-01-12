import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Package, Loader2, Upload, Eye, IndianRupee } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
  weight_kg: number;
  dimensions_cm: string;
  category?: string;
  subject_id?: string;
  is_active: boolean;
  created_at: string;
  subject?: { id: string; name: string };
}

export default function HardCopyManagement() {
  const [products, setProducts] = useState<HardCopyProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<HardCopyProduct[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<HardCopyProduct | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: 299,
    original_price: 499,
    shipping_cost: 50,
    stock_quantity: 100,
    weight_kg: 0.5,
    dimensions_cm: "25x20x3",
    category: "",
    subject_id: "",
    is_active: true
  });

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { filterProducts(); }, [searchQuery, products]);

  const fetchData = async () => {
    try {
      // Fetch products
      const prodRes = await fetch(
        `${supabaseUrl}/rest/v1/hard_copy_products?select=*,subject:subjects(id,name)&order=created_at.desc`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );
      const prodData = await prodRes.json();
      setProducts(Array.isArray(prodData) ? prodData : []);
      setFilteredProducts(Array.isArray(prodData) ? prodData : []);

      // Fetch subjects
      const subRes = await fetch(
        `${supabaseUrl}/rest/v1/subjects?select=*&order=name`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );
      const subData = await subRes.json();
      setSubjects(Array.isArray(subData) ? subData : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!searchQuery) { setFilteredProducts(products); return; }
    const q = searchQuery.toLowerCase();
    setFilteredProducts(products.filter(p => p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)));
  };

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedThumbnail(e.target.files[0]);
  };

  const uploadThumbnail = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `hardcopy/${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('study-materials').upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('study-materials').getPublicUrl(fileName);
    return data.publicUrl;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      toast({ title: "Fill required fields", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      let thumbnailUrl = editingProduct?.thumbnail_url;
      if (selectedThumbnail) {
        thumbnailUrl = await uploadThumbnail(selectedThumbnail);
      }

      const productData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        description: formData.description,
        thumbnail_url: thumbnailUrl,
        price: formData.price,
        original_price: formData.original_price || null,
        shipping_cost: formData.shipping_cost,
        stock_quantity: formData.stock_quantity,
        weight_kg: formData.weight_kg,
        dimensions_cm: formData.dimensions_cm,
        category: formData.category || null,
        subject_id: formData.subject_id || null,
        is_active: formData.is_active,
        created_by: user?.id,
      };

      if (editingProduct) {
        await fetch(`${supabaseUrl}/rest/v1/hard_copy_products?id=eq.${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...productData, updated_at: new Date().toISOString() }),
        });
        toast({ title: "Product updated!" });
      } else {
        await fetch(`${supabaseUrl}/rest/v1/hard_copy_products`, {
          method: 'POST',
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        toast({ title: "Product added!" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await fetch(`${supabaseUrl}/rest/v1/hard_copy_products?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
      });
      toast({ title: "Deleted!" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleEdit = (product: HardCopyProduct) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      slug: product.slug,
      description: product.description || "",
      price: product.price,
      original_price: product.original_price || 0,
      shipping_cost: product.shipping_cost,
      stock_quantity: product.stock_quantity,
      weight_kg: product.weight_kg,
      dimensions_cm: product.dimensions_cm,
      category: product.category || "",
      subject_id: product.subject_id || "",
      is_active: product.is_active
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setSelectedThumbnail(null);
    setFormData({
      title: "", slug: "", description: "", price: 299, original_price: 499,
      shipping_cost: 50, stock_quantity: 100, weight_kg: 0.5, dimensions_cm: "25x20x3",
      category: "", subject_id: "", is_active: true
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-12 md:pt-24 md:pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
              <Package className="text-blue-500" />
              Hard Copy Products
            </h1>
            <p className="text-muted-foreground">Manage physical books for shipping</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2" size={20} /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Hard Copy Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: formData.slug || generateSlug(e.target.value) })} placeholder="e.g., NEET Biology Complete Book" required />
                </div>

                <div className="space-y-2">
                  <Label>URL Slug</Label>
                  <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })} placeholder="neet-biology-complete-book" />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Book description..." rows={2} />
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={formData.subject_id} onValueChange={(v) => setFormData({ ...formData, subject_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Thumbnail Image *</Label>
                  <Input type="file" onChange={handleThumbnailChange} accept="image/*" />
                  {(selectedThumbnail || editingProduct?.thumbnail_url) && (
                    <img src={selectedThumbnail ? URL.createObjectURL(selectedThumbnail) : editingProduct?.thumbnail_url} alt="Preview" className="w-full h-32 object-cover rounded-lg mt-2" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (₹) *</Label>
                    <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Original Price (₹)</Label>
                    <Input type="number" value={formData.original_price} onChange={(e) => setFormData({ ...formData, original_price: parseInt(e.target.value) || 0 })} min="0" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Shipping Cost (₹)</Label>
                    <Input type="number" value={formData.shipping_cost} onChange={(e) => setFormData({ ...formData, shipping_cost: parseInt(e.target.value) || 0 })} min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock Quantity</Label>
                    <Input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })} min="0" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input type="number" step="0.1" value={formData.weight_kg} onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) || 0.5 })} min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Dimensions (cm)</Label>
                    <Input value={formData.dimensions_cm} onChange={(e) => setFormData({ ...formData, dimensions_cm: e.target.value })} placeholder="25x20x3" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                  <Label htmlFor="is_active">Active (visible to customers)</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600" disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    {editingProduct ? 'Update' : 'Add'} Product
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{products.length}</div>
              <div className="text-xs text-muted-foreground">Total Products</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{products.filter(p => p.is_active).length}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{products.filter(p => p.stock_quantity < 10).length}</div>
              <div className="text-xs text-muted-foreground">Low Stock</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{products.reduce((a, p) => a + p.stock_quantity, 0)}</div>
              <div className="text-xs text-muted-foreground">Total Stock</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-none shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card className="border-none shadow-lg">
          <CardHeader><CardTitle>Products ({filteredProducts.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No products yet</p>
                <Button onClick={() => setIsDialogOpen(true)} className="mt-4 bg-blue-600"><Plus className="mr-2" size={16} /> Add First Product</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      {product.thumbnail_url && (
                        <div className="w-full md:w-24 h-24 rounded-lg overflow-hidden shrink-0">
                          <img src={product.thumbnail_url} alt={product.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold">{product.title}</h3>
                          <Badge className={product.is_active ? "bg-green-600" : "bg-gray-400"}>{product.is_active ? 'Active' : 'Inactive'}</Badge>
                          {product.stock_quantity < 10 && <Badge className="bg-yellow-600">Low Stock</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{product.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="flex items-center"><IndianRupee className="h-3 w-3" />{product.price}</Badge>
                          <Badge variant="outline">+₹{product.shipping_cost} shipping</Badge>
                          <Badge variant="outline">{product.stock_quantity} in stock</Badge>
                          <Badge variant="outline">{product.weight_kg}kg</Badge>
                          {product.subject?.name && <Badge variant="outline">{product.subject.name}</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(product)} className="flex-1 md:flex-none">
                          <Edit size={16} className="mr-1 md:mr-0" /><span className="md:hidden">Edit</span>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(product.id)} className="text-red-600 flex-1 md:flex-none">
                          <Trash2 size={16} className="mr-1 md:mr-0" /><span className="md:hidden">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
