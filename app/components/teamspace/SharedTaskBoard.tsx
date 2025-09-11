"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Edit, 
  Trash2, 
  MessageSquare, 
  UserPlus, 
  MoreHorizontal,
  Calendar,
  Users,
  Target,
  ChevronDown,
  ChevronUp,
  Send,
  Reply
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy';
}

interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  replies?: TaskComment[];
}

interface SharedTask {
  id: string;
  title: string;
  description: string;
  assignees: TeamMember[];
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  dueDate: Date;
  progress: number; // 0-100 percentage
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  comments: TaskComment[];
}

interface SharedTaskBoardProps {
  teamMembers: TeamMember[];
  currentUserId: string;
  onTaskUpdate?: (tasks: SharedTask[]) => void;
}

const SharedTaskBoard: React.FC<SharedTaskBoardProps> = ({ 
  teamMembers, 
  currentUserId, 
  onTaskUpdate 
}) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<SharedTask[]>([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<SharedTask | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignees: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    tags: '',
    progress: 0
  });
  const [newComment, setNewComment] = useState<{ [taskId: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<{ [commentId: string]: boolean }>({});
  const [replyContent, setReplyContent] = useState<{ [commentId: string]: string }>({});

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would be WebSocket or Server-Sent Events
      // For now, we'll just simulate some activity
      setTasks(prevTasks => [...prevTasks]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleAddTask = () => {
    if (!newTask.title.trim() || newTask.assignees.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in the title and assign at least one team member.",
        variant: "destructive"
      });
      return;
    }

    const assignedMembers = teamMembers.filter(member => 
      newTask.assignees.includes(member.id)
    );

    const task: SharedTask = {
      id: crypto.randomUUID(),
      title: newTask.title,
      description: newTask.description,
      assignees: assignedMembers,
      priority: newTask.priority,
      status: 'todo',
      dueDate: new Date(newTask.dueDate || Date.now() + 7 * 24 * 60 * 60 * 1000),
      progress: newTask.progress,
      tags: newTask.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: currentUserId,
      comments: []
    };

    setTasks(prev => [task, ...prev]);
    onTaskUpdate?.([task, ...tasks]);
    setIsAddTaskOpen(false);
    resetNewTask();

    toast({
      title: "Task created",
      description: `${task.title} has been assigned to ${assignedMembers.map(m => m.name).join(', ')}.`,
    });
  };

  const handleUpdateTask = () => {
    if (!editingTask || !newTask.title.trim() || newTask.assignees.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in the title and assign at least one team member.",
        variant: "destructive"
      });
      return;
    }

    const assignedMembers = teamMembers.filter(member => 
      newTask.assignees.includes(member.id)
    );

    const updatedTask: SharedTask = {
      ...editingTask,
      title: newTask.title,
      description: newTask.description,
      assignees: assignedMembers,
      priority: newTask.priority,
      dueDate: new Date(newTask.dueDate),
      progress: newTask.progress,
      tags: newTask.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      updatedAt: new Date()
    };

    setTasks(prev => prev.map(task => task.id === editingTask.id ? updatedTask : task));
    onTaskUpdate?.(tasks.map(task => task.id === editingTask.id ? updatedTask : task));
    setIsAddTaskOpen(false);
    setEditingTask(null);
    resetNewTask();

    toast({
      title: "Task updated",
      description: `${updatedTask.title} has been updated.`,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    onTaskUpdate?.(tasks.filter(task => task.id !== taskId));
    toast({
      title: "Task deleted",
      description: "The task has been removed.",
    });
  };

  const handleStatusChange = (taskId: string, newStatus: 'todo' | 'in-progress' | 'completed') => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { 
        ...task, 
        status: newStatus,
        progress: newStatus === 'completed' ? 100 : task.progress,
        updatedAt: new Date()
      } : task
    ));
    
    const task = tasks.find(t => t.id === taskId);
    toast({
      title: "Status updated",
      description: `${task?.title} is now ${newStatus.replace('-', ' ')}.`,
    });
  };

  const handleProgressChange = (taskId: string, progress: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { 
        ...task, 
        progress: Math.max(0, Math.min(100, progress)),
        status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'todo',
        updatedAt: new Date()
      } : task
    ));
  };

  const handleReassign = (taskId: string, newAssignees: string[]) => {
    const assignedMembers = teamMembers.filter(member => 
      newAssignees.includes(member.id)
    );

    setTasks(prev => prev.map(task => 
      task.id === taskId ? { 
        ...task, 
        assignees: assignedMembers,
        updatedAt: new Date()
      } : task
    ));

    const task = tasks.find(t => t.id === taskId);
    toast({
      title: "Task reassigned",
      description: `${task?.title} has been reassigned to ${assignedMembers.map(m => m.name).join(', ')}.`,
    });
  };

  const handleAddComment = (taskId: string) => {
    const content = newComment[taskId]?.trim();
    if (!content) return;

    const currentUser = teamMembers.find(m => m.id === currentUserId);
    if (!currentUser) return;

    const comment: TaskComment = {
      id: crypto.randomUUID(),
      taskId,
      authorId: currentUserId,
      authorName: currentUser.name,
      content,
      createdAt: new Date()
    };

    setTasks(prev => prev.map(task => 
      task.id === taskId ? { 
        ...task, 
        comments: [...task.comments, comment],
        updatedAt: new Date()
      } : task
    ));

    setNewComment(prev => ({ ...prev, [taskId]: '' }));
    toast({
      title: "Comment added",
      description: "Your comment has been added to the task.",
    });
  };

  const handleAddReply = (taskId: string, parentCommentId: string) => {
    const content = replyContent[parentCommentId]?.trim();
    if (!content) return;

    const currentUser = teamMembers.find(m => m.id === currentUserId);
    if (!currentUser) return;

    const reply: TaskComment = {
      id: crypto.randomUUID(),
      taskId,
      authorId: currentUserId,
      authorName: currentUser.name,
      content,
      createdAt: new Date()
    };

    setTasks(prev => prev.map(task => 
      task.id === taskId ? { 
        ...task, 
        comments: task.comments.map(comment => 
          comment.id === parentCommentId 
            ? { ...comment, replies: [...(comment.replies || []), reply] }
            : comment
        ),
        updatedAt: new Date()
      } : task
    ));

    setReplyContent(prev => ({ ...prev, [parentCommentId]: '' }));
    setReplyingTo(prev => ({ ...prev, [parentCommentId]: false }));
    toast({
      title: "Reply added",
      description: "Your reply has been added.",
    });
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const resetNewTask = () => {
    setNewTask({
      title: '',
      description: '',
      assignees: [],
      priority: 'medium',
      dueDate: '',
      tags: '',
      progress: 0
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

  const isOverdue = (dueDate: Date) => {
    return dueDate < new Date() && !tasks.find(t => t.dueDate === dueDate)?.status.includes('completed');
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <>
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5" />
            Shared Task Board
          </CardTitle>
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
              <p>No tasks yet. Create your first shared task!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="p-4 rounded-lg bg-black/20 border border-white/10 hover:bg-black/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => handleStatusChange(task.id, 
                        task.status === 'completed' ? 'todo' : 
                        task.status === 'todo' ? 'in-progress' : 'completed'
                      )}
                      className="hover:opacity-80 transition-opacity"
                    >
                      {getStatusIcon(task.status)}
                    </button>
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{task.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Users className="h-3 w-3" />
                        <span>Assigned to: {task.assignees.map(a => a.name).join(', ')}</span>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span className={isOverdue(task.dueDate) ? 'text-red-400' : ''}>
                          Due: {task.dueDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('-', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-black/90 border-white/10">
                        <DropdownMenuItem 
                          onClick={() => {
                            setEditingTask(task);
                            setNewTask({
                              title: task.title,
                              description: task.description,
                              assignees: task.assignees.map(a => a.id),
                              priority: task.priority,
                              dueDate: task.dueDate.toISOString().split('T')[0],
                              tags: task.tags.join(', '),
                              progress: task.progress
                            });
                            setIsAddTaskOpen(true);
                          }}
                          className="text-white hover:bg-white/10"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {task.description && (
                  <p className="text-sm text-gray-300 mb-3">{task.description}</p>
                )}

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {task.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-gray-800/50 border-gray-600 text-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Comments Section */}
                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      {task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTaskExpansion(task.id)}
                      className="text-gray-400 hover:text-white h-6 px-2"
                    >
                      {expandedTasks.has(task.id) ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  {expandedTasks.has(task.id) && (
                    <div className="space-y-3">
                      {/* Comments List */}
                      {task.comments.map((comment) => (
                        <div key={comment.id} className="bg-black/30 rounded-lg p-3">
                          <div className="flex items-start gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {comment.authorName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white">{comment.authorName}</span>
                                <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
                              </div>
                              <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyingTo(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                              className="text-gray-400 hover:text-white h-6 px-2"
                            >
                              <Reply className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-8 space-y-2">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="bg-black/20 rounded p-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Avatar className="h-4 w-4">
                                      <AvatarFallback className="text-xs">
                                        {reply.authorName.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-medium text-white">{reply.authorName}</span>
                                    <span className="text-xs text-gray-400">{formatTimeAgo(reply.createdAt)}</span>
                                  </div>
                                  <p className="text-xs text-gray-300">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Input */}
                          {replyingTo[comment.id] && (
                            <div className="ml-8 mt-2">
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Write a reply..."
                                  value={replyContent[comment.id] || ''}
                                  onChange={(e) => setReplyContent(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                  className="bg-black/20 border-white/10 text-white text-sm h-8"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleAddReply(task.id, comment.id)}
                                  className="bg-blue-600 hover:bg-blue-700 h-8 px-3"
                                >
                                  <Send className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add Comment Input */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a comment..."
                          value={newComment[task.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [task.id]: e.target.value }))}
                          className="bg-black/20 border-white/10 text-white"
                        />
                        <Button
                          onClick={() => handleAddComment(task.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Task Modal */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[700px] bg-black/90 border-white/10 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingTask ? 'Edit Task' : 'Add New Shared Task'}
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
                <Label htmlFor="assignees" className="text-white">Assign to *</Label>
                <Select 
                  value={newTask.assignees[0] || ''} 
                  onValueChange={(value) => {
                    if (value && !newTask.assignees.includes(value)) {
                      setNewTask(prev => ({ ...prev, assignees: [...prev.assignees, value] }));
                    }
                  }}
                >
                  <SelectTrigger className="bg-black/20 border-white/10 text-white">
                    <SelectValue placeholder="Select team members" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/10">
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id} className="text-white hover:bg-white/10">
                        {member.name} ({member.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {newTask.assignees.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newTask.assignees.map(assigneeId => {
                      const member = teamMembers.find(m => m.id === assigneeId);
                      return member ? (
                        <Badge key={assigneeId} variant="outline" className="text-xs">
                          {member.name}
                          <button
                            onClick={() => setNewTask(prev => ({ 
                              ...prev, 
                              assignees: prev.assignees.filter(id => id !== assigneeId) 
                            }))}
                            className="ml-1 hover:text-red-400"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
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
                <Label htmlFor="progress" className="text-white">Initial Progress (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={newTask.progress}
                  onChange={(e) => setNewTask(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                  className="bg-black/20 border-white/10 text-white"
                />
              </div>
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

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddTaskOpen(false);
              setEditingTask(null);
              resetNewTask();
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

export default SharedTaskBoard;
