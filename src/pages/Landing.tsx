import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, BarChart3, CheckCircle, ArrowRight, Award, Users, Clock } from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">GatePrep</span>
          </div>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/courses">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6 animate-fade-in">
            <Award className="h-4 w-4" />
            <span>Trusted by 10,000+ aspirants</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6 animate-slide-up">
            Master Your
            <span className="block text-accent">Competitive Exams</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Comprehensive practice platform for GATE and UGC NET Computer Science. 
            Real exam questions, instant analytics, and focused preparation.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button size="lg" asChild className="gap-2">
              <Link to="/auth">
                Start Practicing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">View Courses</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">5000+</div>
              <div className="text-sm text-muted-foreground mt-1">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">50+</div>
              <div className="text-sm text-muted-foreground mt-1">Topics</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">10+</div>
              <div className="text-sm text-muted-foreground mt-1">Years PYQs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A focused, distraction-free environment designed for serious exam preparation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Target}
              title="Topic-wise Practice"
              description="Focus on specific topics or take full-length tests. Practice at your own pace."
            />
            <FeatureCard
              icon={BarChart3}
              title="Visual Analytics"
              description="Understand your performance with intuitive charts and insights."
            />
            <FeatureCard
              icon={CheckCircle}
              title="Instant Review"
              description="Review your answers with detailed explanations after each session."
            />
          </div>
        </div>
      </section>

      {/* Exams Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Prepare for Top Exams</h2>
            <p className="text-muted-foreground">Curated question banks from previous year papers.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <ExamCard
              name="GATE CSE"
              description="Graduate Aptitude Test in Engineering"
              icon="cpu"
            />
            <ExamCard
              name="UGC NET"
              description="Computer Science & Applications"
              icon="book-open"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Exam?</h2>
          <p className="text-primary-foreground/80 mb-8">
            Join thousands of aspirants who are preparing smarter.
          </p>
          <Button size="lg" variant="secondary" asChild className="gap-2">
            <Link to="/auth">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 GatePrep. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border/50 shadow-soft hover:shadow-medium transition-shadow">
      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-accent" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ExamCard({ name, description, icon }: { name: string; description: string; icon: string }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border/50 shadow-soft hover:shadow-medium transition-all hover:-translate-y-1 cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          {icon === "cpu" ? (
            <Target className="h-6 w-6 text-primary" />
          ) : (
            <BookOpen className="h-6 w-6 text-primary" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-1">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
