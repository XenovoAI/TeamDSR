import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Search, Eye, BookOpen, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Material {
  id: string;
  title: string;
  description?: string;
  download_count?: number;
  file_url?: string;
  thumbnail_url?: string;
  material_type?: string;
  is_premium?: boolean;
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
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [searchQuery, materials]);

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Direct REST API call - more reliable
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

  const handleDownload = async (material: Material) => {
    if (!material.file_url) {
      toast({
        title: "Error",
        description: "File not available",
        variant: "destructive"
      });
      return;
    }

    // Track download if user is logged in
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

    // Open file in new tab
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
      case 'pdf': return <FileText className="h-6 w-6" />;
      case 'notes': return <BookOpen className="h-6 w-6" />;
      default: return <FileText className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#AFFFFF]/20 to-white">
      <Navbar />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2 text-gray-900">
              Study Materials
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Access NEET study notes, e-books, and revision guides
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
                  <Skeleton className="h-40 w-full" />
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
                <Card key={material.id} className="border-none shadow-lg hover:shadow-xl transition-all bg-white group overflow-hidden">
                  {/* Thumbnail */}
                  <div className="relative h-40 bg-gradient-to-br from-[#AFFFFF]/30 to-[#0DCDCD]/20 flex items-center justify-center">
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
                    {material.is_premium && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-yellow-500 text-white">
                          <Lock className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                    )}
                    {material.chapter?.subject?.name && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-white/90 text-[#1B5E5E]">
                          {material.chapter.subject.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-[#0B9B9B] transition-colors">
                      {material.title}
                    </h3>
                    
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
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {material.download_count || 0} downloads
                      </span>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => material.file_url && window.open(material.file_url, '_blank')}
                          className="h-8 px-3"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(material)}
                          className="h-8 px-3 bg-[#0B9B9B] hover:bg-[#1B5E5E]"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
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
