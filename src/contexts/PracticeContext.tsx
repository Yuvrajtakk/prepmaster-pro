import React, { createContext, useContext, useState } from "react";
import { Question, UserAnswer, SessionResult, PracticeSession } from "@/types/question";
import { calculateResults, getQuestionsForPractice } from "@/lib/dataUtils";

interface PracticeContextType {
  session: PracticeSession | null;
  startSession: (courseId: string, topicId?: string, limit?: number) => void;
  endSession: () => SessionResult | null;
  currentQuestion: Question | null;
  currentIndex: number;
  totalQuestions: number;
  goToNext: () => void;
  goToPrevious: () => void;
  goToQuestion: (index: number) => void;
  submitAnswer: (answer: string | string[] | number | null) => void;
  skipQuestion: () => void;
  getAnswer: (questionId: string) => UserAnswer | undefined;
  isComplete: boolean;
  result: SessionResult | null;
  clearSession: () => void;
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

export function PracticeProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [result, setResult] = useState<SessionResult | null>(null);

  const startSession = (courseId: string, topicId?: string, limit?: number) => {
    const questions = getQuestionsForPractice(courseId, topicId, limit);
    
    if (questions.length === 0) {
      console.error("No questions found for this selection");
      return;
    }

    const newSession: PracticeSession = {
      id: crypto.randomUUID(),
      courseId,
      topicId,
      questions,
      answers: {},
      startTime: new Date(),
      currentIndex: 0,
    };
    
    setSession(newSession);
    setResult(null);
  };

  const endSession = (): SessionResult | null => {
    if (!session) return null;

    const endTime = new Date();
    const sessionResult = calculateResults(
      session.questions,
      session.answers,
      session.startTime,
      endTime
    );
    
    setResult(sessionResult);
    return sessionResult;
  };

  const submitAnswer = (answer: string | string[] | number | null) => {
    if (!session) return;

    const currentQ = session.questions[session.currentIndex];
    
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [currentQ.id]: {
            questionId: currentQ.id,
            answer,
            isSkipped: false,
          },
        },
      };
    });
  };

  const skipQuestion = () => {
    if (!session) return;

    const currentQ = session.questions[session.currentIndex];
    
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [currentQ.id]: {
            questionId: currentQ.id,
            answer: null,
            isSkipped: true,
          },
        },
      };
    });

    // Move to next question
    goToNext();
  };

  const goToNext = () => {
    if (!session) return;
    if (session.currentIndex < session.questions.length - 1) {
      setSession((prev) => prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : prev);
    }
  };

  const goToPrevious = () => {
    if (!session) return;
    if (session.currentIndex > 0) {
      setSession((prev) => prev ? { ...prev, currentIndex: prev.currentIndex - 1 } : prev);
    }
  };

  const goToQuestion = (index: number) => {
    if (!session) return;
    if (index >= 0 && index < session.questions.length) {
      setSession((prev) => prev ? { ...prev, currentIndex: index } : prev);
    }
  };

  const getAnswer = (questionId: string): UserAnswer | undefined => {
    return session?.answers[questionId];
  };

  const clearSession = () => {
    setSession(null);
    setResult(null);
  };

  const currentQuestion = session?.questions[session.currentIndex] || null;
  const isComplete = session 
    ? Object.keys(session.answers).length === session.questions.length 
    : false;

  return (
    <PracticeContext.Provider
      value={{
        session,
        startSession,
        endSession,
        currentQuestion,
        currentIndex: session?.currentIndex || 0,
        totalQuestions: session?.questions.length || 0,
        goToNext,
        goToPrevious,
        goToQuestion,
        submitAnswer,
        skipQuestion,
        getAnswer,
        isComplete,
        result,
        clearSession,
      }}
    >
      {children}
    </PracticeContext.Provider>
  );
}

export function usePractice() {
  const context = useContext(PracticeContext);
  if (context === undefined) {
    throw new Error("usePractice must be used within a PracticeProvider");
  }
  return context;
}
