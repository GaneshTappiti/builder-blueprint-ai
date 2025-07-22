import { X, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  currentStage: number;
  setCurrentStage: (stage: number) => void;
}

const stages = [
  { id: 1, title: "Idea Intake", subtitle: "Tool Suggestion" },
  { id: 2, title: "App Skeleton", subtitle: "Structure Generator" },
  { id: 3, title: "UI Prompts", subtitle: "Per Screen Design" },
  { id: 4, title: "Logic Flow", subtitle: "Navigation Mapping" },
  { id: 5, title: "Prompt Pack", subtitle: "Final Composition" },
  { id: 6, title: "Export", subtitle: "Copy & Deploy" },
];

export const Sidebar = ({ isOpen, currentStage, setCurrentStage }: SidebarProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
      
      {/* Sidebar */}
      <aside className="fixed lg:relative w-80 h-full bg-card border-r border-border z-50 lg:z-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-semibold text-lg">Build Process</h2>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {stages.map((stage, index) => {
              const isCompleted = stage.id < currentStage;
              const isCurrent = stage.id === currentStage;
              const isAccessible = stage.id <= currentStage || stage.id === currentStage + 1;

              return (
                <button
                  key={stage.id}
                  onClick={() => isAccessible && setCurrentStage(stage.id)}
                  disabled={!isAccessible}
                  className={cn(
                    "w-full p-4 rounded-lg text-left transition-all duration-200 group",
                    "border border-transparent hover:border-border",
                    isCurrent && "bg-primary/10 border-primary/20",
                    isCompleted && "bg-muted/50",
                    !isAccessible && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : isCurrent ? (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-medium text-sm",
                        isCurrent && "text-primary",
                        isCompleted && "text-foreground",
                        !isAccessible && "text-muted-foreground"
                      )}>
                        {stage.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {stage.subtitle}
                      </p>
                    </div>

                    {isAccessible && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium text-sm mb-2">Progress</h3>
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStage - 1) / (stages.length - 1)) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Stage {currentStage} of {stages.length}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};