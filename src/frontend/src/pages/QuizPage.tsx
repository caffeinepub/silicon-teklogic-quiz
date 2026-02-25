import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Header } from '@/components/Header';
import { useActor } from '@/hooks/useActor';
import { selectRandomQuestions } from '@/utils/questionRandomizer';
import type { Question, Answer } from '../backend';
import { QuestionType } from '../backend';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const QUIZ_DURATION = 30 * 60; // 30 minutes in seconds
const QUESTION_COUNT = 20;

export function QuizPage() {
  const { actor, isFetching } = useActor();
  const navigate = useNavigate();
  const search = useSearch({ from: '/quiz' });
  const registrationNumber = (search as any).regNo as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<bigint, string>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState(QUIZ_DURATION);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load questions on mount
  useEffect(() => {
    if (!actor || isFetching) return;
    
    if (!registrationNumber) {
      toast.error('Registration number not found. Please register first.');
      navigate({ to: '/register' });
      return;
    }

    const loadQuestions = async () => {
      try {
        const allQuestions = await actor.getAllQuestions();
        
        if (allQuestions.length === 0) {
          toast.error('No questions available. Please contact admin.');
          return;
        }

        const selectedQuestions = selectRandomQuestions(allQuestions, QUESTION_COUNT);
        setQuestions(selectedQuestions);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading questions:', error);
        toast.error('Failed to load questions');
      }
    };

    loadQuestions();
  }, [actor, isFetching, registrationNumber, navigate]);

  // Timer countdown
  useEffect(() => {
    if (isLoading || questions.length === 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, questions.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = (questionId: bigint, answer: string) => {
    setAnswers(new Map(answers.set(questionId, answer)));
  };

  const calculateScore = useCallback(() => {
    let score = 0;
    questions.forEach((question) => {
      const userAnswer = answers.get(question.id);
      if (userAnswer && userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
        score++;
      }
    });
    return score;
  }, [questions, answers]);

  const submitQuiz = useCallback(async () => {
    if (!actor) return;

    setIsSubmitting(true);

    try {
      const answerArray: Answer[] = questions.map((q) => ({
        questionId: q.id,
        answer: answers.get(q.id) || ''
      }));

      const score = calculateScore();
      await actor.submitQuiz(registrationNumber, answerArray, BigInt(score));
      
      toast.success('Quiz submitted successfully!');
      navigate({ to: '/results', search: { regNo: registrationNumber } });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  }, [actor, questions, answers, registrationNumber, calculateScore, navigate]);

  const handleAutoSubmit = useCallback(() => {
    toast.info('Time\'s up! Auto-submitting your quiz...');
    submitQuiz();
  }, [submitQuiz]);

  const handleManualSubmit = () => {
    setShowSubmitDialog(true);
  };

  const confirmSubmit = () => {
    setShowSubmitDialog(false);
    submitQuiz();
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg">Loading quiz...</p>
          </div>
        </main>
      </div>
    );
  }

  const attemptedCount = answers.size;
  const unattemptedCount = questions.length - attemptedCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Timer Bar */}
        <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-semibold">Time Remaining:</span>
              <span className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-destructive' : 'text-primary'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">Attempted: {attemptedCount}</Badge>
              <Badge variant="secondary">Unattempted: {unattemptedCount}</Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Question Card */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h2>
                <Badge>{currentQuestion.questionType === QuestionType.mcq ? 'Multiple Choice' : 'Short Answer'}</Badge>
              </div>

              <div className="mb-6">
                <p className="text-base leading-relaxed">{currentQuestion.text}</p>
              </div>

              {currentQuestion.questionType === QuestionType.mcq && currentQuestion.options ? (
                <RadioGroup
                  value={answers.get(currentQuestion.id) || ''}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                >
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="answer">Your Answer</Label>
                  <Input
                    id="answer"
                    value={answers.get(currentQuestion.id) || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full"
                  />
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={goToPrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  onClick={goToNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Panel */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-3 font-semibold">Question Navigator</h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, index) => {
                    const isAnswered = answers.has(q.id);
                    const isCurrent = index === currentQuestionIndex;
                    
                    return (
                      <button
                        key={q.id.toString()}
                        onClick={() => goToQuestion(index)}
                        className={`aspect-square rounded-md text-sm font-medium transition-colors ${
                          isCurrent
                            ? 'bg-primary text-primary-foreground'
                            : isAnswered
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleManualSubmit}
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          </div>
        </div>
      </main>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your quiz? You have answered {attemptedCount} out of {questions.length} questions.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit}>Submit Quiz</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
