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
      'English': 'bg-pink-50 text-pink-600'
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
            <p className="text-muted-foreground text-sm md:text-base">Access high-quality notes, e-books, and summaries.</p>
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
          <div className="grid gap-3 md:gap-4">
            {filteredMaterials.map((item) => {
              const subject = item.chapter?.subject?.name || 'General';
              const color = getSubjectColor(subject);
              
              return (
                <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-all bg-white group">
                  <CardContent className="p-3 md:p-4 flex items-center gap-3 md:gap-4">
                    <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center ${color} shrink-0`}>
                      <FileText size={20} className="md:w-6 md:h-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 md:gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color.replace('text', 'bg').replace('bg', 'bg-opacity-10')}`}>
                          {subject}
                        </span>
                        <span className="text-[10px] md:text-xs text-muted-foreground uppercase">
                          {item.material_type} • {formatFileSize(item.file_size)}
                        </span>
                        {item.is_premium && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600">
                            PREMIUM
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm md:text-base truncate pr-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate hidden md:block">{item.description}</p>
                      )}
                    </div>

                    <div className="flex gap-1 md:gap-2 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-primary hidden sm:flex tap-target"
                        onClick={() => window.open(item.file_url, '_blank')}
                      >
                        <Eye size={18} className="md:w-5 md:h-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-primary tap-target"
                        onClick={async () => {
                          console.log('📥 Download clicked:', { userId: user?.uid, materialId: item.id });
                          
                          // Track download
                          if (user) {
                            const result = await trackMaterialDownload(user.uid, item.id);
                            console.log('✅ Track result:', result);
                          } else {
                            console.log('⚠️ No user logged in');
                          }
                          
                          // Download file
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
                        <Download size={18} className="md:w-5 md:h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}