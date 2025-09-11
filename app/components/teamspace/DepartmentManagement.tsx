"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Users,
  Palette,
  Settings
} from "lucide-react";
import { useTeamManagement } from '@/contexts/TeamManagementContext';
import { useTeamPermissions } from '@/hooks/useTeamPermissions';
import { Department } from '@/types/teamManagement';
import { useToast } from '@/hooks/use-toast';

interface DepartmentManagementProps {
  className?: string;
}

const DepartmentManagement: React.FC<DepartmentManagementProps> = ({ className }) => {
  const { 
    departments, 
    teamMembers,
    createDepartment, 
    updateDepartment, 
    deleteDepartment,
    loading 
  } = useTeamManagement();
  
  const { canManageDepartments } = useTeamPermissions();
  const { toast } = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'memberCount' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: 'Building'
  });

  // Color options
  const colorOptions = [
    { value: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Blue', color: 'bg-blue-500' },
    { value: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Green', color: 'bg-green-500' },
    { value: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Purple', color: 'bg-purple-500' },
    { value: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Orange', color: 'bg-orange-500' },
    { value: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Yellow', color: 'bg-yellow-500' },
    { value: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Red', color: 'bg-red-500' },
    { value: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', label: 'Indigo', color: 'bg-indigo-500' },
    { value: 'bg-pink-500/20 text-pink-400 border-pink-500/30', label: 'Pink', color: 'bg-pink-500' },
    { value: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'Gray', color: 'bg-gray-500' }
  ];

  // Icon options
  const iconOptions = [
    { value: 'Building', label: 'Building' },
    { value: 'Code', label: 'Code' },
    { value: 'Palette', label: 'Palette' },
    { value: 'Megaphone', label: 'Megaphone' },
    { value: 'Target', label: 'Target' },
    { value: 'TrendingUp', label: 'Trending Up' },
    { value: 'Settings', label: 'Settings' },
    { value: 'Users', label: 'Users' },
    { value: 'Shield', label: 'Shield' },
    { value: 'Zap', label: 'Zap' }
  ];

  // Filter and sort departments
  const filteredDepartments = useMemo(() => {
    let filtered = departments.filter(dept => 
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort departments
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'memberCount':
          aValue = a.memberCount;
          bValue = b.memberCount;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [departments, searchTerm, sortBy, sortOrder]);

  // Get department members
  const getDepartmentMembers = (departmentId: string) => {
    return teamMembers.filter(member => member.department.id === departmentId);
  };

  // Handle create department
  const handleCreateDepartment = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    await createDepartment({
      name: formData.name,
      description: formData.description,
      color: formData.color,
      icon: formData.icon,
      isActive: true
    });

    // Reset form
    setFormData({
      name: '',
      description: '',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      icon: 'Building'
    });
    setIsCreateOpen(false);
  };

  // Handle edit department
  const handleEditDepartment = async () => {
    if (!selectedDepartment) return;

    await updateDepartment(selectedDepartment.id, {
      name: formData.name,
      description: formData.description,
      color: formData.color,
      icon: formData.icon
    });

    setIsEditOpen(false);
    setSelectedDepartment(null);
  };

  // Handle delete department
  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return;

    await deleteDepartment(selectedDepartment.id);
    setIsDeleteOpen(false);
    setSelectedDepartment(null);
  };

  // Open edit modal
  const openEditModal = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description,
      color: department.color,
      icon: department.icon
    });
    setIsEditOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      icon: 'Building'
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Departments</h2>
          <p className="text-gray-400">Organize your team by departments and responsibilities</p>
        </div>
        {canManageDepartments && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Department
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{departments.length}</p>
                <p className="text-sm text-gray-400">Total Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {departments.reduce((sum, dept) => sum + dept.memberCount, 0)}
                </p>
                <p className="text-sm text-gray-400">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {departments.filter(d => d.isActive).length}
                </p>
                <p className="text-sm text-gray-400">Active Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-black/20 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/20 border-white/10 text-white"
                />
              </div>
            </div>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-48 bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10">
                <SelectItem value="name" className="text-white hover:bg-white/10">Name</SelectItem>
                <SelectItem value="memberCount" className="text-white hover:bg-white/10">Member Count</SelectItem>
                <SelectItem value="createdAt" className="text-white hover:bg-white/10">Created Date</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
              <SelectTrigger className="w-full md:w-32 bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10">
                <SelectItem value="asc" className="text-white hover:bg-white/10">Ascending</SelectItem>
                <SelectItem value="desc" className="text-white hover:bg-white/10">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => {
          const members = getDepartmentMembers(department.id);

          return (
            <Card key={department.id} className="bg-black/20 border-white/10 hover:bg-black/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${department.color}`}>
                      <Building className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{department.name}</CardTitle>
                      <p className="text-sm text-gray-400">{department.description}</p>
                    </div>
                  </div>
                  
                  {canManageDepartments && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-black/90 border-white/10">
                        <DropdownMenuItem 
                          onClick={() => openEditModal(department)}
                          className="text-white hover:bg-white/10"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Department
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => openDeleteModal(department)}
                          className="text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Department
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Member Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Members</span>
                  </div>
                  <Badge className={department.color}>
                    {department.memberCount} member{department.memberCount !== 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Member List */}
                {members.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Team Members</p>
                    <div className="space-y-1">
                      {members.slice(0, 3).map((member) => (
                        <div key={member.id} className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-white">{member.name}</span>
                          <Badge className="text-xs bg-gray-500/20 text-gray-400 border-gray-500/30">
                            {member.role.displayName}
                          </Badge>
                        </div>
                      ))}
                      {members.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{members.length - 3} more member{members.length - 3 !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Status</span>
                  <Badge 
                    className={department.isActive 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }
                  >
                    {department.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Department Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px] bg-black/90 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5 text-green-400" />
              Create Department
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Department Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-black/20 border-white/10 text-white"
                placeholder="Enter department name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-black/20 border-white/10 text-white"
                placeholder="Describe the department's responsibilities"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color" className="text-white">Color Theme</Label>
              <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10">
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon" className="text-white">Icon</Label>
              <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10">
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDepartment} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px] bg-black/90 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Edit className="h-5 w-5 text-blue-400" />
              Edit Department
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-white">Department Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-black/20 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-white">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-black/20 border-white/10 text-white"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-color" className="text-white">Color Theme</Label>
              <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10">
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-icon" className="text-white">Icon</Label>
              <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10">
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDepartment} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Update Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Department Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] bg-black/90 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Trash2 className="h-5 w-5 text-red-400" />
              Delete Department
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-300">
              Are you sure you want to delete <strong>{selectedDepartment?.name}</strong> department?
            </p>
            <p className="text-sm text-gray-400">
              All members in this department will be moved to the default department. 
              This action cannot be undone.
            </p>
            {selectedDepartment && selectedDepartment.memberCount > 0 && (
              <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  <strong>Warning:</strong> This department has {selectedDepartment.memberCount} member{selectedDepartment.memberCount !== 1 ? 's' : ''} who will be reassigned.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteDepartment} 
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentManagement;
