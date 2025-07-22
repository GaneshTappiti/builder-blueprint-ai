import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { StageContent } from "@/components/StageContent";

const Index = () => {
  const [currentStage, setCurrentStage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header setSidebarOpen={setSidebarOpen} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen}
          currentStage={currentStage}
          setCurrentStage={setCurrentStage}
        />
        
        <main className="flex-1 overflow-auto">
          <StageContent currentStage={currentStage} />
        </main>
      </div>
    </div>
  );
};

export default Index;
