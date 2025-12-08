import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Volume2, CheckCircle, XCircle, ArrowRight, RotateCcw, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// Mock Data for the Quiz
const quizData = {
  title: "Linear Equations in Two Variables",
  questions: [
    {
      id: 1,
      question: "Which of the following is a linear equation in two variables?",
      options: [
        "2x + 5 = 0",
        "x + y + z = 0",
        "2x + 3y = 9",
        "x^2 + y = 5"
      ],
      correctAnswer: 2, // Index of correct option
      explanation: "A linear equation in two variables is of the form ax + by + c = 0. Here, 2x + 3y = 9 matches this form.",
      audioDuration: "0:45"
    },
    {
      id: 2,
      question: "The graph of y = 6 is a line:",
      options: [
        "Parallel to x-axis at a distance of 6 units from origin",
        "Parallel to y-axis at a distance of 6 units from origin",
        "Making an intercept 6 on the x-axis",
        "Passing through the origin"
      ],
      correctAnswer: 0,
      explanation: "The equation y = a represents a line parallel to the x-axis. Here y = 6, so it's parallel to the x-axis at distance 6.",
      audioDuration: "0:32"
    },
    {
      id: 3,
      question: "If (2, 0) is a solution of the linear equation 2x + 3y = k, then the value of k is:",
      options: [
        "4",
        "6",
        "5",
        "2"
      ],
      correctAnswer: 0,
      explanation: "Substitute x=2 and y=0 in the equation: 2(2) + 3(0) = k => 4 + 0 = k => k = 4.",
      audioDuration: "0:55"
    }
  ]
};

export default function QuizPlayer() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

import successImage from "@assets/generated_images/happy_celebration_sticker_for_correct_answer.png";
import errorImage from "@assets/generated_images/cute_encouraging_character_for_wrong_answer.png";

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / quizData.questions.length) * 100;

  const handleOptionSelect = (index: number) => {
    if (isChecked) return; // Prevent changing after checking
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    
    const correct = selectedOption === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setIsChecked(true);

    if (correct) {
      setScore(score + 1);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4361EE', '#7C3AED', '#4CC9F0']
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsChecked(false);
      setIsCorrect(false);
      setIsPlayingAudio(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-xl bg-white text-center p-6 rounded-3xl">
          <CardContent className="pt-6">
            <div className="mb-6 flex justify-center">
              <div className="w-32 h-32 rounded-full bg-indigo-50 flex items-center justify-center text-6xl">
                🏆
              </div>
            </div>
            <h2 className="font-heading text-3xl font-bold mb-2">Quiz Completed!</h2>
            <p className="text-muted-foreground mb-8">
              You scored <span className="text-primary font-bold">{score}</span> out of <span className="font-bold">{quizData.questions.length}</span>
            </p>
            
            <div className="space-y-3">
              <Link href="/practice">
                <Button className="w-full h-12 rounded-full text-lg bg-gradient-primary">
                  Back to Arena
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-full text-lg"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-indigo-50 px-4 py-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/practice/1"> {/* Hardcoded back link for demo */}
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-indigo-50 text-muted-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-heading font-bold text-lg md:text-xl hidden md:block">{quizData.title}</h1>
            <p className="text-xs text-muted-foreground">Question {currentQuestionIndex + 1} of {quizData.questions.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Score: {score * 10} XP
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-1 rounded-none bg-indigo-50" indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500" />

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6 md:py-10 max-w-3xl flex flex-col">
        
        {/* Question Card */}
        <div className="mb-8">
          <h2 className="font-heading text-xl md:text-2xl font-bold leading-relaxed mb-6">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              let stateStyles = "border-2 border-transparent bg-white hover:border-indigo-100 hover:bg-indigo-50/50";
              
              if (selectedOption === index) {
                stateStyles = "border-2 border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md ring-2 ring-indigo-200 ring-offset-2";
              }

              if (isChecked) {
                if (index === currentQuestion.correctAnswer) {
                  stateStyles = "border-2 border-green-500 bg-green-50 text-green-700 shadow-md";
                } else if (selectedOption === index && index !== currentQuestion.correctAnswer) {
                  stateStyles = "border-2 border-red-500 bg-red-50 text-red-700 opacity-70";
                } else {
                  stateStyles = "border-2 border-transparent bg-gray-50 text-gray-400 opacity-50";
                }
              }

              return (
                <motion.div
                  key={index}
                  whileHover={!isChecked ? { scale: 1.01 } : {}}
                  whileTap={!isChecked ? { scale: 0.99 } : {}}
                >
                  <button
                    onClick={() => handleOptionSelect(index)}
                    disabled={isChecked}
                    className={`w-full text-left p-4 md:p-5 rounded-2xl transition-all duration-200 font-medium text-base md:text-lg flex items-center justify-between group ${stateStyles}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${selectedOption === index || (isChecked && index === currentQuestion.correctAnswer) ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </span>
                    
                    {isChecked && index === currentQuestion.correctAnswer && (
                      <CheckCircle className="text-green-600 h-6 w-6" />
                    )}
                    {isChecked && selectedOption === index && index !== currentQuestion.correctAnswer && (
                      <XCircle className="text-red-600 h-6 w-6" />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Feedback Section (Animated) */}
        <AnimatePresence>
          {isChecked && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`rounded-3xl p-6 mb-24 ${isCorrect ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}
            >
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Reaction Image (GIF Simulation) */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="shrink-0 mx-auto md:mx-0"
                >
                  <div className="w-32 h-32 rounded-2xl bg-white shadow-sm overflow-hidden flex items-center justify-center">
                     {/* Replace src with actual generated images once available */}
                    <img 
                      src={isCorrect ? successImage : errorImage} 
                      alt="Reaction" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image not ready yet
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = isCorrect ? '🎉' : '💪';
                        e.currentTarget.parentElement!.style.fontSize = '4rem';
                      }}
                    />
                  </div>
                </motion.div>

                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-heading text-xl font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {isCorrect ? 'Awesome! That\'s correct.' : 'Oops! Not quite.'}
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>

                  {/* Voice Explanation Player */}
                  <div className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm border border-indigo-50/50 w-full md:w-fit">
                    <Button 
                      size="icon" 
                      className={`rounded-full shrink-0 ${isPlayingAudio ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                      onClick={toggleAudio}
                    >
                      {isPlayingAudio ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 pl-0.5" />}
                    </Button>
                    <div className="flex-1 min-w-[120px]">
                      <div className="text-xs font-bold text-indigo-900 mb-1">Explanation by Digraj Sir</div>
                      <div className="h-1 bg-indigo-50 rounded-full overflow-hidden w-full">
                        <motion.div 
                          className="h-full bg-indigo-500"
                          initial={{ width: "0%" }}
                          animate={{ width: isPlayingAudio ? "100%" : "0%" }}
                          transition={{ duration: 10, ease: "linear" }} // Mock duration
                        />
                      </div>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground tabular-nums">
                      {currentQuestion.audioDuration}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-indigo-50 p-4 z-20">
        <div className="container mx-auto max-w-3xl flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground hidden md:inline-block">
            {isChecked ? (isCorrect ? "Great job!" : "Don't worry, learn from the explanation.") : "Select an option to check."}
          </span>
          
          <div className="flex gap-3 w-full md:w-auto ml-auto">
            {!isChecked ? (
              <Button 
                onClick={handleCheckAnswer} 
                disabled={selectedOption === null}
                className="w-full md:w-auto h-12 rounded-full px-8 bg-indigo-600 hover:bg-indigo-700 text-lg shadow-lg shadow-indigo-200 disabled:shadow-none transition-all"
              >
                Check Answer
              </Button>
            ) : (
              <Button 
                onClick={handleNextQuestion} 
                className="w-full md:w-auto h-12 rounded-full px-8 bg-gradient-primary text-lg shadow-lg shadow-indigo-200 animate-in zoom-in duration-300"
              >
                {currentQuestionIndex < quizData.questions.length - 1 ? (
                  <>Next Question <ArrowRight className="ml-2 h-5 w-5" /></>
                ) : (
                  <>Finish Quiz <Trophy className="ml-2 h-5 w-5" /></>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for icon
function Trophy({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
