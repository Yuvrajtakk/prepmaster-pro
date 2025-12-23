import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PracticeProvider } from "@/contexts/PracticeContext";

import Landing from "./pages/Landing";
import AuthPage from "./pages/Auth";
import Courses from "./pages/Courses";
import CourseDashboard from "./pages/CourseDashboard";
import Practice from "./pages/Practice";
import Results from "./pages/Results";
import Review from "./pages/Review";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <PracticeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/course/:courseId" element={<CourseDashboard />} />
              <Route path="/practice/:courseId" element={<Practice />} />
              <Route path="/practice/:courseId/:topicId" element={<Practice />} />
              <Route path="/results/:courseId" element={<Results />} />
              <Route path="/review/:courseId" element={<Review />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </PracticeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
