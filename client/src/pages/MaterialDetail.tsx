import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, Share2, Eye, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Material {
  id: string;
  title: string;
  slug: string;
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

export default function MaterialDetail() {
  const [, params] = useRoute("/materials/:slug");
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (params?.slug) {
      fetchMaterial(params.slug);
    }
  }, [params?.slug]);

  const fetchMaterial = async (slugOrId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // First try to fetch by slug
      let response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/study_materials?slug=eq.${encodeURIComponent(slugOrId)}&select=*,chapter:chapters(*,subject:subjects(*))`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          }
        }
      );
      
      let data = [];
      if (response.ok) {
        data = await response.json();
      }
      
      // If not found by slug, try by ID
      if (!data || data.length === 0) {
        response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/study_materials?id=eq.${encodeURIComponent(slugOrId)}&select=*,chapter:chapters(*,subject:subjects(*))`,
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
        
        data = await response.json();
      }
      
      if (data && data.length > 0) {
        setMaterial(data[0]);
      } else {
        setError('Material not found');
      }
    } catch (err: any) {
      console.error('Error fetching material:', err);
      setError(err.message);
    }
    
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!material?.file_url) {
      toast({
        title: "Error",
        description: "File not available",
        variant: "destructive"
      });
      return;
    }

    // Track download
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

    window.open(material.file_url, '_blank');
    
    toast({
      title: "Download Started",
      description: `Downloading ${material.title}`,
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: material?.title,
          text: material?.description,
          url: url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "Material link copied to clipboard",
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#AFFFFF]/20 to-white">
        <Navbar />
        <div className="pt-28 pb-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0B9B9B]" />
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#AFFFFF]/20 to-white">
        <Navbar />
        <div className="pt-28 pb-16">
          <div className="container mx-auto px-4 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Material Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || 'The requested material does not exist.'}</p>
            <Link href="/materials">
              <Button className="bg-[#0B9B9B] hover:bg-[#1B5E5E]">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Materials
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#AFFFFF]/20 to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-24 pb-12 md:pt-28">
        {/* Back Button */}
        <Link href="/materials">
          <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-[#0B9B9B]">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Materials
          </Button>
        </Link>

        {/* Content Header */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-[#0DCDCD]/20 mb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {/* Thumbnail */}
            <div className="w-full md:w-64 h-48 md:h-40 rounded-2xl bg-gradient-to-br from-[#AFFFFF]/30 to-[#0DCDCD]/20 flex items-center justify-center shrink-0 overflow-hidden">
              {material.thumbnail_url ? (
                <img 
                  src={material.thumbnail_url} 
                  alt={material.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileText className="h-16 w-16 text-[#0B9B9B]" />
              )}
            </div>

            {/* Title & Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {material.chapter?.subject?.name && (
                  <Badge className="bg-[#0B9B9B] text-white">
                    {material.chapter.subject.name}
                  </Badge>
                )}
                {material.chapter?.name && (
                  <Badge variant="outline" className="border-[#0DCDCD]/50 text-[#1B5E5E]">
                    {material.chapter.name}
                  </Badge>
                )}
                {material.material_type && (
                  <Badge variant="secondary">
                    {material.material_type.toUpperCase()}
                  </Badge>
                )}
              </div>
              
              <h1 className="font-heading text-2xl md:text-3xl font-bold mb-3 leading-tight text-gray-900">
                {material.title}
              </h1>
              
              {material.description && (
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">
                  {material.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  {material.download_count || 0} downloads
                </span>
                {material.file_size && (
                  <span>Size: {formatFileSize(material.file_size)}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button 
                  size="lg" 
                  onClick={handleDownload}
                  className="rounded-full bg-[#0B9B9B] hover:bg-[#1B5E5E] w-full sm:w-auto"
                >
                  <Download className="mr-2 h-5 w-5" /> Download
                </Button>
                {material.file_url && (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => window.open(material.file_url, '_blank')}
                    className="rounded-full border-2 border-[#0DCDCD]/50 hover:bg-[#AFFFFF]/20 w-full sm:w-auto"
                  >
                    <Eye className="mr-2 h-5 w-5" /> Preview
                  </Button>
                )}
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleShare}
                  className="rounded-full border-2 w-full sm:w-auto"
                >
                  <Share2 className="mr-2 h-5 w-5" /> Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
