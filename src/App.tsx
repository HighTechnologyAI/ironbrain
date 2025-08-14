
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
import Integrations from "./pages/Integrations";
import NotFound from "./pages/NotFound";
// UAV-specific pages
import MissionControl from "./pages/MissionControl";
import ProductionKanban from "./pages/ProductionKanban";
import MaintenanceCenter from "./pages/MaintenanceCenter";
import DocumentCenter from "./pages/DocumentCenter";
// Operations Center pages
import OpsCenter from "./pages/OpsCenter";
import MissionControlPage from "./pages/MissionControlOps";
import FleetPage from "./pages/FleetManagement";
import CommandCenterPage from "./pages/CommandCenter";
import SystemLogsPage from "./pages/SystemLogs";
import AIOperationsCenter from "./pages/AIOperationsCenter";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import RealTimeAlerts from "@/components/RealTimeAlerts";
// Voice AI components
import { VoiceAssistantProvider } from "@/voice/VoiceAssistantProvider";
import { VoiceOverlay } from "@/voice/VoiceOverlay";

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

const NotificationsBoot = () => {
  // Initialize native push notifications when available
  usePushNotifications();
  return null;
};

const AppShell = () => {
  const location = useLocation();
  const hideSidebar = location.pathname === '/auth';
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {!hideSidebar && <AppSidebar />}
        <main className="flex-1">
          <ConnectionStatus />
          <NotificationsBoot />
          <RealTimeAlerts />
          <VoiceOverlay />
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/issues" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
            <Route path="/awards" element={<ProtectedRoute><Awards /></ProtectedRoute>} />
            <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
            {/* UAV-specific routes */}
            <Route path="/missions" element={<ProtectedRoute><MissionControl /></ProtectedRoute>} />
            <Route path="/production" element={<ProtectedRoute><ProductionKanban /></ProtectedRoute>} />
            <Route path="/maintenance" element={<ProtectedRoute><MaintenanceCenter /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><DocumentCenter /></ProtectedRoute>} />
            {/* Operations Center Routes - Feature Flag Protected */}
            {import.meta.env.VITE_FEATURE_OPS_CENTER === 'true' && (
              <Route path="/ops-center" element={<ProtectedRoute><OpsCenter /></ProtectedRoute>} />
            )}
            {import.meta.env.VITE_FEATURE_MISSION_CONTROL === 'true' && (
              <Route path="/mission-control" element={<ProtectedRoute><MissionControlPage /></ProtectedRoute>} />
            )}
            {import.meta.env.VITE_FEATURE_FLEET === 'true' && (
              <Route path="/fleet" element={<ProtectedRoute><FleetPage /></ProtectedRoute>} />
            )}
            {import.meta.env.VITE_FEATURE_COMMAND_CENTER === 'true' && (
              <Route path="/command-center" element={<ProtectedRoute><CommandCenterPage /></ProtectedRoute>} />
            )}
            {import.meta.env.VITE_FEATURE_LOGS === 'true' && (
              <Route path="/logs" element={<ProtectedRoute><SystemLogsPage /></ProtectedRoute>} />
            )}
            {import.meta.env.VITE_FEATURE_OPS_CENTER === 'true' && (
              <Route path="/ai-operations" element={<ProtectedRoute><AIOperationsCenter /></ProtectedRoute>} />
            )}
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/create-demo-users" element={<CreateDemoUsers />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <OfflineProvider>
          <VoiceAssistantProvider>
            <SafeAreaContainer>
              <TooltipProvider>
                <BrowserRouter>
                  <AppShell />
                </BrowserRouter>
              </TooltipProvider>
            </SafeAreaContainer>
          </VoiceAssistantProvider>
        </OfflineProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
