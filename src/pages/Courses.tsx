import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCourses } from "@/lib/dataUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Cpu, BarChart3, ArrowRight, LogOut, ChevronRight } from "lucide-react";

export default function CoursesPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const courses = getCourses();

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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "cpu":
        return Cpu;
      case "bar-chart-3":
        return BarChart3;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">ExamPrep Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Hello, {user?.name || "Student"}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-2">Choose Your Course</h1>
            <p className="text-muted-foreground">
              Select an exam to start practicing. Each course contains topic-wise questions from previous years.
            </p>
          </div>

          {/* Course Cards */}
          <div className="grid gap-6">
            {courses.map((course, index) => {
              const IconComponent = getIconComponent(course.icon);
              
              return (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="block animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card className="group hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        {/* Icon */}
                        <div 
                          className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                          style={{ backgroundColor: `${course.color}15` }}
                        >
                          <IconComponent 
                            className="h-8 w-8" 
                            style={{ color: course.color }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                            {course.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {course.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-accent" />
                              <span className="text-muted-foreground">
                                <strong className="text-foreground">{course.totalQuestions}</strong> Questions
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <span className="text-muted-foreground">
                                <strong className="text-foreground">{course.totalTopics}</strong> Topics
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No courses available at the moment.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
