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
import { Plus, Search, Edit, Trash2, FileText, Loader2, Upload, Download, Eye } from "lucide-react";
import { getAllStudyMaterials, getAllSubjects, getChaptersBySubject } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function MaterialsManagement() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    chapter_id: "",
    title: "",
    description: "",
    material_type: "pdf",
    is_premium: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [searchQuery, materials]);

  const fetchData = async () => {
    try {
      const [materialsData, subjectsData] = await Promise.all([
        getAllStudyMaterials(),
        getAllSubjects()
      ]);
      setMaterials(materialsData);
      setFilteredMaterials(materialsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      m.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMaterials(filtered);
  };

  const handleSubjectChange = async (subjectId: string) => {
    try {
      const chaptersData = await getChaptersBySubject(subjectId);
      setChapters(chaptersData);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedThumbnail(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File, folder: string = 'materials'): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('study-materials')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('study-materials')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile && !editingMaterial) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);

      let fileUrl = editingMaterial?.file_url;
      let fileSize = editingMaterial?.file_size;
      let thumbnailUrl = editingMaterial?.thumbnail_url;

      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile, 'materials');
        fileSize = selectedFile.size;
      }

      if (selectedThumbnail) {
        thumbnailUrl = await uploadFile(selectedThumbnail, 'thumbnails');
      }

      const materialData = {
        ...formData,
        file_url: fileUrl,
        file_size: fileSize,
        thumbnail_url: thumbnailUrl,
        created_by: user?.id,
        is_active: true
      };

      if (editingMaterial) {
        const { error } = await supabase
          .from('study_materials')
          .update(materialData)
          .eq('id', editingMaterial.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Material updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('study_materials')
          .insert(materialData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Material uploaded successfully"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving material:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save material",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      // Delete from storage
      const fileName = fileUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('study-materials')
          .remove([fileName]);
      }

      // Delete from database
      const { error } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Material deleted successfully"
      });

      fetchData();
    } catch (error: any) {
      console.error('Error deleting material:', error);
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (material: any) => {
    setEditingMaterial(material);
    setFormData({
      chapter_id: material.chapter_id,
      title: material.title,
      description: material.description || "",
      material_type: material.material_type,
      is_premium: material.is_premium
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingMaterial(null);
    setSelectedFile(null);
    setSelectedThumbnail(null);
    setFormData({
      chapter_id: "",
      title: "",
      description: "",
      material_type: "pdf",
      is_premium: false
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-12 md:pt-24 md:pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
              <FileText className="text-primary" />
              Study Materials
            </h1>
            <p className="text-muted-foreground">
              Upload and manage PDFs, notes, and study materials
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-gradient-to-r from-[#0B9B9B] to-[#1B5E5E]">
                <Plus className="mr-2" size={20} />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full">
              <DialogHeader>
                <DialogTitle className="text-lg md:text-xl">
                  {editingMaterial ? 'Edit Material' : 'Upload New Material'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select onValueChange={handleSubjectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Chapter *</Label>
                  <Select
                    value={formData.chapter_id}
                    onValueChange={(value) => setFormData({ ...formData, chapter_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select chapter" />
                    </SelectTrigger>
                    <SelectContent>
                      {chapters.map(chapter => (
                        <SelectItem key={chapter.id} value={chapter.id}>
                          {chapter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Algebra Chapter Notes"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the material..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Material Type</Label>
                  <Select
                    value={formData.material_type}
                    onValueChange={(value) => setFormData({ ...formData, material_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="notes">Notes</SelectItem>
                      <SelectItem value="ebook">E-Book</SelectItem>
                      <SelectItem value="worksheet">Worksheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Upload File {!editingMaterial && '*'}</Label>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    required={!editingMaterial}
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Upload Thumbnail (Optional)</Label>
                  <Input
                    type="file"
                    onChange={handleThumbnailChange}
                    accept="image/*"
                  />
                  {selectedThumbnail && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        Preview: {selectedThumbnail.name}
                      </p>
                      <img 
                        src={URL.createObjectURL(selectedThumbnail)} 
                        alt="Thumbnail preview" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  {editingMaterial?.thumbnail_url && !selectedThumbnail && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">Current thumbnail:</p>
                      <img 
                        src={editingMaterial.thumbnail_url} 
                        alt="Current thumbnail" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_premium"
                    checked={formData.is_premium}
                    onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_premium">Premium Content</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {editingMaterial ? 'Update' : 'Upload'} Material
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#0B9B9B]">{materials.length}</div>
              <div className="text-xs text-muted-foreground">Total Materials</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#1B5E5E]">
                {materials.filter(m => m.material_type === 'pdf').length}
              </div>
              <div className="text-xs text-muted-foreground">PDFs</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#0DCDCD]">
                {materials.filter(m => m.is_premium).length}
              </div>
              <div className="text-xs text-muted-foreground">Premium</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#5DDDDD]">
                {materials.reduce((acc, m) => acc + (m.download_count || 0), 0)}
              </div>
              <div className="text-xs text-muted-foreground">Downloads</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-none shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Materials List */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>All Materials ({filteredMaterials.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No materials found</p>
                <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
                  <Plus className="mr-2" size={16} />
                  Upload Your First Material
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      {/* Thumbnail */}
                      {material.thumbnail_url && (
                        <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden shrink-0">
                          <img 
                            src={material.thumbnail_url} 
                            alt={material.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold">{material.title}</h3>
                          {material.is_premium && (
                            <Badge variant="default" className="bg-yellow-600">Premium</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{material.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            {material.chapter?.subject?.name || 'No Subject'}
                          </Badge>
                          <Badge variant="outline">
                            {material.chapter?.name || 'No Chapter'}
                          </Badge>
                          <Badge variant="outline">{material.material_type}</Badge>
                          {material.file_size && (
                            <Badge variant="outline">{formatFileSize(material.file_size)}</Badge>
                          )}
                          <Badge variant="outline">
                            {material.download_count || 0} downloads
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(material.file_url, '_blank')}
                          className="flex-1 md:flex-none tap-target"
                        >
                          <Eye size={16} className="md:mr-0 mr-2" />
                          <span className="md:hidden">View</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(material)}
                          className="flex-1 md:flex-none tap-target"
                        >
                          <Edit size={16} className="md:mr-0 mr-2" />
                          <span className="md:hidden">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(material.id, material.file_url)}
                          className="text-red-600 hover:text-red-700 flex-1 md:flex-none tap-target"
                        >
                          <Trash2 size={16} className="md:mr-0 mr-2" />
                          <span className="md:hidden">Delete</span>
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
