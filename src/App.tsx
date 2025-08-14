import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { OfflineProvider } from "@/hooks/use-offline";
import SafeAreaContainer from "@/components/SafeAreaContainer";
import ConnectionStatus from "@/components/ConnectionStatus";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import RealTimeAlerts from "@/components/RealTimeAlerts";

// Core pages (eagerly loaded)
import Index from "./pages/Index";
import AIAssistant from "./pages/AIAssistant";
import Auth from "./pages/Auth";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Projects from "./pages/Projects";
import Issues from "./pages/Issues";
import Awards from "./pages/Awards";
import CreateDemoUsers from "./pages/CreateDemoUsers";
import Integrations from "./pages/Integrations";
import NotFound from "./pages/NotFound";

// Operations Center pages (core)
import OpsCenter from "./pages/OpsCenter";
import CommandCenterPage from "./pages/CommandCenter";
import SystemLogsPage from "./pages/SystemLogs";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (!navigator.onLine) return false;
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});

const AppShell = () => {
  const location = useLocation();
  const hideSidebar = location.pathname === '/auth';
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {!hideSidebar && <AppSidebar />}
        <main className="flex-1">
          <ConnectionStatus />
          <RealTimeAlerts />
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/issues" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
            <Route path="/awards" element={<ProtectedRoute><Awards /></ProtectedRoute>} />
            <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
            <Route path="/ops-center" element={<ProtectedRoute><OpsCenter /></ProtectedRoute>} />
            <Route path="/command-center" element={<ProtectedRoute><CommandCenterPage /></ProtectedRoute>} />
            <Route path="/logs" element={<ProtectedRoute><SystemLogsPage /></ProtectedRoute>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/create-demo-users" element={<CreateDemoUsers />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
};

const App = () => {
  console.log('App: Rendering core version...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <OfflineProvider>
            <SafeAreaContainer>
              <TooltipProvider>
                <BrowserRouter>
                  <AppShell />
                </BrowserRouter>
              </TooltipProvider>
            </SafeAreaContainer>
          </OfflineProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;