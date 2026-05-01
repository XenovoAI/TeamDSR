import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, User, Settings, Download, Package, Loader2 } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { fetchPaidContent, fetchUserPayments, type FirebasePaidContent } from "@/lib/firebase-auth";

interface Purchase {
  id: string;
  amount: number;
  created_at: string;
  material?: {
    id: string;
    title: string;
    slug?: string | null;
    file_url?: string | null;
  } | null;
  product?: {
    id: string;
    title: string;
    slug?: string | null;
  } | null;
}

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const displayName = user?.user_metadata?.name || user?.user_metadata?.full_name || userProfile?.name || "Student";
  const firstName = displayName.split(" ")[0];

  useEffect(() => {
    const loadPurchases = async () => {
      if (!user?.id) {
        setLoadingPurchases(false);
        return;
      }

      try {
        const [paymentRows, paidContent] = await Promise.all([
          fetchUserPayments(user.id),
          fetchPaidContent(),
        ]);

        const contentMap = new Map<string, FirebasePaidContent>();

        for (const item of paidContent) {
          const keys = [item.id, item.title, item.pdfName].filter(Boolean) as string[];
          for (const key of keys) {
            contentMap.set(key.trim().toLowerCase(), item);
          }
        }

        const mappedPurchases = paymentRows.map((payment) => {
          const matchedContent = contentMap.get(payment.pdfTitle.trim().toLowerCase());
          const isHardcopy =
            /hardcopy|hard copy/i.test(payment.pdfTitle) ||
            /hardcopy|hard copy/i.test(matchedContent?.info1 || "") ||
            /hardcopy|hard copy/i.test(matchedContent?.info2 || "") ||
            /hardcopy|hard copy/i.test(matchedContent?.pdfName || "");

          return {
            id: payment.id,
            amount: payment.amount,
            created_at: payment.timestamp || new Date().toISOString(),
            material: isHardcopy
              ? null
              : {
                  id: matchedContent?.id || payment.id,
                  title: matchedContent?.title || payment.pdfTitle,
                  slug: matchedContent?.id || undefined,
                  file_url: matchedContent?.pdfUrl || null,
                },
            product: isHardcopy
              ? {
                  id: matchedContent?.id || payment.id,
                  title: matchedContent?.title || payment.pdfTitle,
                  slug: matchedContent?.id || undefined,
                }
              : null,
          };
        });

        setPurchases(mappedPurchases);
      } catch (error) {
        console.error("Error loading Firebase purchases:", error);
      } finally {
        setLoadingPurchases(false);
      }
    };

    void loadPurchases();
  }, [user?.id]);

  const digitalPurchases = purchases.filter((purchase) => purchase.material);
  const physicalPurchases = purchases.filter((purchase) => purchase.product && !purchase.material);

  const handleDownload = (purchase: Purchase) => {
    if (!purchase.material?.file_url) {
      toast({
        title: "File not available",
        description: "This item is synced from Firebase, but no direct PDF URL is saved yet.",
        variant: "destructive"
      });
      return;
    }

    window.open(purchase.material.file_url, "_blank");
    toast({ title: "Download Started" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-8 md:pt-24 md:pb-12">
        <header className="mb-6 md:mb-10 text-center md:text-left">
          <h1 className="font-heading text-2xl md:text-4xl font-bold mb-2">Welcome back, {firstName}!</h1>
          <p className="text-muted-foreground text-base md:text-lg">Access the same profile and purchases from your app account.</p>
        </header>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl">
          <Link href="/materials">
            <Card className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-[#AFFFFF]/20 to-[#0DCDCD]/20 h-full">
              <CardContent className="p-6 flex flex-col items-center text-center h-full">
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0B9B9B] mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen size={28} />
                </div>
                <h2 className="font-heading text-xl font-bold mb-2">Study Materials</h2>
                <p className="text-sm text-muted-foreground mb-6">Access NEET notes and e-books.</p>
                <Button className="mt-auto bg-[#0B9B9B] hover:bg-[#1B5E5E] text-white rounded-full px-6 w-full">Browse</Button>
              </CardContent>
            </Card>
          </Link>
          <Link href="/profile">
            <Card className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-[#5DDDDD]/20 to-[#0B9B9B]/20 h-full">
              <CardContent className="p-6 flex flex-col items-center text-center h-full">
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#1B5E5E] mb-4 group-hover:scale-110 transition-transform">
                  <User size={28} />
                </div>
                <h2 className="font-heading text-xl font-bold mb-2">My Profile</h2>
                <p className="text-sm text-muted-foreground mb-6">View your synced Firebase profile.</p>
                <Button className="mt-auto bg-[#1B5E5E] hover:bg-[#0B9B9B] text-white rounded-full px-6 w-full">View</Button>
              </CardContent>
            </Card>
          </Link>
          {userProfile?.is_admin && (
            <Link href="/admin">
              <Card className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-[#0DCDCD]/20 to-[#1B5E5E]/20 h-full">
                <CardContent className="p-6 flex flex-col items-center text-center h-full">
                  <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0DCDCD] mb-4 group-hover:scale-110 transition-transform">
                    <Settings size={28} />
                  </div>
                  <h2 className="font-heading text-xl font-bold mb-2">Admin Panel</h2>
                  <p className="text-sm text-muted-foreground mb-6">Manage content.</p>
                  <Button className="mt-auto bg-[#0DCDCD] hover:bg-[#0B9B9B] text-white rounded-full px-6 w-full">Open</Button>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>

        <div className="mt-8 grid gap-6 max-w-5xl">
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-heading text-xl font-bold">My Purchases</h2>
                  <p className="text-sm text-muted-foreground">These orders are now being read directly from your app's Firebase data.</p>
                </div>
                <Badge variant="outline">{purchases.length} orders</Badge>
              </div>

              {loadingPurchases ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#0B9B9B]" />
                </div>
              ) : purchases.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No Firebase purchases found yet for this account.
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Download className="h-4 w-4 text-[#0B9B9B]" />
                      <h3 className="font-semibold">Digital Materials</h3>
                      <Badge variant="secondary">{digitalPurchases.length}</Badge>
                    </div>
                    {digitalPurchases.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No digital purchases yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {digitalPurchases.map((purchase) => (
                          <div key={purchase.id} className="rounded-xl border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                              <p className="font-medium">{purchase.material?.title || "Digital Material"}</p>
                              <p className="text-sm text-muted-foreground">
                                Purchased on {new Date(purchase.created_at).toLocaleDateString("en-IN")}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {purchase.material?.slug && (
                                <Link href={`/materials/${purchase.material.slug}`}>
                                  <Button variant="outline">View</Button>
                                </Link>
                              )}
                              <Button onClick={() => handleDownload(purchase)} className="bg-[#0B9B9B] hover:bg-[#1B5E5E]">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="h-4 w-4 text-[#1B5E5E]" />
                      <h3 className="font-semibold">Hard Copy Orders</h3>
                      <Badge variant="secondary">{physicalPurchases.length}</Badge>
                    </div>
                    {physicalPurchases.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hard copy orders yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {physicalPurchases.map((purchase) => (
                          <div key={purchase.id} className="rounded-xl border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                              <p className="font-medium">{purchase.product?.title || "Hard Copy Order"}</p>
                              <p className="text-sm text-muted-foreground">
                                Ordered on {new Date(purchase.created_at).toLocaleDateString("en-IN")}
                              </p>
                            </div>
                            <Link href="/track">
                              <Button variant="outline">
                                <Package className="mr-2 h-4 w-4" />
                                Track Order
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
