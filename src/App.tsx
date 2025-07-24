import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ToolAdaptive from "./pages/stages/ToolAdaptive";
import IdeaInterpreter from "./pages/stages/IdeaInterpreter";
import AppSkeleton from "./pages/stages/AppSkeleton";
import UIPromptGenerator from "./pages/stages/UIPromptGenerator";
import LogicFlow from "./pages/stages/LogicFlow";
import PromptExport from "./pages/stages/PromptExport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/stage/tool-adaptive" element={<ToolAdaptive />} />
          <Route path="/stage/idea-interpreter" element={<IdeaInterpreter />} />
          <Route path="/stage/app-skeleton" element={<AppSkeleton />} />
          <Route path="/stage/ui-prompts" element={<UIPromptGenerator />} />
          <Route path="/stage/logic-flow" element={<LogicFlow />} />
          <Route path="/stage/prompt-export" element={<PromptExport />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
