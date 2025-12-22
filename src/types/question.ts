export interface QuestionOptions {
  A: string;
  B: string;
  C?: string;
  D?: string;
  E?: string;
}

export interface CorrectAnswer {
  type: "single" | "multiple" | "numerical";
  value: string | string[] | number;
}

export interface Question {
  id: string;
  exam: string;
  year: number;
  session?: string;
  paper?: string;
  subject: string;
  topic: string;
  question_type: "mcq" | "msq" | "nat" | "match";
  question: string;
  options?: QuestionOptions;
  correct_answer: CorrectAnswer;
  marks: number | null;
  difficulty?: "easy" | "medium" | "hard";
  labels: string[];
  has_figure: boolean;
  figure: string | null;
}

export interface UserAnswer {
  questionId: string;
  answer: string | string[] | number | null;
  isSkipped: boolean;
  timeTaken?: number;
}

export interface PracticeSession {
  id: string;
  courseId: string;
  topicId?: string;
  questions: Question[];
  answers: Record<string, UserAnswer>;
  startTime: Date;
  endTime?: Date;
  currentIndex: number;
}

export interface SessionResult {
  sessionId: string;
  totalQuestions: number;
  attempted: number;
  skipped: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  topicWisePerformance: TopicPerformance[];
  timeTaken: number;
}

export interface TopicPerformance {
  topic: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface Course {
  id: string;
  name: string;
  shortName: string;
  description: string;
  totalQuestions: number;
  totalTopics: number;
  icon: string;
  color: string;
}

export interface Topic {
  id: string;
  name: string;
  courseId: string;
  questionCount: number;
  subjects: string[];
}
