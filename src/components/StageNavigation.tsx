import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";

const stages = [
  { id: 1, name: "Tool-Adaptive Engine", path: "/stage/tool-adaptive" },
  { id: 2, name: "Idea Interpreter", path: "/stage/idea-interpreter" },
  { id: 3, name: "App Skeleton Generator", path: "/stage/app-skeleton" },
  { id: 4, name: "UI Prompt Generator", path: "/stage/ui-prompts" },
  { id: 5, name: "Logic Flow Builder", path: "/stage/logic-flow" },
  { id: 6, name: "Prompt Export Composer", path: "/stage/prompt-export" },
];

export const StageNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const currentStageIndex = stages.findIndex(stage => stage.path === location.pathname);
  const currentStage = stages[currentStageIndex];

  const handlePrevious = () => {
    if (currentStageIndex > 0) {
      navigate(stages[currentStageIndex - 1].path);
    }
  };

  const handleNext = () => {
    if (currentStageIndex < stages.length - 1) {
      navigate(stages[currentStageIndex + 1].path);
    }
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4" />
            </Button>
            {currentStage && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Stage {currentStage.id}</Badge>
                <span className="font-medium">{currentStage.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStageIndex <= 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleNext}
              disabled={currentStageIndex >= stages.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};