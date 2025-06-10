import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import SubjectDashboard from "./pages/SubjectDashboard";
import StandaloneFormBuilder from "./pages/StandaloneFormBuilder";
import Forms from "./pages/Forms";
import DataEntry from "./pages/DataEntry";
import QualityControl from "./pages/QualityControl";
import UserManagement from "./pages/UserManagement";
import Assistant from "./pages/Assistant";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <SidebarInset>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/projects/:projectId/subjects/:subjectId" element={<SubjectDashboard />} />
                <Route path="/projects/:id/data-entry" element={<DataEntry />} />
                <Route path="/forms" element={<Forms />} />
                <Route path="/form-builder" element={<StandaloneFormBuilder />} />
                <Route path="/quality-control" element={<QualityControl />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/assistant" element={<Assistant />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;