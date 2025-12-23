import { Question, Course, Topic, SessionResult, TopicPerformance, UserAnswer } from "@/types/question";
import questionsData from "@/data/dataset.json";

// Filter out invalid questions (empty, no question text, duplicates)
function filterValidQuestions(rawQuestions: Question[]): Question[] {
  const seen = new Set<string>();
  
  return rawQuestions.filter(q => {
    // Skip if no question text or very short
    if (!q.question || q.question.trim().length < 20) return false;
    
    // Skip if question is just the topic name
    if (q.question.trim().toLowerCase() === q.topic?.toLowerCase()) return false;
    
    // Create a normalized version of the question for duplicate detection
    const normalizedQuestion = q.question.trim().toLowerCase().replace(/\s+/g, ' ');
    
    // Skip duplicates
    if (seen.has(normalizedQuestion)) return false;
    seen.add(normalizedQuestion);
    
    return true;
  });
}

const questions = filterValidQuestions(questionsData as Question[]);

// Single unified course - all questions merged
export function getCourses(): Course[] {
  const totalQuestions = questions.length;
  const topics = new Set(questions.map(q => q.topic));
  
  return [{
    id: 'exam-prep',
    name: 'Exam Preparation',
    shortName: 'EP',
    description: 'Complete question bank for competitive exam preparation - UGC NET & GATE',
    icon: 'book-open',
    color: '#3B82F6',
    totalQuestions,
    totalTopics: topics.size
  }];
}

// Get all topics (single course)
export function getTopicsForCourse(courseId: string): Topic[] {
  const topicMap = new Map<string, { questions: Question[]; subjects: Set<string> }>();
  
  questions.forEach(q => {
    const existing = topicMap.get(q.topic);
    if (existing) {
      existing.questions.push(q);
      existing.subjects.add(q.subject);
    } else {
      topicMap.set(q.topic, {
        questions: [q],
        subjects: new Set([q.subject])
      });
    }
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

// Get questions for practice
export function getQuestionsForPractice(
  courseId: string,
  topicId?: string,
  limit?: number
): Question[] {
  let filtered = [...questions];

  if (topicId) {
    const topicName = topicId.replace(/-/g, " ");
    filtered = filtered.filter(
      (q) => q.topic.toLowerCase() === topicName.toLowerCase()
    );
  }

  // Shuffle questions
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  
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
