import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePractice } from "@/contexts/PracticeContext";
import { formatTime } from "@/lib/dataUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  RadialBarChart, RadialBar
} from "recharts";
import { 
  BookOpen, ArrowLeft, RotateCcw, Eye, 
  CheckCircle, XCircle, SkipForward, Clock,
  Target, TrendingUp, Award
} from "lucide-react";

const COLORS = {
  correct: "hsl(152, 69%, 40%)",
  incorrect: "hsl(0, 72%, 51%)",
  skipped: "hsl(38, 92%, 50%)",
  accent: "hsl(172, 66%, 40%)",
  muted: "hsl(220, 10%, 85%)"
};

export default function ResultsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { isAuthenticated, isLoading } = useAuth();
  const { result, session, clearSession } = usePractice();
  const navigate = useNavigate();

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

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No results available</p>
          <Button asChild>
            <Link to="/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: "Correct", value: result.correct, color: COLORS.correct },
    { name: "Incorrect", value: result.incorrect, color: COLORS.incorrect },
    { name: "Skipped", value: result.skipped, color: COLORS.skipped },
  ].filter(d => d.value > 0);

  const topicData = result.topicWisePerformance.slice(0, 8).map((tp) => ({
    name: tp.topic.length > 20 ? tp.topic.substring(0, 20) + "..." : tp.topic,
    fullName: tp.topic,
    accuracy: Math.round(tp.accuracy),
    total: tp.total,
    correct: tp.correct,
  }));

  const handleRetake = () => {
    clearSession();
    navigate(`/course/${courseId}`);
  };

  const handleReview = () => {
    navigate(`/review/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/courses" 
              onClick={clearSession}
              className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Test Results</h1>
                <p className="text-xs text-muted-foreground">
                  {result.totalQuestions} questions completed
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleRetake} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Practice Again</span>
            </Button>
            <Button onClick={handleReview} className="gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Review Answers</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Overall Score Card */}
          <Card className="bg-primary text-primary-foreground animate-fade-in overflow-hidden">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-6 w-6" />
                    <span className="text-sm font-medium text-primary-foreground/80">Your Score</span>
                  </div>
                  <div className="text-6xl font-bold mb-2">
                    {Math.round(result.accuracy)}%
                  </div>
                  <p className="text-primary-foreground/70">
                    {result.correct} out of {result.attempted} attempted questions correct
                  </p>
                </div>
                
                {/* Radial Chart */}
                <div className="h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="60%" 
                      outerRadius="100%" 
                      data={[{ value: result.accuracy, fill: "hsl(172, 66%, 50%)" }]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        background={{ fill: "hsl(0, 0%, 100%, 0.1)" }}
                        dataKey="value"
                        cornerRadius={10}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <StatCard
              icon={Target}
              label="Attempted"
              value={result.attempted}
              total={result.totalQuestions}
              color="accent"
            />
            <StatCard
              icon={CheckCircle}
              label="Correct"
              value={result.correct}
              total={result.attempted}
              color="success"
            />
            <StatCard
              icon={XCircle}
              label="Incorrect"
              value={result.incorrect}
              total={result.attempted}
              color="destructive"
            />
            <StatCard
              icon={Clock}
              label="Time Taken"
              value={formatTime(result.timeTaken)}
              isTime
              color="primary"
            />
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="text-lg">Attempt Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {entry.name}: {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart - Topic Performance */}
            <Card className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <CardTitle className="text-lg">Topic-wise Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicData} layout="vertical" margin={{ left: 0, right: 20 }}>
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={100}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => [
                          `${value}% (${props.payload.correct}/${props.payload.total})`,
                          "Accuracy"
                        ]}
                        labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
                      />
                      <Bar 
                        dataKey="accuracy" 
                        fill={COLORS.accent} 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Topic Details Table */}
          <Card className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Topic Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.topicWisePerformance.map((topic, index) => (
                  <div 
                    key={topic.topic}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{topic.topic}</p>
                      <p className="text-sm text-muted-foreground">
                        {topic.correct} of {topic.total} correct
                      </p>
                    </div>
                    <div className="w-32 hidden sm:block">
                      <Progress 
                        value={topic.accuracy} 
                        className="h-2"
                      />
                    </div>
                    <div className={`text-lg font-semibold min-w-[4rem] text-right ${
                      topic.accuracy >= 70 ? "text-success" :
                      topic.accuracy >= 40 ? "text-warning" : "text-destructive"
                    }`}>
                      {Math.round(topic.accuracy)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" variant="outline" onClick={handleRetake} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Practice Again
            </Button>
            <Button size="lg" onClick={handleReview} className="gap-2">
              <Eye className="h-4 w-4" />
              Review All Answers
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  total, 
  color,
  isTime 
}: { 
  icon: any; 
  label: string; 
  value: number | string;
  total?: number;
  color: string;
  isTime?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning/10 text-warning",
    primary: "bg-primary/10 text-primary",
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">
              {value}
              {total && !isTime && <span className="text-sm font-normal text-muted-foreground">/{total}</span>}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
