import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import WorldMapPage from "./pages/WorldMapPage";
import StagePage from "./pages/StagePage";
import LessonPage from "./pages/LessonPage";
import ProfilePage from "./pages/ProfilePage";
import ArchitecturePage from "./pages/ArchitecturePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/game" element={<WorldMapPage />} />
              <Route path="/game/stage/:slug" element={<StagePage />} />
              <Route path="/game/stage/:slug/lesson/:lessonSlug" element={<LessonPage />} />
              <Route path="/game/profile" element={<ProfilePage />} />
              <Route path="/architecture" element={<ArchitecturePage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
