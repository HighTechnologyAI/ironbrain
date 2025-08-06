
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { OfflineProvider } from "@/hooks/use-offline";
import SafeAreaContainer from "@/components/SafeAreaContainer";
import ConnectionStatus from "@/components/ConnectionStatus";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import AIAssistant from "./pages/AIAssistant";
import Auth from "./pages/Auth";
import AdminPanel from "./pages/AdminPanel";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Projects from "./pages/Projects";
import Analytics from "./pages/Analytics";
import Issues from "./pages/Issues";
import Awards from "./pages/Awards";
import CreateDemoUsers from "./pages/CreateDemoUsers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Не повторяем запросы при отсутствии сети
        if (!navigator.onLine) return false;
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 минут для offline режима
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <OfflineProvider>
          <SafeAreaContainer>
            <TooltipProvider>
              <ConnectionStatus />
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <Routes>
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
                <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/issues" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
                <Route path="/awards" element={<ProtectedRoute><Awards /></ProtectedRoute>} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/create-demo-users" element={<CreateDemoUsers />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </TooltipProvider>
          </SafeAreaContainer>
        </OfflineProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
