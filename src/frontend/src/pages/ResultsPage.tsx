import { useEffect, useState } from 'react';
import { useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { useActor } from '@/hooks/useActor';
import type { Question, Answer } from '../backend';
import { CheckCircle2, XCircle, Trophy } from 'lucide-react';

interface QuizResults {
  score: bigint;
  questions: Question[];
  answers: Answer[];
}

export function ResultsPage() {
  const { actor, isFetching } = useActor();
  const search = useSearch({ from: '/results' });
  const registrationNumber = (search as any).regNo as string;

  const [results, setResults] = useState<QuizResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!actor || isFetching) return;

    if (!registrationNumber) {
      toast.error('Registration number not found');
      return;
    }

    const loadResults = async () => {
      try {
        const detailedResults = await actor.getQuizResultsDetailed(registrationNumber);
        setResults(detailedResults);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading results:', error);
        toast.error('Failed to load results');
        setIsLoading(false);
      }
    };

    loadResults();
  }, [actor, isFetching, registrationNumber]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg">Loading results...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg text-destructive">Results not found</p>
          </div>
        </main>
      </div>
    );
  }

  const totalQuestions = results.questions.length;
  const score = Number(results.score);
  const percentage = Math.round((score / totalQuestions) * 100);
  const correctCount = score;
  const incorrectCount = totalQuestions - score;

  // Create a map of question ID to answer
  const answerMap = new Map(
    results.answers.map(a => [a.questionId.toString(), a.answer])
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Score Card */}
        <div className="mb-8">
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Your Score</p>
                  <p className="text-4xl font-bold text-primary">
                    {score}/{totalQuestions}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Percentage</p>
                  <p className="text-4xl font-bold text-primary">{percentage}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Performance</p>
                  <Badge 
                    variant={percentage >= 70 ? 'default' : percentage >= 50 ? 'secondary' : 'destructive'}
                    className="mt-2 text-lg"
                  >
                    {percentage >= 70 ? 'Excellent' : percentage >= 50 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Correct: {correctCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span className="font-semibold">Incorrect: {incorrectCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Answer Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Q. No.</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Your Answer</TableHead>
                    <TableHead>Correct Answer</TableHead>
                    <TableHead className="w-[100px]">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.questions.map((question, index) => {
                    const userAnswer = answerMap.get(question.id.toString()) || 'Not answered';
                    const isCorrect = userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

                    return (
                      <TableRow key={question.id.toString()}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="max-w-md">
                          <p className="line-clamp-2">{question.text}</p>
                        </TableCell>
                        <TableCell>
                          <span className={isCorrect ? 'text-green-600 font-semibold' : 'text-destructive'}>
                            {userAnswer}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            {question.correctAnswer}
                          </span>
                        </TableCell>
                        <TableCell>
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          © 2026. Built with ❤️ using{' '}
          <a 
            href="https://caffeine.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
