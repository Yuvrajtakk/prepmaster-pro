import { Question, Course, Topic, SessionResult, TopicPerformance, UserAnswer } from "@/types/question";
import questionsData from "@/data/dataset.json";

const questions = questionsData as Question[];

// Normalize exam names to merge variants into main courses
function normalizeExamName(exam: string): "GATE" | "UGC NET" {
  const upperExam = exam.toUpperCase();
  if (upperExam.includes("GATE")) {
    return "GATE";
  }
  return "UGC NET";
}

// Check if a question belongs to a course
function questionBelongsToCourse(question: Question, courseId: string): boolean {
  const normalizedExam = normalizeExamName(question.exam);
  return normalizedExam.toLowerCase().replace(/\s+/g, "-") === courseId;
}

// Extract courses - merged into GATE and UGC NET
export function getCourses(): Course[] {
  const courseMap = new Map<string, { questions: Question[]; topics: Set<string> }>();
  
  questions.forEach((q) => {
    const normalizedExam = normalizeExamName(q.exam);
    if (!courseMap.has(normalizedExam)) {
      courseMap.set(normalizedExam, { questions: [], topics: new Set() });
    }
    const entry = courseMap.get(normalizedExam)!;
    entry.questions.push(q);
    entry.topics.add(q.topic);
  });

  const courseConfig: Record<string, { color: string; icon: string; description: string }> = {
    "GATE": {
      color: "hsl(222 47% 20%)",
      icon: "cpu",
      description: "Graduate Aptitude Test in Engineering - Computer Science & IT"
    },
    "UGC NET": {
      color: "hsl(172 66% 40%)",
      icon: "book-open", 
      description: "University Grants Commission National Eligibility Test - Computer Science"
    }
  };

  return Array.from(courseMap.entries()).map(([exam, data]) => ({
    id: exam.toLowerCase().replace(/\s+/g, "-"),
    name: exam,
    shortName: exam.split(" ").map(w => w[0]).join(""),
    description: courseConfig[exam]?.description || "Competitive examination preparation",
    totalQuestions: data.questions.length,
    totalTopics: data.topics.size,
    icon: courseConfig[exam]?.icon || "book-open",
    color: courseConfig[exam]?.color || "hsl(172 66% 40%)",
  }));
}

// Get topics for a specific course (merged)
export function getTopicsForCourse(courseId: string): Topic[] {
  // Filter questions that belong to this merged course
  const courseQuestions = questions.filter((q) => questionBelongsToCourse(q, courseId));

  const topicMap = new Map<string, { questions: Question[]; subjects: Set<string> }>();
  
  courseQuestions.forEach((q) => {
    if (!topicMap.has(q.topic)) {
      topicMap.set(q.topic, { questions: [], subjects: new Set() });
    }
    const entry = topicMap.get(q.topic)!;
    entry.questions.push(q);
    entry.subjects.add(q.subject);
  });

  return Array.from(topicMap.entries())
    .map(([topic, data]) => ({
      id: topic.toLowerCase().replace(/\s+/g, "-"),
      name: topic,
      courseId,
      questionCount: data.questions.length,
      subjects: Array.from(data.subjects),
    }))
    .sort((a, b) => b.questionCount - a.questionCount);
}

// Get questions for practice (using merged course logic)
export function getQuestionsForPractice(
  courseId: string,
  topicId?: string,
  limit?: number
): Question[] {
  // Filter questions that belong to this merged course
  let filtered = questions.filter((q) => questionBelongsToCourse(q, courseId));

  if (topicId) {
    const topicName = topicId.replace(/-/g, " ");
    filtered = filtered.filter(
      (q) => q.topic.toLowerCase() === topicName.toLowerCase()
    );
  }

  // Shuffle questions
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  
  return limit ? shuffled.slice(0, limit) : shuffled;
}

// Calculate session results
export function calculateResults(
  sessionQuestions: Question[],
  answers: Record<string, UserAnswer>,
  startTime: Date,
  endTime: Date
): SessionResult {
  let correct = 0;
  let attempted = 0;
  let skipped = 0;

  const topicStats = new Map<string, { total: number; correct: number }>();

  sessionQuestions.forEach((q) => {
    const userAnswer = answers[q.id];
    
    // Initialize topic stats
    if (!topicStats.has(q.topic)) {
      topicStats.set(q.topic, { total: 0, correct: 0 });
    }
    const stats = topicStats.get(q.topic)!;
    stats.total++;

    if (!userAnswer || userAnswer.isSkipped) {
      skipped++;
      return;
    }

    attempted++;

    // Check if answer is correct
    const isCorrect = checkAnswer(q, userAnswer.answer);
    if (isCorrect) {
      correct++;
      stats.correct++;
    }
  });

  const topicWisePerformance: TopicPerformance[] = Array.from(topicStats.entries())
    .map(([topic, stats]) => ({
      topic,
      total: stats.total,
      correct: stats.correct,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    sessionId: crypto.randomUUID(),
    totalQuestions: sessionQuestions.length,
    attempted,
    skipped,
    correct,
    incorrect: attempted - correct,
    accuracy: attempted > 0 ? (correct / attempted) * 100 : 0,
    topicWisePerformance,
    timeTaken: Math.floor((endTime.getTime() - startTime.getTime()) / 1000),
  };
}

function checkAnswer(question: Question, userAnswer: string | string[] | number | null): boolean {
  if (userAnswer === null) return false;

  const correctAnswer = question.correct_answer;

  if (correctAnswer.type === "single") {
    return String(userAnswer).toUpperCase() === String(correctAnswer.value).toUpperCase();
  }

  if (correctAnswer.type === "multiple") {
    if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer.value)) {
      return false;
    }
    const sortedUser = [...userAnswer].sort();
    const sortedCorrect = [...correctAnswer.value].sort();
    return JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
  }

  if (correctAnswer.type === "numerical") {
    const userNum = typeof userAnswer === "number" ? userAnswer : parseFloat(String(userAnswer));
    const correctNum = typeof correctAnswer.value === "number" 
      ? correctAnswer.value 
      : parseFloat(String(correctAnswer.value));
    
    // Allow small tolerance for numerical answers
    return Math.abs(userNum - correctNum) < 0.01;
  }

  return false;
}

// Format time in mm:ss
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
