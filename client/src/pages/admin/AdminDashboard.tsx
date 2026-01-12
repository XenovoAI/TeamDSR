import { useEffect, useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Atom, Beaker, Dna, Package, Tag } from "lucide-react";
import { getAdminStats } from "@/lib/queries";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalMaterials: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adminStats = await getAdminStats();
        
        // Fetch pending orders count
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const ordersRes = await fetch(
          `${supabaseUrl}/rest/v1/purchases?delivery_type=eq.physical&delivery_status=in.(pending,processing)&select=id`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            }
          }
        );
        const ordersData = await ordersRes.json();
        
        setStats({
          totalStudents: adminStats.totalStudents,
          totalMaterials: adminStats.totalMaterials,
          pendingOrders: Array.isArray(ordersData) ? ordersData.length : 0
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-12 md:pt-24 md:pb-16">
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage NEET study materials and users</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#0B9B9B]">
                {loading ? '...' : stats.totalMaterials}
              </div>
              <div className="text-xs text-muted-foreground">Total Materials</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#1B5E5E]">
                {loading ? '...' : stats.totalStudents}
              </div>
              <div className="text-xs text-muted-foreground">Total Users</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#0DCDCD]">3</div>
              <div className="text-xs text-muted-foreground">NEET Subjects</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="flex gap-1">
                <Atom className="h-5 w-5 text-[#1B5E5E]" />
                <Beaker className="h-5 w-5 text-[#0B9B9B]" />
                <Dna className="h-5 w-5 text-[#0DCDCD]" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">PCB</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl">
          <Link href="/admin/materials">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer group h-full">
              <CardHeader className="pb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#0B9B9B] to-[#1B5E5E] flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen size={24} />
                </div>
                <CardTitle className="text-lg group-hover:text-[#0B9B9B] transition-colors">
                  Study Materials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload and manage NEET study materials - Physics, Chemistry & Biology PDFs, notes, and e-books.
                </p>
                <div className="text-xs font-bold text-[#0B9B9B]">
                  {loading ? '...' : stats.totalMaterials} materials
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/orders">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer group h-full">
              <CardHeader className="pb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#5DDDDD] to-[#0DCDCD] flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform relative">
                  <Package size={24} />
                  {stats.pendingOrders > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {stats.pendingOrders}
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg group-hover:text-[#0B9B9B] transition-colors">
                  Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Manage hard copy orders, update shipping status, and track deliveries.
                </p>
                <div className="text-xs font-bold text-[#0B9B9B]">
                  {loading ? '...' : stats.pendingOrders} pending orders
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer group h-full">
              <CardHeader className="pb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#0DCDCD] to-[#0B9B9B] flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <CardTitle className="text-lg group-hover:text-[#0B9B9B] transition-colors">
                  Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Manage NEET aspirants and admin accounts.
                </p>
                <div className="text-xs font-bold text-[#0B9B9B]">
                  {loading ? '...' : stats.totalStudents} users
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/coupons">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer group h-full">
              <CardHeader className="pb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#1B5E5E] to-[#0B9B9B] flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                  <Tag size={24} />
                </div>
                <CardTitle className="text-lg group-hover:text-[#0B9B9B] transition-colors">
                  Coupons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Create discount coupons with product-specific discounts.
                </p>
                <div className="text-xs font-bold text-[#0B9B9B]">
                  Manage discounts
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
