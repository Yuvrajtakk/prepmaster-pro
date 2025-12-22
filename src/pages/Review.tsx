import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePractice } from "@/contexts/PracticeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, ArrowRight, BookOpen, CheckCircle, 
  XCircle, SkipForward, Grid3X3, ChevronLeft, ChevronRight
} from "lucide-react";

export default function ReviewPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { isAuthenticated, isLoading } = useAuth();
  const { session, result, clearSession } = usePractice();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session || !result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No session to review</p>
          <Button asChild>
            <Link to="/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  const question = session.questions[currentIndex];
  const userAnswer = session.answers[question.id];
  const correctAnswer = question.correct_answer;
  
  const isCorrect = userAnswer && !userAnswer.isSkipped && 
    String(userAnswer.answer).toUpperCase() === String(correctAnswer.value).toUpperCase();
  const isSkipped = userAnswer?.isSkipped;
  const isIncorrect = userAnswer && !userAnswer.isSkipped && !isCorrect;

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < session.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleFinish = () => {
    clearSession();
    navigate("/courses");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to={`/results/${courseId}`} className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </Link>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-foreground">
                  Review - Question {currentIndex + 1} of {session.questions.length}
                </div>
                <div className="text-xs text-muted-foreground">{question.topic}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowNav(!showNav)}
                className="gap-2"
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline">Questions</span>
              </Button>
              <Button size="sm" onClick={handleFinish}>
                Finish Review
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 flex gap-6">
        {/* Question Panel */}
        <div className="flex-1 max-w-3xl mx-auto">
          <Card className="shadow-medium border-border/50 animate-fade-in">
            <CardContent className="p-6 md:p-8">
              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-4">
                {isCorrect && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    Correct
                  </span>
                )}
                {isIncorrect && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                    <XCircle className="h-4 w-4" />
                    Incorrect
                  </span>
                )}
                {isSkipped && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 text-warning text-sm font-medium">
                    <SkipForward className="h-4 w-4" />
                    Skipped
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                  {question.question_type.toUpperCase()}
                </span>
              </div>

              {/* Question Text */}
              <div className="mb-8">
                <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">
                  {question.question}
                </p>
              </div>

              {/* Answer Options */}
              {question.options && (
                <div className="space-y-3">
                  {Object.entries(question.options).map(([key, value]) => {
                    const isUserAnswer = userAnswer && !userAnswer.isSkipped && 
                      String(userAnswer.answer).toUpperCase() === key;
                    const isCorrectAnswer = String(correctAnswer.value).toUpperCase() === key;

                    let optionClass = "border-border bg-card";
                    if (isCorrectAnswer) {
                      optionClass = "border-success bg-success/5";
                    } else if (isUserAnswer && !isCorrectAnswer) {
                      optionClass = "border-destructive bg-destructive/5";
                    }

                    return (
                      <div
                        key={key}
                        className={`flex items-start gap-4 p-4 rounded-lg border ${optionClass}`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {isCorrectAnswer ? (
                            <CheckCircle className="h-5 w-5 text-success" />
                          ) : isUserAnswer ? (
                            <XCircle className="h-5 w-5 text-destructive" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-border" />
                          )}
                        </div>
                        <div className="flex-1">
                          <span className={`font-medium mr-2 ${
                            isCorrectAnswer ? "text-success" : 
                            isUserAnswer ? "text-destructive" : "text-foreground"
                          }`}>
                            {key}.
                          </span>
                          <span className={`${
                            isCorrectAnswer ? "text-success" : 
                            isUserAnswer && !isCorrectAnswer ? "text-destructive" : "text-foreground"
                          }`}>
                            {value}
                          </span>
                        </div>
                        <div className="flex-shrink-0 text-xs">
                          {isUserAnswer && (
                            <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
                              Your answer
                            </span>
                          )}
                          {isCorrectAnswer && !isUserAnswer && (
                            <span className="px-2 py-1 rounded bg-success/10 text-success">
                              Correct
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* For NAT questions */}
              {question.question_type === "nat" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-border bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Your Answer:</p>
                    <p className={`text-lg font-medium ${
                      isCorrect ? "text-success" : 
                      isSkipped ? "text-warning" : "text-destructive"
                    }`}>
                      {isSkipped ? "Skipped" : String(userAnswer?.answer || "No answer")}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-success bg-success/5">
                    <p className="text-sm text-muted-foreground mb-1">Correct Answer:</p>
                    <p className="text-lg font-medium text-success">
                      {String(correctAnswer.value)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6 gap-4">
            <Button
              variant="outline"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {session.questions.length}
            </span>

            <Button
              variant="outline"
              onClick={goToNext}
              disabled={currentIndex === session.questions.length - 1}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Question Navigation Sidebar */}
        {showNav && (
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-24 border-border/50">
              <CardContent className="p-4">
                <h3 className="font-medium text-foreground mb-4">Question Navigator</h3>
                <div className="grid grid-cols-5 gap-2">
                  {session.questions.map((q, index) => {
                    const answer = session.answers[q.id];
                    const isCurrent = index === currentIndex;
                    const correct = answer && !answer.isSkipped && 
                      String(answer.answer).toUpperCase() === String(q.correct_answer.value).toUpperCase();
                    const skipped = answer?.isSkipped;
                    const incorrect = answer && !answer.isSkipped && !correct;

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                          isCurrent
                            ? "ring-2 ring-primary/50"
                            : ""
                        } ${
                          correct
                            ? "bg-success/20 text-success border border-success/30"
                            : skipped
                            ? "bg-warning/20 text-warning border border-warning/30"
                            : incorrect
                            ? "bg-destructive/20 text-destructive border border-destructive/30"
                            : "bg-muted text-muted-foreground"
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
                    <span className="text-muted-foreground">Correct ({result.correct})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-destructive/20 border border-destructive/30" />
                    <span className="text-muted-foreground">Incorrect ({result.incorrect})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-warning/20 border border-warning/30" />
                    <span className="text-muted-foreground">Skipped ({result.skipped})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
