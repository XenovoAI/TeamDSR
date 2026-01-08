import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface Material {
  id: string;
  title: string;
  description?: string;
  download_count?: number;
  file_url?: string;
  chapter?: any;
}

// Helper to safely get nested values
const getChapterName = (material: Material) => {
  if (!material.chapter) return null;
  if (Array.isArray(material.chapter)) {
    return material.chapter[0]?.name || null;
  }
  return material.chapter.name || null;
};

const getSubjectName = (material: Material) => {
  if (!material.chapter) return null;
  const chapter = Array.isArray(material.chapter) ? material.chapter[0] : material.chapter;
  if (!chapter?.subject) return null;
  if (Array.isArray(chapter.subject)) {
    return chapter.subject[0]?.name || null;
  }
  return chapter.subject.name || null;
};

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [searchQuery, materials]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📚 Fetching materials from Supabase...');
      
      // First try a simple query to check if table exists
      const { data, error } = await supabase
        .from('study_materials')
        .select(`
          id,
          title,
          description,
          download_count,
          file_url,
          chapter:chapters(
            name,
            subject:subjects(name)
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Error fetching materials:', error);
        // If table doesn't exist or permission denied, show friendly message
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          setError('Materials database is being set up. Please check back later.');
        } else if (error.code === 'PGRST301' || error.message.includes('permission')) {
          setError('Unable to access materials. Please try again later.');
        } else {
          setError(error.message);
        }
      } else {
        console.log('✅ Materials fetched:', data?.length || 0, 'items');
        setMaterials(data || []);
        setFilteredMaterials(data || []);
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    if (!searchQuery) {
      setFilteredMaterials(materials);
      return;
    }

    const filtered = materials.filter(m =>
      m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getSubjectName(m)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getChapterName(m)?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMaterials(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#AFFFFF]/20 to-white">
      <Navbar />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Search Bar */}
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search materials by title, subject, or chapter..."
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
                <Card key={i} className="border-none shadow-lg">
                  <CardContent className="p-6">
                    <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-none shadow-lg bg-white">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-red-300 mx-auto mb-4" />
                <p className="text-red-600 font-medium mb-2">Error loading materials</p>
                <p className="text-gray-500 text-sm mb-4">{error}</p>
                <button 
                  onClick={fetchMaterials}
                  className="px-4 py-2 bg-[#0B9B9B] text-white rounded-full hover:bg-[#1B5E5E] transition-colors"
                >
                  Try Again
                </button>
              </CardContent>
            </Card>
          ) : filteredMaterials.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMaterials.map((material) => (
                <Card key={material.id} className="border-none shadow-lg hover:shadow-xl transition-all bg-white group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-[#AFFFFF]/30 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-[#0B9B9B]" />
                      </div>
                      {getSubjectName(material) && (
                        <span className="text-xs font-semibold px-3 py-1 bg-[#0DCDCD]/20 text-[#1B5E5E] rounded-full">
                          {getSubjectName(material)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-gray-900 line-clamp-2 group-hover:text-[#0B9B9B] transition-colors">
                      {material.title}
                    </h3>
                    {material.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {material.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {getChapterName(material) && (
                        <span className="truncate">{getChapterName(material)}</span>
                      )}
                      <span className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <Download className="h-3 w-3" />
                        {material.download_count || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-lg bg-white">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-[#0DCDCD] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {searchQuery ? 'No Results Found' : 'No Materials Yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? `No materials found matching "${searchQuery}". Try a different search term.` 
                    : 'Study materials will appear here once they are added. Check back soon!'}
                </p>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-[#0B9B9B] text-white rounded-full hover:bg-[#1B5E5E] transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
