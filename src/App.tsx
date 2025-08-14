
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
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LazyComponentWrapper } from "@/components/LazyComponents";

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

// Lazy-loaded heavy pages
import { lazy } from 'react';
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Analytics = lazy(() => import("./pages/Analytics"));

// UAV pages - lazy loaded (only when needed)
const MissionControl = lazy(() => import("./pages/MissionControl"));
const ProductionKanban = lazy(() => import("./pages/ProductionKanban"));
const MaintenanceCenter = lazy(() => import("./pages/MaintenanceCenter"));
const DocumentCenter = lazy(() => import("./pages/DocumentCenter"));
const MissionControlPage = lazy(() => import("./pages/MissionControlOps"));
const FleetPage = lazy(() => import("./pages/FleetManagement"));
const AIOperationsCenter = lazy(() => import("./pages/AIOperationsCenter"));
const UAVDashboard = lazy(() => import("./pages/UAVDashboard"));

// Components
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import RealTimeAlerts from "@/components/RealTimeAlerts";
import { VoiceManager } from "@/voice/VoiceManager";
import { SimpleVoiceButton } from "@/voice/SimpleVoiceButton";
import { FeatureGate } from '@/utils/features';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on network errors or 4xx errors
        if (!navigator.onLine) return false;
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    },
    mutations: {
      retry: 1, // Only retry mutations once
    },
  },
});

const NotificationsBoot = () => {
  // Initialize native push notifications when available
  usePushNotifications();
  return null;
};

const AppShell = () => {
  const location = useLocation();
  const hideSidebar = location.pathname === '/auth';
  
  return (
    <ErrorBoundary>
      <VoiceManager defaultConfig={{ provider: 'openai', mode: 'simple-button' }}>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            {!hideSidebar && <AppSidebar />}
            <main className="flex-1">
              <ConnectionStatus />
              <NotificationsBoot />
              <RealTimeAlerts />
              <SimpleVoiceButton />
              <Toaster />
              <Sonner />
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
                  <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                  <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
                  <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                  <Route path="/issues" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
                  <Route path="/awards" element={<ProtectedRoute><Awards /></ProtectedRoute>} />
                  <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
                  
                  {/* Lazy-loaded heavy pages */}
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <LazyComponentWrapper>
                        <Analytics />
                      </LazyComponentWrapper>
                    </ProtectedRoute>
                  } />
                  {/* UAV-specific routes - conditionally loaded */}
                  <FeatureGate feature="UAV_OPERATIONS">
                    <Route path="/missions" element={
                      <ProtectedRoute>
                        <LazyComponentWrapper>
                          <MissionControl />
                        </LazyComponentWrapper>
                      </ProtectedRoute>
                    } />
                    <Route path="/production" element={
                      <ProtectedRoute>
                        <LazyComponentWrapper>
                          <ProductionKanban />
                        </LazyComponentWrapper>
                      </ProtectedRoute>
                    } />
                    <Route path="/maintenance" element={
                      <ProtectedRoute>
                        <LazyComponentWrapper>
                          <MaintenanceCenter />
                        </LazyComponentWrapper>
                      </ProtectedRoute>
                    } />
                    <Route path="/documents" element={
                      <ProtectedRoute>
                        <LazyComponentWrapper>
                          <DocumentCenter />
                        </LazyComponentWrapper>
                      </ProtectedRoute>
                    } />
                  </FeatureGate>
                  
                  {/* Operations Center Routes */}
                  <FeatureGate feature="UAV_OPERATIONS">
                    <Route path="/ops-center" element={<ProtectedRoute><OpsCenter /></ProtectedRoute>} />
                    <Route path="/command-center" element={<ProtectedRoute><CommandCenterPage /></ProtectedRoute>} />
                    <Route path="/logs" element={<ProtectedRoute><SystemLogsPage /></ProtectedRoute>} />
                    <Route path="/ai-operations" element={
                      <ProtectedRoute>
                        <LazyComponentWrapper>
                          <AIOperationsCenter />
                        </LazyComponentWrapper>
                      </ProtectedRoute>
                    } />
                  </FeatureGate>
                  
                  <FeatureGate feature="MISSION_CONTROL">
                    <Route path="/mission-control" element={
                      <ProtectedRoute>
                        <LazyComponentWrapper>
                          <MissionControlPage />
                        </LazyComponentWrapper>
                      </ProtectedRoute>
                    } />
                  </FeatureGate>
                  
                  <FeatureGate feature="FLEET_MANAGEMENT">
                    <Route path="/fleet" element={
                      <ProtectedRoute>
                        <LazyComponentWrapper>
                          <FleetPage />
                        </LazyComponentWrapper>
                      </ProtectedRoute>
                    } />
                  </FeatureGate>

                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin" element={
                    <LazyComponentWrapper>
                      <AdminPanel />
                    </LazyComponentWrapper>
                  } />
                  <Route path="/create-demo-users" element={<CreateDemoUsers />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </main>
          </div>
        </SidebarProvider>
      </VoiceManager>
    </ErrorBoundary>
  );
};

const App = () => (
  <ErrorBoundary>
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
  </ErrorBoundary>
);

export default App;
