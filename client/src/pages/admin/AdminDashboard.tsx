import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, Package, Users, FileText, ShoppingCart, Settings, 
  TrendingUp, TrendingDown, IndianRupee, Download, Truck, Moon, Sun,
  ArrowUpRight, BarChart3, PieChart, Calendar, Bell, Search, Menu,
  Eye, Clock, CheckCircle, XCircle, Tag, CreditCard, UserPlus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ezcoqsyzchjijbwwnhfn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Y29xc3l6Y2hqaWpid3duaGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODQxNTQsImV4cCI6MjA4MDc2MDE1NH0.Uig4RSmHuaG_KKluQWM9DXEAUBNQA_g2upsDeOXt3uk';

interface Purchase {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  material_id: string | null;
  product_id: string | null;
  amount: number;
  delivery_type: string;
  delivery_status: string;
  status: string;
  created_at: string;
  shipping_address?: { name: string; city: string; state: string; phone: string };
  material?: { title: string };
  product?: { title: string };
}

interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  is_admin: boolean;
}

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Data states
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    digitalSales: 0,
    physicalSales: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalUsers: 0,
    newUsersThisMonth: 0,
    avgOrderValue: 0,
    revenueGrowth: 0,
    totalCoupons: 0,
    activeCoupons: 0,
    totalDiscountGiven: 0,
    couponUsageCount: 0,
  });
  const [monthlyData, setMonthlyData] = useState<{month: string; revenue: number; orders: number}[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);


  const fetchAllData = async () => {
    try {
      // Fetch all purchases
      const purchasesRes = await fetch(
        `${supabaseUrl}/rest/v1/purchases?status=eq.completed&select=*,material:study_materials(title),product:hard_copy_products(title)&order=created_at.desc`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );
      const purchasesData = await purchasesRes.json();
      
      // Fetch all users
      const usersRes = await fetch(
        `${supabaseUrl}/rest/v1/users?select=*&order=created_at.desc`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );
      const usersData = await usersRes.json();

      // Fetch coupon analytics
      const couponsRes = await fetch(
        `${supabaseUrl}/rest/v1/coupons?select=*`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );
      const couponsData = await couponsRes.json();

      if (Array.isArray(purchasesData)) {
        setPurchases(purchasesData);
        
        // Calculate stats
        const totalRevenue = purchasesData.reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalDiscountGiven = purchasesData.reduce((sum, p) => sum + (p.discount_amount || 0), 0);
        const digitalSales = purchasesData.filter(p => p.delivery_type !== 'physical').reduce((sum, p) => sum + (p.amount || 0), 0);
        const physicalSales = purchasesData.filter(p => p.delivery_type === 'physical').reduce((sum, p) => sum + (p.amount || 0), 0);
        const pendingOrders = purchasesData.filter(p => p.delivery_type === 'physical' && p.delivery_status === 'pending').length;
        const completedOrders = purchasesData.filter(p => p.delivery_status === 'delivered' || p.delivery_type !== 'physical').length;
        const couponUsageCount = purchasesData.filter(p => p.coupon_id).length;
        
        // Calculate monthly data
        const monthlyMap = new Map<string, {revenue: number; orders: number}>();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        months.forEach(m => monthlyMap.set(m, { revenue: 0, orders: 0 }));
        
        purchasesData.forEach(p => {
          const date = new Date(p.created_at);
          const month = months[date.getMonth()];
          const existing = monthlyMap.get(month) || { revenue: 0, orders: 0 };
          monthlyMap.set(month, { revenue: existing.revenue + (p.amount || 0), orders: existing.orders + 1 });
        });
        
        setMonthlyData(months.map(m => ({ month: m, ...monthlyMap.get(m)! })));
        
        // Calculate growth (compare this month vs last month)
        const now = new Date();
        const thisMonth = purchasesData.filter(p => new Date(p.created_at).getMonth() === now.getMonth()).reduce((sum, p) => sum + (p.amount || 0), 0);
        const lastMonth = purchasesData.filter(p => new Date(p.created_at).getMonth() === now.getMonth() - 1).reduce((sum, p) => sum + (p.amount || 0), 0);
        const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100) : 0;

        setStats({
          totalRevenue,
          totalOrders: purchasesData.length,
          digitalSales,
          physicalSales,
          pendingOrders,
          completedOrders,
          totalUsers: Array.isArray(usersData) ? usersData.length : 0,
          newUsersThisMonth: Array.isArray(usersData) ? usersData.filter(u => new Date(u.created_at).getMonth() === now.getMonth()).length : 0,
          avgOrderValue: purchasesData.length > 0 ? Math.round(totalRevenue / purchasesData.length) : 0,
          revenueGrowth: Math.round(growth),
          totalCoupons: Array.isArray(couponsData) ? couponsData.length : 0,
          activeCoupons: Array.isArray(couponsData) ? couponsData.filter(c => c.is_active).length : 0,
          totalDiscountGiven,
          couponUsageCount,
        });
      }

      if (Array.isArray(usersData)) {
        setUsers(usersData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const recentOrders = purchases.slice(0, 10);
  const recentUsers = users.slice(0, 5);
  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
    { id: 'products', label: 'Hard Copy', icon: Package, href: '/admin/hardcopy' },
    { id: 'materials', label: 'Materials', icon: FileText, href: '/admin/materials' },
    { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
    { id: 'coupons', label: 'Coupons', icon: Tag, href: '/admin/coupons' },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full ${sidebarOpen ? 'w-64' : 'w-20'} ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r transition-all duration-300 z-50`}>
        <div className="p-4 border-b border-inherit">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0B9B9B] to-[#1B5E5E] rounded-xl flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && <span className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>NEETPeak</span>}
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map(item => (
            item.href ? (
              <Link key={item.id} href={item.href}>
                <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <item.icon className="h-5 w-5" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              </Link>
            ) : (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-[#0B9B9B] text-white' : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                <item.icon className="h-5 w-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            )
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className={`sticky top-0 z-40 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <Menu className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sales Overview</h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Analyze sales trends to make data-driven decisions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className={`p-2 rounded-lg relative ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <Bell className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                {stats.pendingOrders > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{stats.pendingOrders}</span>}
              </button>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="w-8 h-8 bg-[#0B9B9B] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {userProfile?.name?.charAt(0) || 'A'}
                </div>
                {sidebarOpen && <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>{userProfile?.name || 'Admin'}</span>}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Revenue Card */}
                <Card className={`border-none shadow-lg overflow-hidden ${darkMode ? 'bg-gradient-to-br from-emerald-600 to-emerald-700' : 'bg-gradient-to-br from-[#0B9B9B] to-[#1B5E5E]'}`}>
                  <CardContent className="p-6 text-white">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-emerald-100 text-sm font-medium">Total Revenue</span>
                      <IndianRupee className="h-5 w-5 text-emerald-200" />
                    </div>
                    <div className="text-3xl font-bold mb-2">₹{stats.totalRevenue.toLocaleString()}</div>
                    <div className="flex items-center gap-2 text-sm">
                      {stats.revenueGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span className={stats.revenueGrowth >= 0 ? 'text-emerald-200' : 'text-red-200'}>
                        {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}%
                      </span>
                      <span className="text-emerald-200">vs last month</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Orders Card */}
                <Card className={`border-none shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Orders</span>
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                        <ShoppingCart className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                    <div className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalOrders}</div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        <span className="text-blue-500 font-medium">{purchases.filter(p => p.delivery_type !== 'physical').length}</span> Digital
                      </span>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        <span className="text-purple-500 font-medium">{purchases.filter(p => p.delivery_type === 'physical').length}</span> Physical
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Coupon Stats Card */}
                <Card className={`border-none shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Coupon Discounts</span>
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                        <Tag className="h-5 w-5 text-orange-500" />
                      </div>
                    </div>
                    <div className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹{stats.totalDiscountGiven.toLocaleString()}</div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-orange-500 font-medium">{stats.couponUsageCount}</span>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>coupons used</span>
                      <span className="text-green-500 font-medium">({stats.activeCoupons} active)</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Users Card */}
                <Card className={`border-none shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Users</span>
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                        <Users className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                    <div className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalUsers}</div>
                    <div className="flex items-center gap-2 text-sm">
                      <UserPlus className="h-4 w-4 text-green-500" />
                      <span className="text-green-500 font-medium">+{stats.newUsersThisMonth}</span>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>this month</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Chart */}
                <Card className={`border-none shadow-lg lg:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className={darkMode ? 'text-white' : ''}>Monthly Revenue</CardTitle>
                      <Badge variant="outline" className={darkMode ? 'border-gray-600 text-gray-300' : ''}>2025</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end gap-2">
                      {monthlyData.map((data, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex flex-col items-center">
                            <div 
                              className={`w-full rounded-t-lg transition-all ${data.revenue > 0 ? 'bg-gradient-to-t from-[#0B9B9B] to-[#0DCDCD]' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                              style={{ height: `${Math.max((data.revenue / maxRevenue) * 180, 4)}px` }}
                            />
                          </div>
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{data.month}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Sales Breakdown */}
                <Card className={`border-none shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className={darkMode ? 'text-white' : ''}>Sales Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Digital Sales */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Digital Downloads</span>
                          <span className={`font-bold ${darkMode ? 'text-white' : ''}`}>₹{stats.digitalSales.toLocaleString()}</span>
                        </div>
                        <div className={`h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.totalRevenue > 0 ? (stats.digitalSales / stats.totalRevenue * 100) : 0}%` }} />
                        </div>
                      </div>
                      {/* Physical Sales */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Hard Copy Sales</span>
                          <span className={`font-bold ${darkMode ? 'text-white' : ''}`}>₹{stats.physicalSales.toLocaleString()}</span>
                        </div>
                        <div className={`h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${stats.totalRevenue > 0 ? (stats.physicalSales / stats.totalRevenue * 100) : 0}%` }} />
                        </div>
                      </div>
                      {/* Avg Order Value */}
                      <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Avg Order Value</span>
                          <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#1B5E5E]'}`}>₹{stats.avgOrderValue}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders & Users */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card className={`border-none shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className={darkMode ? 'text-white' : ''}>Recent Orders</CardTitle>
                      <Link href="/admin/orders">
                        <Button variant="ghost" size="sm" className={darkMode ? 'text-gray-300' : ''}>View All</Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentOrders.length === 0 ? (
                        <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No orders yet</p>
                      ) : (
                        recentOrders.map(order => (
                          <div key={order.id} className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${order.delivery_type === 'physical' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                {order.delivery_type === 'physical' ? <Package className="h-5 w-5" /> : <Download className="h-5 w-5" />}
                              </div>
                              <div>
                                <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {order.material?.title || order.product?.title || 'Product'}
                                </p>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {order.shipping_address?.name || order.guest_email || 'Customer'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹{order.amount}</p>
                              <Badge variant="outline" className={`text-xs ${
                                order.delivery_status === 'delivered' ? 'border-green-500 text-green-500' :
                                order.delivery_status === 'shipped' ? 'border-purple-500 text-purple-500' :
                                order.delivery_status === 'pending' ? 'border-yellow-500 text-yellow-500' :
                                'border-blue-500 text-blue-500'
                              }`}>
                                {order.delivery_type !== 'physical' ? 'Digital' : order.delivery_status || 'Pending'}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Users */}
                <Card className={`border-none shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className={darkMode ? 'text-white' : ''}>Recent Users</CardTitle>
                      <Link href="/admin/users">
                        <Button variant="ghost" size="sm" className={darkMode ? 'text-gray-300' : ''}>View All</Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentUsers.length === 0 ? (
                        <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No users yet</p>
                      ) : (
                        recentUsers.map(user => (
                          <div key={user.id} className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#0B9B9B] to-[#1B5E5E] rounded-full flex items-center justify-center text-white font-bold">
                                {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name || 'User'}</p>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {new Date(user.created_at).toLocaleDateString()}
                              </p>
                              {user.is_admin && <Badge className="bg-red-500 text-white text-xs">Admin</Badge>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
