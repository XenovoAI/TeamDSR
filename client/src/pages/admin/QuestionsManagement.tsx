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
import { Plus, Search, Edit, Trash2, FileText, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { getAllQuestions, getAllSubjects, getChaptersBySubject } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function QuestionsManagement() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    chapter_id: "",
    question_text: "",
    question_type: "mcq",
    options: ["", "", "", ""],
    correct_answer: "",
    explanation: "",
    difficulty: "medium"
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [searchQuery, questions]);

  const fetchData = async () => {
    try {
      const [questionsData, subjectsData] = await Promise.all([
        getAllQuestions(),
        getAllSubjects()
      ]);
      setQuestions(questionsData);
      setFilteredQuestions(questionsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    if (!searchQuery) {
      setFilteredQuestions(questions);
      return;
    }

    const filtered = questions.filter(q =>
      q.question_text?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredQuestions(filtered);
  };

  const handleSubjectChange = async (subjectId: string) => {
    try {
      const chaptersData = await getChaptersBySubject(subjectId);
      setChapters(chaptersData);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const questionData = {
        ...formData,
        options: JSON.stringify(formData.options),
        is_active: true
      };

      if (editingQuestion) {
        const { error } = await supabase
          .from('questions')
          .update(questionData)
          .eq('id', editingQuestion.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Question updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('questions')
          .insert(questionData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Question created successfully"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving question:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save question",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted successfully"
      });

      fetchData();
    } catch (error: any) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
    setFormData({
      chapter_id: question.chapter_id,
      question_text: question.question_text,
      question_type: question.question_type,
      options: JSON.parse(question.options || '["","","",""]'),
      correct_answer: question.correct_answer,
      explanation: question.explanation || "",
      difficulty: question.difficulty
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setFormData({
      chapter_id: "",
      question_text: "",
      question_type: "mcq",
      options: ["", "", "", ""],
      correct_answer: "",
      explanation: "",
      difficulty: "medium"
    });
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
              Questions Management
            </h1>
            <p className="text-muted-foreground">
              Create and manage practice questions
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <Plus className="mr-2" size={20} />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full">
              <DialogHeader>
                <DialogTitle className="text-lg md:text-xl">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
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
                  <Label>Question Text *</Label>
                  <Textarea
                    value={formData.question_text}
                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                    placeholder="Enter the question..."
                    required
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {formData.options.map((option, index) => (
                    <div key={index} className="space-y-2">
                      <Label>Option {index + 1} *</Label>
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index] = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Correct Answer *</Label>
                  <Select
                    value={formData.correct_answer}
                    onValueChange={(value) => setFormData({ ...formData, correct_answer: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.options.map((option, index) => 
                        option ? (
                          <SelectItem key={index} value={option}>
                            Option {index + 1}: {option}
                          </SelectItem>
                        ) : null
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Explanation</Label>
                  <Textarea
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    placeholder="Explain the correct answer..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingQuestion ? 'Update' : 'Create'} Question
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
              <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-xs text-muted-foreground">Total Questions</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {questions.filter(q => q.difficulty === 'easy').length}
              </div>
              <div className="text-xs text-muted-foreground">Easy</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {questions.filter(q => q.difficulty === 'medium').length}
              </div>
              <div className="text-xs text-muted-foreground">Medium</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {questions.filter(q => q.difficulty === 'hard').length}
              </div>
              <div className="text-xs text-muted-foreground">Hard</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-none shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>All Questions ({filteredQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No questions found</p>
                <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
                  <Plus className="mr-2" size={16} />
                  Add Your First Question
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-3">
                      <div className="flex-1">
                        <p className="font-medium mb-2">{question.question_text}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            {question.chapter?.subject?.name || 'No Subject'}
                          </Badge>
                          <Badge variant="outline">
                            {question.chapter?.name || 'No Chapter'}
                          </Badge>
                          <Badge
                            variant={
                              question.difficulty === 'easy' ? 'default' :
                              question.difficulty === 'hard' ? 'destructive' : 'secondary'
                            }
                          >
                            {question.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(question)}
                          className="flex-1 md:flex-none tap-target"
                        >
                          <Edit size={16} className="md:mr-0 mr-2" />
                          <span className="md:hidden">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(question.id)}
                          className="text-red-600 hover:text-red-700 flex-1 md:flex-none tap-target"
                        >
                          <Trash2 size={16} className="md:mr-0 mr-2" />
                          <span className="md:hidden">Delete</span>
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {JSON.parse(question.options || '[]').map((option: string, index: number) => (
                        <div
                          key={index}
                          className={`p-2 rounded border ${
                            option === question.correct_answer
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {option === question.correct_answer ? (
                              <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                            ) : (
                              <XCircle size={16} className="text-gray-400 shrink-0" />
                            )}
                            <span className="break-words">{option}</span>
                          </div>
                        </div>
                      ))}
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
