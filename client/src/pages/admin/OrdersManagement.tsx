import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, Search, Truck, CheckCircle, Clock, Loader2, MapPin, Phone, User, 
  IndianRupee, Send, XCircle, ExternalLink 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ezcoqsyzchjijbwwnhfn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Y29xc3l6Y2hqaWpid3duaGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODQxNTQsImV4cCI6MjA4MDc2MDE1NH0.Uig4RSmHuaG_KKluQWM9DXEAUBNQA_g2upsDeOXt3uk';

interface Order {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  material_id: string | null;
  product_id: string | null;
  product_type: string;
  amount: number;
  delivery_type: string;
  shipping_address: {
    name: string;
    phone: string;
    email?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
  } | null;
  tracking_number: string | null;
  delivery_status: string;
  admin_notes: string | null;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  shiprocket_order_id: string | null;
  shiprocket_shipment_id: string | null;
  material?: {
    title: string;
  } | null;
  product?: {
    title: string;
  } | null;
}

interface Courier {
  courier_company_id: number;
  courier_name: string;
  rate: number;
  etd: string;
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<string>("");
  const [loadingCouriers, setLoadingCouriers] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, statusFilter, orderTypeFilter, orders]);

  const fetchOrders = async () => {
    try {
      // Fetch all completed orders (physical + digital)
      const response = await fetch(
        `${supabaseUrl}/rest/v1/purchases?status=eq.completed&select=*,material:study_materials(title),product:hard_copy_products(title)&order=created_at.desc`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter(o => o.delivery_status === statusFilter);
    }
    if (orderTypeFilter !== "all") {
      filtered = filtered.filter(o => o.delivery_type === orderTypeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.material?.title?.toLowerCase().includes(query) ||
        o.product?.title?.toLowerCase().includes(query) ||
        o.shipping_address?.name?.toLowerCase().includes(query) ||
        o.tracking_number?.toLowerCase().includes(query) ||
        o.id.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  };



  // Shiprocket: Create order
  const handleCreateShipment = async () => {
    if (!selectedOrder) return;
    
    setUpdating(true);
    try {
      const response = await fetch('/api/shiprocket/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrder.id }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to create shipment');

      toast({
        title: "Shipment Created!",
        description: `Shiprocket Order ID: ${data.shiprocket_order_id}`,
      });

      // Fetch available couriers
      fetchCouriers();
      fetchOrders();
    } catch (error: any) {
      console.error('Error creating shipment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create shipment",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  // Fetch available couriers
  const fetchCouriers = async () => {
    if (!selectedOrder?.shipping_address?.pincode) return;
    
    setLoadingCouriers(true);
    try {
      const response = await fetch('/api/shiprocket/couriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_pincode: selectedOrder.shipping_address.pincode,
          weight: 0.5,
          cod: false,
        }),
      });

      const data = await response.json();
      
      if (data.data?.available_courier_companies) {
        setCouriers(data.data.available_courier_companies);
      }
    } catch (error) {
      console.error('Error fetching couriers:', error);
    } finally {
      setLoadingCouriers(false);
    }
  };

  // Ship order with selected courier
  const handleShipOrder = async () => {
    if (!selectedOrder || !selectedCourier) return;
    
    setUpdating(true);
    try {
      const response = await fetch('/api/shiprocket/ship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: selectedOrder.id,
          courier_id: parseInt(selectedCourier),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to ship order');

      toast({
        title: "Order Shipped! 🚚",
        description: `AWB: ${data.awb}`,
      });

      setIsDialogOpen(false);
      fetchOrders();
    } catch (error: any) {
      console.error('Error shipping order:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to ship order",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  // Cancel shipment
  const handleCancelShipment = async () => {
    if (!selectedOrder) return;
    if (!confirm('Are you sure you want to cancel this shipment?')) return;
    
    setUpdating(true);
    try {
      const response = await fetch('/api/shiprocket/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrder.id }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to cancel');

      toast({
        title: "Shipment Cancelled",
        description: "The order has been cancelled",
      });

      setIsDialogOpen(false);
      fetchOrders();
    } catch (error: any) {
      console.error('Error cancelling:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const openOrderDialog = (order: Order) => {
    setSelectedOrder(order);
    setCouriers([]);
    setSelectedCourier("");
    setIsDialogOpen(true);
    
    // If order has shipment, fetch couriers
    if (order.shiprocket_shipment_id && (order.delivery_status === 'processing' || order.delivery_status === 'pending')) {
      fetchCouriers();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500"><Package className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-500"><Truck className="h-3 w-3 mr-1" />Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.delivery_status === 'pending').length,
    processing: orders.filter(o => o.delivery_status === 'processing').length,
    shipped: orders.filter(o => o.delivery_status === 'shipped').length,
    delivered: orders.filter(o => o.delivery_status === 'delivered').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-12 md:pt-24 md:pb-16">
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
            <Package className="text-[#0B9B9B]" />
            Orders Management
          </h1>
          <p className="text-muted-foreground">Manage all paid orders (digital and hard copy)</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="border-none shadow-md cursor-pointer hover:shadow-lg" onClick={() => setStatusFilter("all")}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total Orders</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md cursor-pointer hover:shadow-lg" onClick={() => setStatusFilter("pending")}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md cursor-pointer hover:shadow-lg" onClick={() => setStatusFilter("processing")}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
              <div className="text-xs text-muted-foreground">Processing</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md cursor-pointer hover:shadow-lg" onClick={() => setStatusFilter("shipped")}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
              <div className="text-xs text-muted-foreground">Shipped</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md cursor-pointer hover:shadow-lg" onClick={() => setStatusFilter("delivered")}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
              <div className="text-xs text-muted-foreground">Delivered</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-lg mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  placeholder="Search by order ID, customer name, or tracking..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
              <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="physical">Hard Copy</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#0B9B9B]" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => openOrderDialog(order)}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-mono text-sm text-muted-foreground">
                            #{order.id.slice(0, 8)}
                          </span>
                          {getStatusBadge(order.delivery_status)}
                          {order.shiprocket_order_id && (
                            <Badge variant="outline" className="text-xs">
                              SR: {order.shiprocket_order_id}
                            </Badge>
                          )}
                          {!order.user_id && order.guest_email && (
                            <Badge variant="outline" className="text-xs bg-yellow-50">
                              Guest
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {order.delivery_type === 'physical' ? 'Hard Copy' : 'Digital'}
                          </Badge>
                        </div>
                        <h3 className="font-semibold mb-1">{order.material?.title || order.product?.title || 'Unknown Product'}</h3>
                        {order.shipping_address ? (
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {order.shipping_address.name}
                              {order.guest_email && <span className="text-xs">({order.guest_email})</span>}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {order.guest_email || 'Digital order'}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#1B5E5E] flex items-center justify-end">
                          <IndianRupee className="h-4 w-4" />{order.amount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        {order.tracking_number && (
                          <div className="text-xs text-blue-600 mt-1">
                            AWB: {order.tracking_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Order ID</div>
                      <div className="font-mono text-sm">{selectedOrder.id}</div>
                    </div>
                    {getStatusBadge(selectedOrder.delivery_status)}
                  </div>
                </div>

                {/* Product */}
                <div>
                  <div className="text-sm font-medium mb-2">Product</div>
                  <div className="font-semibold">{selectedOrder.material?.title || selectedOrder.product?.title || 'Product'}</div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    Amount: <IndianRupee className="h-3 w-3 ml-1" />{selectedOrder.amount}
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shipping_address && (
                  <div>
                    <div className="text-sm font-medium mb-2">Shipping Address</div>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                      <div className="font-medium">{selectedOrder.shipping_address.name}</div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedOrder.shipping_address.phone}
                      </div>
                      <div>{selectedOrder.shipping_address.address_line1}</div>
                      {selectedOrder.shipping_address.address_line2 && (
                        <div>{selectedOrder.shipping_address.address_line2}</div>
                      )}
                      <div>
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}
                      </div>
                    </div>
                  </div>
                )}

                {/* Shiprocket Actions */}
                {selectedOrder.delivery_type === 'physical' && (
                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-3">Shiprocket Actions</div>
                  
                  {selectedOrder.delivery_status === 'pending' && !selectedOrder.shiprocket_order_id && (
                    <Button
                      onClick={handleCreateShipment}
                      disabled={updating}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {updating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Create Shiprocket Shipment
                    </Button>
                  )}

                  {selectedOrder.shiprocket_shipment_id && (selectedOrder.delivery_status === 'processing' || selectedOrder.delivery_status === 'pending') && (
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded">
                        ✅ Shipment ID: {selectedOrder.shiprocket_shipment_id}
                      </div>
                      
                      {loadingCouriers ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading couriers...
                        </div>
                      ) : couriers.length > 0 ? (
                        <>
                          <Select value={selectedCourier} onValueChange={setSelectedCourier}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select courier" />
                            </SelectTrigger>
                            <SelectContent>
                              {couriers.map((c) => (
                                <SelectItem key={c.courier_company_id} value={c.courier_company_id.toString()}>
                                  {c.courier_name} - ₹{c.rate} ({c.etd})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Button
                            onClick={handleShipOrder}
                            disabled={updating || !selectedCourier}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                          >
                            {updating ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Truck className="h-4 w-4 mr-2" />
                            )}
                            Ship Order
                          </Button>
                        </>
                      ) : (
                        <Button onClick={fetchCouriers} className="w-full bg-green-600 hover:bg-green-700">
                          <Truck className="h-4 w-4 mr-2" />
                          Load Available Couriers
                        </Button>
                      )}
                      
                      <Button
                        onClick={handleCancelShipment}
                        disabled={updating}
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Shipment
                      </Button>
                    </div>
                  )}

                  {selectedOrder.tracking_number && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm font-medium text-purple-800">Tracking Number</div>
                      <div className="font-mono text-purple-900">{selectedOrder.tracking_number}</div>
                      <a 
                        href={`https://shiprocket.co/tracking/${selectedOrder.tracking_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 flex items-center gap-1 mt-1 hover:underline"
                      >
                        Track on Shiprocket <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {selectedOrder.delivery_status === 'shipped' && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg text-center">
                      <div className="text-sm text-blue-800">
                        📦 Order shipped! Track and manage on{' '}
                        <a 
                          href="https://app.shiprocket.in/orders"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium underline"
                        >
                          Shiprocket Dashboard
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedOrder.delivery_status === 'delivered' && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg text-center">
                      <div className="text-sm text-green-800">✅ Order delivered successfully!</div>
                    </div>
                  )}
                </div>
                )}

                {/* Timeline */}
                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-3">Timeline</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ordered</span>
                      <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                    </div>
                    {selectedOrder.shipped_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipped</span>
                        <span>{new Date(selectedOrder.shipped_at).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedOrder.delivered_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivered</span>
                        <span>{new Date(selectedOrder.delivered_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
