"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  PlusCircle,
  Filter,
  Search,
  Calendar,
  User,
  Flag,
  Clock,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import { useToast } from "@/hooks/use-toast";
import taskPlannerHelpers from "@/lib/supabase-connection-helpers";
import { useAuth } from "@/contexts/AuthContext";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string;
  assignee?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function TaskPlannerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [activeView, setActiveView] = useState("kanban");
  const { toast } = useToast();

  // Start with empty tasks - users will create their own tasks
  useEffect(() => {
    // Tasks will be loaded from user's database or created by the user
    setTasks([]);
    setLoading(false);
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === "all" || task.assignee === filterAssignee;

    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const tasksByStatus = {
    todo: filteredTasks.filter(task => task.status === "todo"),
    "in-progress": filteredTasks.filter(task => task.status === "in-progress"),
    done: filteredTasks.filter(task => task.status === "done")
  };

  const handleCreateTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTasks([...tasks, newTask]);
    setIsNewTaskModalOpen(false);
    toast({
      title: "Task created",
      description: "Your task has been created successfully."
    });
  };

  const handleUpdateTask = (taskData: Task) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskData.id
        ? { ...taskData, updatedAt: new Date().toISOString() }
        : task
    );
    setTasks(updatedTasks);
    setIsEditTaskModalOpen(false);
    setSelectedTask(null);
    toast({
      title: "Task updated",
      description: "Your task has been updated successfully."
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast({
      title: "Task deleted",
      description: "Your task has been deleted successfully."
    });
  };

  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        : task
    );
    setTasks(updatedTasks);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "low":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="bg-black/40 backdrop-blur-sm border-white/10 hover:border-green-500/30 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-medium text-white text-sm">{task.title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black/90 backdrop-blur-sm border-white/10">
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedTask(task);
                  setIsEditTaskModalOpen(true);
                }}
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeleteTask(task.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="text-gray-400 text-xs mb-3 line-clamp-2">{task.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <Badge className={`text-xs px-2 py-1 ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </Badge>
          {task.assignee && task.assignee !== "unassigned" && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <User className="h-3 w-3" />
              {task.assignee}
            </div>
          )}
        </div>
        
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
        
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs bg-white/5 border-white/10 text-gray-400">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

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
              <Button
                onClick={() => setIsNewTaskModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Task Planner</h1>
            <p className="text-gray-400">
              Organize and track your startup tasks with our Kanban board
            </p>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/20 border-white/10 text-white placeholder-gray-400"
              />
            </div>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-[140px] bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 backdrop-blur-sm border-white/10">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-full sm:w-[140px] bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 backdrop-blur-sm border-white/10">
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="John Doe">John Doe</SelectItem>
                <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <Tabs value={activeView} onValueChange={setActiveView} className="mb-6">
            <TabsList className="bg-black/40 backdrop-blur-sm border-white/10">
              <TabsTrigger value="kanban" className="data-[state=active]:bg-green-600">Kanban Board</TabsTrigger>
              <TabsTrigger value="list" className="data-[state=active]:bg-green-600">List View</TabsTrigger>
            </TabsList>

            {/* Kanban Board */}
            <TabsContent value="kanban" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* To Do Column */}
                <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Circle className="h-4 w-4 text-gray-400" />
                      To Do ({tasksByStatus.todo.length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {tasksByStatus.todo.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                    {tasksByStatus.todo.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No tasks to do</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* In Progress Column */}
                <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-400" />
                      In Progress ({tasksByStatus["in-progress"].length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {tasksByStatus["in-progress"].map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                    {tasksByStatus["in-progress"].length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No tasks in progress</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Done Column */}
                <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      Done ({tasksByStatus.done.length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {tasksByStatus.done.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                    {tasksByStatus.done.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No completed tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* List View */}
            <TabsContent value="list" className="mt-6">
              <div className="space-y-4">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => (
                    <Card key={task.id} className="bg-black/40 backdrop-blur-sm border-white/10 hover:border-green-500/30 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-white">{task.title}</h4>
                              <Badge className={`text-xs px-2 py-1 ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </Badge>
                              <Badge
                                className={`text-xs px-2 py-1 ${
                                  task.status === 'done'
                                    ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                    : task.status === 'in-progress'
                                      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                      : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                                }`}
                              >
                                {task.status.replace('-', ' ')}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              {task.assignee && task.assignee !== "unassigned" && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {task.assignee}
                                </div>
                              )}
                              {task.dueDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-black/90 backdrop-blur-sm border-white/10">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTask(task);
                                  setIsEditTaskModalOpen(true);
                                }}
                                className="text-gray-300 hover:text-white hover:bg-white/10"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-8">
                      <PlusCircle className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
                      <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
                      <p className="text-gray-400 mb-4">
                        {tasks.length === 0
                          ? "Get started by creating your first task"
                          : "Try adjusting your search or filters"
                        }
                      </p>
                      <Button
                        onClick={() => setIsNewTaskModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Task
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* New Task Modal */}
        <TaskModal
          isOpen={isNewTaskModalOpen}
          onClose={() => setIsNewTaskModalOpen(false)}
          onSubmit={handleCreateTask}
          title="Create New Task"
        />

        {/* Edit Task Modal */}
        <TaskModal
          isOpen={isEditTaskModalOpen}
          onClose={() => {
            setIsEditTaskModalOpen(false);
            setSelectedTask(null);
          }}
          onSubmit={handleUpdateTask}
          title="Edit Task"
          initialTask={selectedTask}
        />
      </main>
    </div>
  );
}

// Task Modal Component
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: any) => void;
  title: string;
  initialTask?: Task | null;
}

const TaskModal = ({ isOpen, onClose, onSubmit, title, initialTask }: TaskModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo" as Task["status"],
    priority: "medium" as Task["priority"],
    dueDate: "",
    assignee: "unassigned",
    tags: [] as string[]
  });

  useEffect(() => {
    if (initialTask) {
      setFormData({
        title: initialTask.title,
        description: initialTask.description,
        status: initialTask.status,
        priority: initialTask.priority,
        dueDate: initialTask.dueDate,
        assignee: initialTask.assignee || "unassigned",
        tags: initialTask.tags
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
        assignee: "unassigned",
        tags: []
      });
    }
  }, [initialTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialTask) {
      onSubmit({ ...initialTask, ...formData });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 backdrop-blur-xl border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-300">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-black/20 border-white/10 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-black/20 border-white/10 text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status" className="text-gray-300">Status</Label>
              <Select value={formData.status} onValueChange={(value: Task["status"]) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-sm border-white/10">
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority" className="text-gray-300">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: Task["priority"]) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-sm border-white/10">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="assignee" className="text-gray-300">Assignee</Label>
            <Select value={formData.assignee} onValueChange={(value) => setFormData({ ...formData, assignee: value })}>
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 backdrop-blur-sm border-white/10">
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="John Doe">John Doe</SelectItem>
                <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dueDate" className="text-gray-300">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="bg-black/20 border-white/10 text-white"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="bg-black/20 border-white/10 text-white hover:bg-black/30">
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {initialTask ? "Update" : "Create"} Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
