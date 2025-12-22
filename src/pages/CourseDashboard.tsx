import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePractice } from "@/contexts/PracticeContext";
import { getCourses, getTopicsForCourse } from "@/lib/dataUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, ArrowLeft, Play, Search, FileText, 
  ChevronRight, Layers, LogOut
} from "lucide-react";

export default function CourseDashboard() {
  const { courseId } = useParams<{ courseId: string }>();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { startSession } = usePractice();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (!courseId) {
    navigate("/courses");
    return null;
  }

  const courses = getCourses();
  const course = courses.find((c) => c.id === courseId);
  const topics = getTopicsForCourse(courseId);

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Course not found</p>
          <Button asChild>
            <Link to="/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleStartFullPractice = () => {
    startSession(courseId, undefined, 50);
    navigate(`/practice/${courseId}`);
  };

  const handleStartTopicPractice = (topicId: string) => {
    startSession(courseId, topicId);
    navigate(`/practice/${courseId}/${topicId}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/courses" 
              className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">{course.name}</h1>
                <p className="text-xs text-muted-foreground">{course.totalQuestions} questions</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Quick Start Card */}
          <Card className="mb-8 bg-primary text-primary-foreground animate-fade-in">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Start Full Practice</h2>
                  <p className="text-primary-foreground/80 text-sm">
                    Practice 50 random questions from all topics
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={handleStartFullPractice}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Play className="h-4 w-4" />
                  Start Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Topics Section */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Topics</h2>
              <p className="text-sm text-muted-foreground">
                {topics.length} topics available
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid gap-3">
            {filteredTopics.map((topic, index) => (
              <Card
                key={topic.id}
                className="group hover:shadow-medium transition-all duration-200 cursor-pointer border-border/50 animate-slide-up"
                style={{ animationDelay: `${index * 0.03}s` }}
                onClick={() => handleStartTopicPractice(topic.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 transition-colors">
                      <FileText className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground mb-0.5 truncate group-hover:text-accent transition-colors">
                        {topic.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {topic.questionCount} questions
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Practice
                      </Button>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTopics.length === 0 && (
            <div className="text-center py-12">
              <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No topics match your search" : "No topics available"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
