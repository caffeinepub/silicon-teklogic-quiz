import { useState, useEffect } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useActor } from '@/hooks/useActor';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Header } from '@/components/Header';
import { exportToExcel, type ExportRow } from '@/utils/excelExport';
import type { Question, Participant, Submission } from '../backend';
import { QuestionType, UserRole } from '../backend';
import { Edit, Trash2, Plus, Download, Search, Trophy, Users, FileQuestion, Mail } from 'lucide-react';

export function AdminDashboard() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [roundFilter, setRoundFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Email whitelist state
  const [whitelistedEmails, setWhitelistedEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [emailSearchQuery, setEmailSearchQuery] = useState('');

  // Participants state
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [participantSearchQuery, setParticipantSearchQuery] = useState('');

  // Question form state
  const [questionForm, setQuestionForm] = useState({
    text: '',
    questionType: QuestionType.mcq,
    options: ['', '', '', ''],
    correctAnswer: '',
    round: '1',
    subject: ''
  });

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (!actor || isFetching) return;

      try {
        const adminStatus = await actor.isCallerAdmin();
        setIsAdmin(adminStatus);
        setIsCheckingAdmin(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setIsCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, [actor, isFetching, identity]);

  // Load data when admin
  useEffect(() => {
    if (!isAdmin || !actor || isFetching) return;

    const loadData = async () => {
      try {
        const [questionsData, emailsData, participantsData, submissionsData] = await Promise.all([
          actor.getAllQuestions(),
          actor.getAllWhitelistedEmails(),
          actor.getAllParticipants(),
          actor.getLeaderboard()
        ]);

        setQuestions(questionsData);
        setFilteredQuestions(questionsData);
        setWhitelistedEmails(emailsData);
        setParticipants(participantsData);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      }
    };

    loadData();
  }, [isAdmin, actor, isFetching]);

  // Filter questions
  useEffect(() => {
    let filtered = [...questions];

    if (roundFilter !== 'all') {
      filtered = filtered.filter(q => q.round.toString() === roundFilter);
    }

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(q => q.subject === subjectFilter);
    }

    setFilteredQuestions(filtered);
  }, [questions, roundFilter, subjectFilter]);

  const handleAdminLogin = async () => {
    if (!identity) {
      toast.error('Please login with Internet Identity first');
      login();
      return;
    }

    if (adminPassword !== 'admin123') {
      toast.error('Incorrect password');
      return;
    }

    if (!actor) return;

    try {
      // Check if already admin
      const currentAdminStatus = await actor.isCallerAdmin();
      if (currentAdminStatus) {
        setIsAdmin(true);
        toast.success('Admin access verified');
        return;
      }

      // Try to initialize system (first caller becomes admin)
      try {
        await actor.initializeSystem();
      } catch (initError: any) {
        // System might already be initialized, that's okay
        if (!initError.message?.includes('already initialized')) {
          throw initError;
        }
      }
      
      // Try to assign admin role
      try {
        await actor.assignCallerUserRole(identity.getPrincipal(), UserRole.admin);
      } catch (assignError: any) {
        // Role might already be assigned
        console.log('Could not assign role, checking status...', assignError);
      }
      
      // Verify final admin status
      const finalAdminStatus = await actor.isCallerAdmin();
      
      if (finalAdminStatus) {
        setIsAdmin(true);
        toast.success('Admin access granted');
      } else {
        toast.error('Failed to grant admin access - you may not be the first user');
      }
    } catch (error) {
      console.error('Error during admin login:', error);
      const errorMessage = (error as Error).message || 'Unknown error';
      toast.error('Admin login failed: ' + errorMessage);
    }
  };

  const handleAddQuestion = async () => {
    if (!actor) return;

    if (!questionForm.text || !questionForm.correctAnswer || !questionForm.subject) {
      toast.error('Please fill all required fields');
      return;
    }

    if (questionForm.questionType === QuestionType.mcq && questionForm.options.filter(o => o.trim()).length < 2) {
      toast.error('MCQ questions must have at least 2 options');
      return;
    }

    try {
      const newQuestion: Question = {
        id: BigInt(0), // Backend will assign
        text: questionForm.text,
        questionType: questionForm.questionType,
        options: questionForm.questionType === QuestionType.mcq 
          ? questionForm.options.filter(o => o.trim())
          : undefined,
        correctAnswer: questionForm.correctAnswer,
        round: BigInt(questionForm.round),
        subject: questionForm.subject
      };

      if (editingQuestion) {
        await actor.updateQuestion(editingQuestion.id, { ...newQuestion, id: editingQuestion.id });
        toast.success('Question updated successfully');
      } else {
        await actor.addQuestion(newQuestion);
        toast.success('Question added successfully');
      }

      // Reload questions
      const updatedQuestions = await actor.getAllQuestions();
      setQuestions(updatedQuestions);
      
      setShowQuestionDialog(false);
      resetQuestionForm();
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question');
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm({
      text: question.text,
      questionType: question.questionType,
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer,
      round: question.round.toString(),
      subject: question.subject
    });
    setShowQuestionDialog(true);
  };

  const handleDeleteQuestion = async (id: bigint) => {
    if (!actor) return;
    
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await actor.deleteQuestion(id);
      toast.success('Question deleted');
      const updatedQuestions = await actor.getAllQuestions();
      setQuestions(updatedQuestions);
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const resetQuestionForm = () => {
    setEditingQuestion(null);
    setQuestionForm({
      text: '',
      questionType: QuestionType.mcq,
      options: ['', '', '', ''],
      correctAnswer: '',
      round: '1',
      subject: ''
    });
  };

  const handleAddEmail = async () => {
    if (!actor) return;

    if (!newEmail.trim()) {
      toast.error('Please enter an email');
      return;
    }

    try {
      await actor.addWhitelistedEmail(newEmail.trim());
      toast.success('Email added to whitelist');
      const updatedEmails = await actor.getAllWhitelistedEmails();
      setWhitelistedEmails(updatedEmails);
      setNewEmail('');
    } catch (error) {
      console.error('Error adding email:', error);
      toast.error('Failed to add email');
    }
  };

  const handleRemoveEmail = async (email: string) => {
    if (!actor) return;

    try {
      await actor.removeWhitelistedEmail(email);
      toast.success('Email removed from whitelist');
      const updatedEmails = await actor.getAllWhitelistedEmails();
      setWhitelistedEmails(updatedEmails);
    } catch (error) {
      console.error('Error removing email:', error);
      toast.error('Failed to remove email');
    }
  };

  const handleExportExcel = async () => {
    if (!actor) return;

    try {
      const exportData = await actor.getExportData();
      
      const formattedData: ExportRow[] = exportData.map(([name, regNo, email, college, score, timestamp]) => ({
        Name: name,
        RegistrationNumber: regNo,
        Email: email,
        College: college,
        Score: Number(score),
        SubmissionTime: new Date(Number(timestamp)).toLocaleString()
      }));

      exportToExcel(formattedData);
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export data');
    }
  };

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>Enter admin password to access the dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!identity && (
                  <Button onClick={login} className="w-full" disabled={loginStatus === 'logging-in'}>
                    {loginStatus === 'logging-in' ? 'Logging in...' : 'Login with Internet Identity'}
                  </Button>
                )}
                
                {identity && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="password">Admin Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Enter password"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                      />
                    </div>
                    <Button onClick={handleAdminLogin} className="w-full">
                      Access Admin Dashboard
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const filteredEmails = whitelistedEmails.filter(email => 
    email.toLowerCase().includes(emailSearchQuery.toLowerCase())
  );

  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(participantSearchQuery.toLowerCase()) ||
    p.registrationNumber.toLowerCase().includes(participantSearchQuery.toLowerCase())
  );

  const participantsWithScores = filteredParticipants.map(participant => {
    const submission = submissions.find(s => s.participant.registrationNumber === participant.registrationNumber);
    return {
      ...participant,
      score: submission ? Number(submission.score) : null,
      submittedAt: submission ? Number(submission.submittedAt) : null
    };
  });

  const leaderboard = [...submissions]
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, 50);

  const uniqueRounds = Array.from(new Set(questions.map(q => q.round.toString()))).sort();
  const uniqueSubjects = Array.from(new Set(questions.map(q => q.subject))).sort();

  return (
    <div className="min-h-screen bg-background">
      <Header showNavigation />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleExportExcel} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </div>

        <Tabs defaultValue="questions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="questions">
              <FileQuestion className="mr-2 h-4 w-4" />
              Questions ({questions.length})
            </TabsTrigger>
            <TabsTrigger value="emails">
              <Mail className="mr-2 h-4 w-4" />
              Emails ({whitelistedEmails.length})
            </TabsTrigger>
            <TabsTrigger value="participants">
              <Users className="mr-2 h-4 w-4" />
              Participants ({participants.length})
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Question Bank Manager</CardTitle>
                  <Button onClick={() => { resetQuestionForm(); setShowQuestionDialog(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </div>
                <CardDescription>
                  Manage quiz questions, filter by round and subject
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Select value={roundFilter} onValueChange={setRoundFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by Round" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rounds</SelectItem>
                      {uniqueRounds.map(round => (
                        <SelectItem key={round} value={round}>Round {round}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {uniqueSubjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">ID</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead className="w-[120px]">Type</TableHead>
                        <TableHead className="w-[80px]">Round</TableHead>
                        <TableHead className="w-[150px]">Subject</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuestions.map((question) => (
                        <TableRow key={question.id.toString()}>
                          <TableCell>{question.id.toString()}</TableCell>
                          <TableCell className="max-w-md">
                            <p className="line-clamp-2">{question.text}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {question.questionType === QuestionType.mcq ? 'MCQ' : 'Short Answer'}
                            </Badge>
                          </TableCell>
                          <TableCell>{question.round.toString()}</TableCell>
                          <TableCell>{question.subject}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditQuestion(question)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteQuestion(question.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emails Tab */}
          <TabsContent value="emails" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Whitelist Manager</CardTitle>
                <CardDescription>
                  Manage approved participant emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                  />
                  <Button onClick={handleAddEmail}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Email
                  </Button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search emails..."
                    value={emailSearchQuery}
                    onChange={(e) => setEmailSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredEmails.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <span>{email}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveEmail(email)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Participant Dashboard</CardTitle>
                <CardDescription>
                  View all registered participants and their scores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or registration number..."
                    value={participantSearchQuery}
                    onChange={(e) => setParticipantSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Registration Number</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>College</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Submission Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participantsWithScores.map((participant) => (
                        <TableRow key={participant.registrationNumber}>
                          <TableCell>{participant.name}</TableCell>
                          <TableCell>{participant.registrationNumber}</TableCell>
                          <TableCell>{participant.email}</TableCell>
                          <TableCell>{participant.college}</TableCell>
                          <TableCell>
                            {participant.score !== null ? (
                              <Badge>{participant.score}</Badge>
                            ) : (
                              <Badge variant="secondary">Not Attempted</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {participant.submittedAt
                              ? new Date(participant.submittedAt).toLocaleString()
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>
                  Top performers ranked by score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Rank</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Registration Number</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Submission Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard.map((submission, index) => (
                        <TableRow key={submission.participant.registrationNumber}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {index < 3 && (
                                <Trophy
                                  className={`h-5 w-5 ${
                                    index === 0
                                      ? 'text-yellow-500'
                                      : index === 1
                                      ? 'text-gray-400'
                                      : 'text-orange-600'
                                  }`}
                                />
                              )}
                              <span className="font-semibold">#{index + 1}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {submission.participant.name}
                          </TableCell>
                          <TableCell>{submission.participant.registrationNumber}</TableCell>
                          <TableCell>
                            <Badge className="text-base">{submission.score.toString()}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(Number(submission.submittedAt)).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Question Dialog */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
            <DialogDescription>
              {editingQuestion ? 'Update the question details' : 'Enter the question details'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="questionText">Question Text</Label>
              <Textarea
                id="questionText"
                value={questionForm.text}
                onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                placeholder="Enter the question"
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="questionType">Type</Label>
                <Select
                  value={questionForm.questionType}
                  onValueChange={(value) => setQuestionForm({ ...questionForm, questionType: value as typeof QuestionType.mcq })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={QuestionType.mcq}>Multiple Choice</SelectItem>
                    <SelectItem value={QuestionType.shortAnswer}>Short Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="round">Round</Label>
                <Input
                  id="round"
                  type="number"
                  min="1"
                  value={questionForm.round}
                  onChange={(e) => setQuestionForm({ ...questionForm, round: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={questionForm.subject}
                  onChange={(e) => setQuestionForm({ ...questionForm, subject: e.target.value })}
                  placeholder="e.g., Physics"
                />
              </div>
            </div>

            {questionForm.questionType === QuestionType.mcq && (
              <div className="space-y-2">
                <Label>Options (MCQ)</Label>
                {questionForm.options.map((option, index) => (
                  <Input
                    key={index}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...questionForm.options];
                      newOptions[index] = e.target.value;
                      setQuestionForm({ ...questionForm, options: newOptions });
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuestionForm({ ...questionForm, options: [...questionForm.options, ''] })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="correctAnswer">Correct Answer</Label>
              <Input
                id="correctAnswer"
                value={questionForm.correctAnswer}
                onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                placeholder="Enter the correct answer"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddQuestion}>
              {editingQuestion ? 'Update' : 'Add'} Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
