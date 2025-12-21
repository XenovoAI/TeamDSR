import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { getAllStudyMaterials, trackMaterialDownload } from "@/lib/queries";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Materials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [searchQuery, materials]);

  const fetchMaterials = async () => {
    try {
      const data = await getAllStudyMaterials();
      setMaterials(data);
      setFilteredMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
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
      m.chapter?.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMaterials(filtered);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getSubjectColor = (subject: string) => {
    const colors: any = {
      'Mathematics': 'bg-blue-50 text-blue-600',
      'Physics': 'bg-purple-50 text-purple-600',
      'Chemistry': 'bg-green-50 text-green-600',
      'Biology': 'bg-orange-50 text-orange-600',
      'Organic Chemistry': 'bg-emerald-50 text-emerald-600',
      'Inorganic Chemistry': 'bg-teal-50 text-teal-600',
      'Physical Chemistry': 'bg-cyan-50 text-cyan-600'
    };
    return colors[subject] || 'bg-gray-50 text-gray-600';
  };
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-8 md:pt-24 md:pb-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">Study Materials</h1>
            <p className="text-muted-foreground text-sm md:text-base">Access JEE/NEET notes, topic-wise materials, and previous year papers.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search notes..." 
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No materials found matching your search' : 'No study materials available yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMaterials.map((item) => {
              const subject = item.chapter?.subject?.name || 'General';
              const color = getSubjectColor(subject);
              
              return (
                <Card key={item.id} className="border-none shadow-lg hover:shadow-xl transition-all bg-white overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    {/* Thumbnail - Left Side */}
                    <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0">
                      {item.thumbnail_url ? (
                        <img 
                          src={item.thumbnail_url} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${color.replace('text', 'bg').replace('600', '100')}`}>
                          <FileText size={64} className={`${color} opacity-30`} />
                        </div>
                      )}
                      
                      {/* Badges on Thumbnail */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-purple-600 text-white shadow-lg">
                          Class 12
                        </span>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${color} bg-white shadow-lg`}>
                          {subject}
                        </span>
                      </div>
                      
                      {/* Free/Premium Badge */}
                      <div className="absolute bottom-3 left-3">
                        {item.is_premium ? (
                          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-yellow-400 text-yellow-900 shadow-lg flex items-center gap-1">
                            <span>👑</span> PREMIUM
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-500 text-white shadow-lg flex items-center gap-1">
                            <span>🔓</span> FREE
                          </span>
                        )}
                      </div>
                      
                      {/* Download Count */}
                      <div className="absolute bottom-3 right-3 text-xs font-semibold px-2 py-1 rounded bg-black/60 text-white backdrop-blur-sm">
                        📊 {item.download_count || 0} downloads
                      </div>
                    </div>
                    
                    {/* Content - Right Side */}
                    <CardContent className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                      {/* Title and Description */}
                      <div className="mb-4">
                        <h3 className="font-bold text-xl sm:text-2xl mb-2 line-clamp-2 text-gray-900">
                          JEE 2026
                        </h3>
                        <h4 className="font-bold text-lg sm:text-xl mb-3 line-clamp-2">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="lg"
                            className="flex-1 h-12 text-base font-semibold rounded-xl border-2 border-cyan-200 text-cyan-600 hover:bg-cyan-50"
                            onClick={() => window.open(item.file_url, '_blank')}
                          >
                            Preview
                          </Button>
                          <Button 
                            variant="outline" 
                            size="lg"
                            className="flex-1 h-12 text-base font-semibold rounded-xl border-2 border-purple-200 text-purple-600 hover:bg-purple-50"
                          >
                            Discuss
                          </Button>
                        </div>
                        <Button 
                          size="lg"
                          className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                          onClick={async () => {
                            console.log('📥 Download clicked:', { userId: user?.uid, materialId: item.id });
                            
                            if (user) {
                              const result = await trackMaterialDownload(user.uid, item.id);
                              console.log('✅ Track result:', result);
                            }
                            
                            const link = document.createElement('a');
                            link.href = item.file_url;
                            link.download = item.title;
                            link.click();
                            
                            toast({
                              title: "Download Started",
                              description: "Material added to your dashboard"
                            });
                          }}
                        >
                          <Download size={24} className="mr-2" />
                          Download
                        </Button>
                      </div>
                      
                      {/* File Info */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="font-semibold">{formatFileSize(item.file_size)}</span>
                        {item.page_count && <span>• {item.page_count} pages</span>}
                        <span>• {item.material_type.toUpperCase()}</span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}