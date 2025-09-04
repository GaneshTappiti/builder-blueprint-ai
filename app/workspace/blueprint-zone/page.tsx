"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Flag, Calendar, ChevronLeft, Menu } from "lucide-react";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import AddPhaseModal from "@/components/blueprint/AddPhaseModal";
import TaskModal from "@/components/blueprint/TaskModal";
import PhaseCard, { Phase, Task } from "@/components/blueprint/PhaseCard";
import { useAuth } from "@/contexts/AuthContext";
import { blueprintZoneHelpers } from "@/lib/supabase-connection-helpers";

export default function BlueprintZonePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("roadmap");
  const [phases, setPhases] = useState<Phase[]>([]);
  const [isAddPhaseModalOpen, setIsAddPhaseModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskModalMode, setTaskModalMode] = useState<"add" | "edit">("add");

  // Load phases from database
  const loadPhases = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await blueprintZoneHelpers.getProjectPhases(user.id);

      if (error) throw error;

      setPhases(data || []);
    } catch (error) {
      console.error('Error loading phases:', error);
      toast({
        title: "Error Loading Phases",
        description: "Failed to load your project phases. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      loadPhases();
    }
  }, [user, loadPhases]);

  const handleAddPhase = async (phase: { title: string; description: string; duration: string }) => {
    if (!user) return;

    try {
      const phaseData = {
        ...phase,
        progress: 0,
        tasks: []
      };
      const { data, error } = await blueprintZoneHelpers.createPhase(phaseData, user.id);

      if (error) throw error;

      setPhases(prev => [...prev, data]);
      setIsAddPhaseModalOpen(false);
      
      toast({
        title: "Phase Added",
        description: "New phase has been added to your roadmap.",
      });
    } catch (error) {
      console.error('Error adding phase:', error);
      toast({
        title: "Error Adding Phase",
        description: "Failed to add phase. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddTask = (phaseId: string) => {
    setSelectedPhaseId(phaseId);
    setSelectedTask(null);
    setTaskModalMode("add");
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (phaseId: string, task: Task) => {
    setSelectedPhaseId(phaseId);
    setSelectedTask(task);
    setTaskModalMode("edit");
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id'>) => {
    if (!user || !selectedPhaseId) return;

    try {
      if (taskModalMode === "add") {
        const { data, error } = await blueprintZoneHelpers.createTask(taskData, user.id);
        
        if (error) throw error;

        setPhases(prev => prev.map(phase => 
          phase.id === selectedPhaseId 
            ? { ...phase, tasks: [...phase.tasks, data] }
            : phase
        ));
      } else if (selectedTask) {
        const { data, error } = await blueprintZoneHelpers.updateTask(selectedTask.id, taskData, user.id);
        
        if (error) throw error;

        setPhases(prev => prev.map(phase => ({
          ...phase,
          tasks: phase.tasks.map(task => 
            task.id === selectedTask.id ? data : task
          )
        })));
      }

      setIsTaskModalOpen(false);
      setSelectedTask(null);
      setSelectedPhaseId(null);
      
      toast({
        title: taskModalMode === "add" ? "Task Added" : "Task Updated",
        description: `Task has been ${taskModalMode === "add" ? "added" : "updated"} successfully.`,
      });
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: "Error Saving Task",
        description: "Failed to save task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleTaskStatus = async (phaseId: string, taskId: number) => {
    if (!user) return;

    try {
      const completed = true; // Toggle logic - you can implement proper toggle logic here
      const { error } = await blueprintZoneHelpers.updateTaskStatus(user.id, taskId, completed);
      
      if (error) throw error;

      setPhases(prev => prev.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task => 
          task.id === taskId ? { ...task, status: completed ? 'completed' : 'in-progress' } : task
        )
      })));
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error Updating Task",
        description: "Failed to update task status. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Mock milestones data
  const milestones = [
    {
      id: "1",
      title: "MVP Launch",
      date: "Q2 2024",
      completed: false
    },
    {
      id: "2", 
      title: "First 1000 Users",
      date: "Q3 2024",
      completed: false
    },
    {
      id: "3",
      title: "Series A Funding",
      date: "Q4 2024", 
      completed: false
    }
  ];

  return (
    <div className="layout-container bg-gradient-to-br from-black via-gray-900 to-green-950">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="layout-main transition-all duration-300">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-black/30"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <Link
                  href="/workspace"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Workspace</span>
                </Link>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                Share Blueprint
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Blueprint Zone</h1>
            <p className="text-gray-400">
              Create detailed roadmaps and strategic plans for your startup
            </p>
          </div>
        
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="bg-black/40 backdrop-blur-sm border-white/10">
              <TabsTrigger value="roadmap" className="data-[state=active]:bg-green-600">
                Roadmap
              </TabsTrigger>
              <TabsTrigger value="milestones" className="data-[state=active]:bg-green-600">
                Milestones
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-green-600">
                Timeline
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="roadmap" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white">Product Roadmap</h2>
                <Button 
                  size="sm" 
                  onClick={() => setIsAddPhaseModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Phase
                </Button>
              </div>
              
              <div className="space-y-6">
                {phases.map((phase, index) => (
                  <PhaseCard 
                    key={phase.id} 
                    phase={phase} 
                    index={index} 
                    onAddTask={handleAddTask}
                    onEditTask={handleEditTask}
                    onToggleTaskStatus={handleToggleTaskStatus}
                  />
                ))}
                
                {phases.length === 0 && (
                  <div className="text-center py-12">
                    <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-8">
                      <Plus className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
                      <h3 className="text-lg font-medium text-white mb-2">No phases yet</h3>
                      <p className="text-gray-400 mb-4">
                        Start building your roadmap by adding your first phase
                      </p>
                      <Button
                        onClick={() => setIsAddPhaseModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Phase
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="milestones" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white">Key Milestones</h2>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Milestone
                </Button>
              </div>

              <div className="grid gap-4">
                {milestones.map(milestone => (
                  <Card key={milestone.id} className="bg-black/40 backdrop-blur-sm border-white/10 hover:border-green-500/30 transition-all duration-300">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Flag className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-white">{milestone.title}</h3>
                          <p className="text-sm text-gray-400">{milestone.date}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="bg-black/20 border-white/10 hover:bg-black/30 text-white">
                        Mark Complete
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white">Timeline View</h2>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Calendar className="h-4 w-4 mr-1" />
                  Change View
                </Button>
              </div>

              <Card className="bg-black/40 backdrop-blur-sm border-white/10 p-6">
                <div className="text-center py-16">
                  <h3 className="text-xl font-medium text-white mb-4">Timeline Visualization</h3>
                  <p className="text-gray-400 mb-6">Interactive timeline view coming soon</p>
                  <Button className="bg-green-600 hover:bg-green-700">Generate Timeline</Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Modals */}
        <AddPhaseModal
          isOpen={isAddPhaseModalOpen}
          onClose={() => setIsAddPhaseModalOpen(false)}
          onAddPhase={handleAddPhase}
        />

        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSaveTask={handleSaveTask}
          task={selectedTask || undefined}
          mode={taskModalMode}
        />
      </main>
    </div>
  );
}
