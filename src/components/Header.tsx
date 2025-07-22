import { Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export const Header = ({ setSidebarOpen }: HeaderProps) => {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
                PromptForge AI
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                From Idea to Launch-Ready Prompts
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Save Project
          </Button>
          <Button size="sm">
            Export Prompts
          </Button>
        </div>
      </div>
    </header>
  );
};