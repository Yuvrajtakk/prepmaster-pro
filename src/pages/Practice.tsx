import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePractice } from "@/contexts/PracticeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, ArrowRight, SkipForward, 
  CheckCircle, XCircle, Flag, BookOpen, 
  Clock, Grid3X3
} from "lucide-react";

export default function PracticePage() {
  const { courseId, topicId } = useParams<{ courseId: string; topicId?: string }>();
  const { isAuthenticated, isLoading } = useAuth();
  const { 
    session, 
    currentQuestion, 
    currentIndex, 
    totalQuestions,
    goToNext, 
    goToPrevious, 
    goToQuestion,
    submitAnswer, 
    skipQuestion, 
    getAnswer,
    endSession,
    startSession 
  } = usePractice();
  const navigate = useNavigate();

  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);
  const [numericalInput, setNumericalInput] = useState("");
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showQuestionNav, setShowQuestionNav] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!session && courseId) {
      startSession(courseId, topicId);
    }
  }, [session, courseId, topicId, startSession]);

  useEffect(() => {
    if (currentQuestion) {
      const existingAnswer = getAnswer(currentQuestion.id);
      if (existingAnswer && !existingAnswer.isSkipped) {
        if (currentQuestion.question_type === "nat") {
          setNumericalInput(String(existingAnswer.answer || ""));
          setSelectedAnswer(null);
        } else if (currentQuestion.question_type === "msq") {
          setSelectedAnswer(existingAnswer.answer as string[] || []);
          setNumericalInput("");
        } else {
          setSelectedAnswer(existingAnswer.answer as string || null);
          setNumericalInput("");
        }
      } else {
        setSelectedAnswer(null);
        setNumericalInput("");
      }
    }
  }, [currentQuestion, currentIndex, getAnswer]);

  if (isLoading || !session || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading questions...</div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const currentAnswer = getAnswer(currentQuestion.id);
  const isAnswered = currentAnswer && !currentAnswer.isSkipped;
  const isSkipped = currentAnswer?.isSkipped;

  const handleNext = () => {
    if (currentQuestion.question_type === "nat" && numericalInput) {
      submitAnswer(parseFloat(numericalInput));
    } else if (selectedAnswer) {
      submitAnswer(selectedAnswer);
    }
    goToNext();
  };

  const handlePrevious = () => {
    if (currentQuestion.question_type === "nat" && numericalInput) {
      submitAnswer(parseFloat(numericalInput));
    } else if (selectedAnswer) {
      submitAnswer(selectedAnswer);
    }
    goToPrevious();
  };

  const handleSkip = () => {
    skipQuestion();
  };

  const handleSubmitTest = () => {
    // Save current answer before submitting
    if (currentQuestion.question_type === "nat" && numericalInput) {
      submitAnswer(parseFloat(numericalInput));
    } else if (selectedAnswer) {
      submitAnswer(selectedAnswer);
    }
    
    const result = endSession();
    if (result) {
      navigate(`/results/${courseId}`);
    }
  };

  const handleMSQChange = (option: string, checked: boolean) => {
    const currentSelected = Array.isArray(selectedAnswer) ? selectedAnswer : [];
    if (checked) {
      setSelectedAnswer([...currentSelected, option]);
    } else {
      setSelectedAnswer(currentSelected.filter((o) => o !== option));
    }
  };

  const answeredCount = Object.values(session.answers).filter((a) => !a.isSkipped).length;
  const skippedCount = Object.values(session.answers).filter((a) => a.isSkipped).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to={`/course/${courseId}`} className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </Link>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-foreground">
                  Question {currentIndex + 1} of {totalQuestions}
                </div>
                <div className="text-xs text-muted-foreground">{currentQuestion.topic}</div>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-success">
                  <CheckCircle className="h-4 w-4" />
                  {answeredCount}
                </span>
                <span className="flex items-center gap-1 text-warning">
                  <SkipForward className="h-4 w-4" />
                  {skippedCount}
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowQuestionNav(!showQuestionNav)}
                className="gap-2"
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline">Questions</span>
              </Button>
              
              <Button 
                variant="default"
                size="sm"
                onClick={() => setShowSubmitDialog(true)}
              >
                Submit Test
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 flex gap-6">
        {/* Question Panel */}
        <div className="flex-1 max-w-3xl mx-auto">
          <Card className="shadow-medium border-border/50 animate-fade-in">
            <CardContent className="p-6 md:p-8">
              {/* Question Type Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium uppercase tracking-wide">
                  {currentQuestion.question_type === "mcq" ? "Single Correct" : 
                   currentQuestion.question_type === "msq" ? "Multiple Correct" :
                   currentQuestion.question_type === "nat" ? "Numerical" : "Match"}
                </span>
                {currentQuestion.marks && (
                  <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                    {currentQuestion.marks} marks
                  </span>
                )}
                {isSkipped && (
                  <span className="px-2.5 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">
                    Skipped
                  </span>
                )}
              </div>

              {/* Question Text */}
              <div className="mb-8">
                <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Answer Options */}
              {currentQuestion.question_type === "nat" ? (
                <div className="space-y-3">
                  <Label htmlFor="nat-input" className="text-sm font-medium">
                    Enter your numerical answer:
                  </Label>
                  <Input
                    id="nat-input"
                    type="number"
                    step="any"
                    placeholder="Enter a number..."
                    value={numericalInput}
                    onChange={(e) => setNumericalInput(e.target.value)}
                    className="max-w-xs text-lg"
                  />
                </div>
              ) : currentQuestion.question_type === "msq" ? (
                <div className="space-y-3">
                  {currentQuestion.options && Object.entries(currentQuestion.options).map(([key, value]) => {
                    const isChecked = Array.isArray(selectedAnswer) && selectedAnswer.includes(key);
                    return (
                      <label
                        key={key}
                        className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                          isChecked 
                            ? "border-accent bg-accent/5" 
                            : "border-border hover:border-accent/50 hover:bg-muted/50"
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => handleMSQChange(key, checked as boolean)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-foreground mr-2">{key}.</span>
                          <span className="text-foreground">{value}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <RadioGroup
                  value={selectedAnswer as string || ""}
                  onValueChange={(value) => setSelectedAnswer(value)}
                  className="space-y-3"
                >
                  {currentQuestion.options && Object.entries(currentQuestion.options).map(([key, value]) => (
                    <label
                      key={key}
                      className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedAnswer === key 
                          ? "border-accent bg-accent/5" 
                          : "border-border hover:border-accent/50 hover:bg-muted/50"
                      }`}
                    >
                      <RadioGroupItem value={key} id={key} className="mt-0.5" />
                      <div className="flex-1">
                        <span className="font-medium text-foreground mr-2">{key}.</span>
                        <span className="text-foreground">{value}</span>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6 gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Skip
              </Button>
              
              {currentIndex === totalQuestions - 1 ? (
                <Button 
                  onClick={() => setShowSubmitDialog(true)}
                  className="gap-2"
                >
                  Finish Test
                </Button>
              ) : (
                <Button onClick={handleNext} className="gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigation Sidebar */}
        {showQuestionNav && (
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-24 border-border/50">
              <CardContent className="p-4">
                <h3 className="font-medium text-foreground mb-4">Question Navigator</h3>
                <div className="grid grid-cols-5 gap-2">
                  {session.questions.map((q, index) => {
                    const answer = getAnswer(q.id);
                    const isCurrent = index === currentIndex;
                    const isAnswered = answer && !answer.isSkipped;
                    const isSkipped = answer?.isSkipped;

                    return (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(index)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                          isCurrent
                            ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                            : isAnswered
                            ? "bg-success/20 text-success border border-success/30"
                            : isSkipped
                            ? "bg-warning/20 text-warning border border-warning/30"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-success/20 border border-success/30" />
                    <span className="text-muted-foreground">Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-warning/20 border border-warning/30" />
                    <span className="text-muted-foreground">Skipped ({skippedCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-muted" />
                    <span className="text-muted-foreground">Unattempted ({totalQuestions - answeredCount - skippedCount})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to submit your test?</p>
              <div className="mt-4 p-4 rounded-lg bg-muted space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Answered:</span>
                  <span className="font-medium text-foreground">{answeredCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Skipped:</span>
                  <span className="font-medium text-foreground">{skippedCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unattempted:</span>
                  <span className="font-medium text-foreground">{totalQuestions - answeredCount - skippedCount}</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Practice</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitTest}>
              Submit Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
