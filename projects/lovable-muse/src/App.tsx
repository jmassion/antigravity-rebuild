import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { I18nProvider } from "@/lib/i18n";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import Assets from "./pages/Assets";
import Uploads from "./pages/Uploads";
import Storyboards from "./pages/Storyboards";
import Connections from "./pages/Connections";
import Docs from "./pages/Docs";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";
import Characters from "./pages/Characters";
import StyleGuides from "./pages/StyleGuides";
import Worlds from "./pages/Worlds";
import Prompts from "./pages/Prompts";
import Campaigns from "./pages/Campaigns";
import MarketingAssets from "./pages/MarketingAssets";
import Team from "./pages/Team";
import AdminTeam from "./pages/AdminTeam";
import Links from "./pages/Links";
import Plans from "./pages/Plans";
import Provenance from "./pages/Provenance";
import TeamMemberDetail from "./pages/TeamMemberDetail";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Canvas from "./pages/Canvas";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
    <Route path="/assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
    <Route path="/uploads" element={<ProtectedRoute><Uploads /></ProtectedRoute>} />
    <Route path="/storyboards" element={<ProtectedRoute><Storyboards /></ProtectedRoute>} />
    <Route path="/connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
    <Route path="/docs" element={<ProtectedRoute><Docs /></ProtectedRoute>} />
    <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
    <Route path="/team/:memberId" element={<ProtectedRoute><TeamMemberDetail /></ProtectedRoute>} />
    <Route path="/admin/team" element={<ProtectedRoute><AdminTeam /></ProtectedRoute>} />
    <Route path="/links" element={<ProtectedRoute><Links /></ProtectedRoute>} />
    {/* START phase */}
    <Route path="/start/characters" element={<ProtectedRoute><Characters /></ProtectedRoute>} />
    <Route path="/start/style-guides" element={<ProtectedRoute><StyleGuides /></ProtectedRoute>} />
    <Route path="/start/worlds" element={<ProtectedRoute><Worlds /></ProtectedRoute>} />
    <Route path="/start/prompts" element={<ProtectedRoute><Prompts /></ProtectedRoute>} />
    {/* BUILD phase */}
    <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
    <Route path="/provenance" element={<ProtectedRoute><Provenance /></ProtectedRoute>} />
    <Route path="/timeline" element={<ProtectedRoute><Storyboards /></ProtectedRoute>} />
    {/* GROW phase */}
    <Route path="/grow/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
    <Route path="/grow/marketing" element={<ProtectedRoute><MarketingAssets /></ProtectedRoute>} />
    <Route path="/canvas" element={<ProtectedRoute><Canvas /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
