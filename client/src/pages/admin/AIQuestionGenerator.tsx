import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Brain, Sparkles, Loader2, CheckCircle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AIQuestionGenerator() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState("10");
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

  const handleGenerate = async () => {
    if (!prompt || !subject || !chapter) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate AI generation (replace with actual API call)
    setTimeout(() => {
      const mockQuestions = Array.from({ length: parseInt(questionCount) }, (_, i) => ({
        id: i + 1,
        question: `Sample question ${i + 1} about ${chapter}?`,
        options: [
          "Option A",
          "Option B", 
          "Option C",
          "Option D"
        ],
        correctAnswer: "Option A",
        explanation: `This is the explanation for question ${i + 1}`,
        difficulty: difficulty
      }));
      
      setGeneratedQuestions(mockQuestions);
      setLoading(false);
      
      toast({
        title: "Questions Generated!",
        description: `${questionCount} questions created successfully`
      });
    }, 2000);
  };

  const handleSaveAll = () => {
    toast({
      title: "Questions Saved",
      description: `${generatedQuestions.length} questions saved to database`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-20 pb-12 md:pt-24 md:pb-16 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Brain className="h-10 w-10 text-purple-600" />
            AI Question Generator
          </h1>
          <p className="text-muted-foreground">
            Generate high-quality MCQs using AI based on your requirements
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Generation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="social">Social Science</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Chapter */}
              <div className="space-y-2">
                <Label htmlFor="chapter">Chapter *</Label>
                <Input
                  id="chapter"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="e.g., Linear Equations"
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
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

              {/* Question Count */}
              <div className="space-y-2">
                <Label htmlFor="count">Number of Questions</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="30"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                />
              </div>

              {/* Prompt */}
              <div className="space-y-2">
                <Label htmlFor="prompt">AI Prompt *</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what kind of questions you want to generate..."
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Example: "Generate MCQs on solving linear equations with real-world applications"
                </p>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Questions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Questions Preview */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Questions</CardTitle>
                {generatedQuestions.length > 0 && (
                  <Button onClick={handleSaveAll} size="sm">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Save All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedQuestions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>No questions generated yet</p>
                  <p className="text-sm">Fill in the form and click generate</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {generatedQuestions.map((q, index) => (
                    <div key={q.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">Question {index + 1}</h4>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm mb-3">{q.question}</p>
                      <div className="space-y-1 mb-3">
                        {q.options.map((opt: string, i: number) => (
                          <div
                            key={i}
                            className={`text-xs p-2 rounded ${
                              opt === q.correctAnswer
                                ? 'bg-green-100 text-green-800 font-medium'
                                : 'bg-white'
                            }`}
                          >
                            {String.fromCharCode(65 + i)}. {opt}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold">Explanation:</span> {q.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
