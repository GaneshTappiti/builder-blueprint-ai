"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock, AlertCircle, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  dueDate: string;
  tags: string[];
}

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (tasks: Task[]) => void;
  teamMembers?: Array<{ id: string; name: string; role: string }>;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskUpdate, teamMembers = [] }) => {
  const { toast } = useToast();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    tags: ''
  });

  const handleAddTask = () => {
    if (!newTask.title.trim() || !newTask.assignee) {
      toast({
        title: "Missing information",
        description: "Please fill in the title and assignee fields.",
        variant: "destructive"
      });
      return;
    }

    const task: Task = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      assignee: newTask.assignee,
      priority: newTask.priority,
      status: 'todo',
      dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
      tags: newTask.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    onTaskUpdate([...tasks, task]);
    setIsAddTaskOpen(false);
    setNewTask({
      title: '',
      description: '',
      assignee: '',
      priority: 'medium',
      dueDate: '',
      tags: ''
    });

    toast({
      title: "Task created",
      description: `${task.title} has been assigned to ${task.assignee}.`,
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      priority: task.priority,
      dueDate: task.dueDate,
      tags: task.tags.join(', ')
    });
    setIsAddTaskOpen(true);
  };

  const handleUpdateTask = () => {
    if (!editingTask || !newTask.title.trim() || !newTask.assignee) {
      toast({
        title: "Missing information",
        description: "Please fill in the title and assignee fields.",
        variant: "destructive"
      });
      return;
    }

    const updatedTask: Task = {
      ...editingTask,
      title: newTask.title,
      description: newTask.description,
      assignee: newTask.assignee,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      tags: newTask.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    onTaskUpdate(tasks.map(task => task.id === editingTask.id ? updatedTask : task));
    setIsAddTaskOpen(false);
    setEditingTask(null);
    setNewTask({
      title: '',
      description: '',
      assignee: '',
      priority: 'medium',
      dueDate: '',
      tags: ''
    });

    toast({
      title: "Task updated",
      description: `${updatedTask.title} has been updated.`,
    });
  };

  const handleDeleteTask = (taskId: number) => {
    onTaskUpdate(tasks.filter(task => task.id !== taskId));
    toast({
      title: "Task deleted",
      description: "The task has been removed.",
    });
  };

  const handleStatusChange = (taskId: number, newStatus: 'todo' | 'in-progress' | 'completed') => {
    onTaskUpdate(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    
    const task = tasks.find(t => t.id === taskId);
    toast({
      title: "Status updated",
      description: `${task?.title} is now ${newStatus.replace('-', ' ')}.`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-400" />;
      case 'todo': return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'todo': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <>
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Team Tasks</CardTitle>
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setIsAddTaskOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tasks yet. Create your first task!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="p-4 rounded-lg bg-black/20 border border-white/10 hover:bg-black/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleStatusChange(task.id, 
                        task.status === 'completed' ? 'todo' : 
                        task.status === 'todo' ? 'in-progress' : 'completed'
                      )}
                      className="hover:opacity-80 transition-opacity"
                    >
                      {getStatusIcon(task.status)}
                    </button>
                    <div>
                      <h4 className="font-medium text-white">{task.title}</h4>
                      <p className="text-sm text-gray-400">Assigned to: {task.assignee}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('-', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTask(task)}
                        className="text-gray-400 hover:text-white h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-gray-400 hover:text-red-400 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {task.description && (
                  <p className="text-sm text-gray-300 mb-3">{task.description}</p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  <span>Created: {new Date().toLocaleDateString()}</span>
                </div>
                
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-gray-800/50 border-gray-600 text-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Task Modal */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[600px] bg-black/90 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Task Title *</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                className="bg-black/20 border-white/10 text-white"
                placeholder="Enter task title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                className="bg-black/20 border-white/10 text-white"
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignee" className="text-white">Assign to *</Label>
                <Select value={newTask.assignee} onValueChange={(value) => setNewTask(prev => ({ ...prev, assignee: value }))}>
                  <SelectTrigger className="bg-black/20 border-white/10 text-white">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/10">
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.name} className="text-white hover:bg-white/10">
                        {member.name} ({member.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-white">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="bg-black/20 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/10">
                    <SelectItem value="low" className="text-white hover:bg-white/10">Low</SelectItem>
                    <SelectItem value="medium" className="text-white hover:bg-white/10">Medium</SelectItem>
                    <SelectItem value="high" className="text-white hover:bg-white/10">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-white">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="bg-black/20 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-white">Tags</Label>
                <Input
                  id="tags"
                  value={newTask.tags}
                  onChange={(e) => setNewTask(prev => ({ ...prev, tags: e.target.value }))}
                  className="bg-black/20 border-white/10 text-white"
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddTaskOpen(false);
              setEditingTask(null);
              setNewTask({
                title: '',
                description: '',
                assignee: '',
                priority: 'medium',
                dueDate: '',
                tags: ''
              });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingTask ? handleUpdateTask : handleAddTask}
              className="bg-green-600 hover:bg-green-700"
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskList;
