import { IdeaIntake } from "@/components/stages/IdeaIntake";
import { AppSkeleton } from "@/components/stages/AppSkeleton";
import { UIPrompts } from "@/components/stages/UIPrompts";
import { LogicFlow } from "@/components/stages/LogicFlow";
import { PromptPack } from "@/components/stages/PromptPack";
import { ExportStage } from "@/components/stages/ExportStage";

interface StageContentProps {
  currentStage: number;
}

export const StageContent = ({ currentStage }: StageContentProps) => {
  const renderStage = () => {
    switch (currentStage) {
      case 1:
        return <IdeaIntake />;
      case 2:
        return <AppSkeleton />;
      case 3:
        return <UIPrompts />;
      case 4:
        return <LogicFlow />;
      case 5:
        return <PromptPack />;
      case 6:
        return <ExportStage />;
      default:
        return <IdeaIntake />;
    }
  };

  return (
    <div className="h-full">
      {renderStage()}
    </div>
  );
};