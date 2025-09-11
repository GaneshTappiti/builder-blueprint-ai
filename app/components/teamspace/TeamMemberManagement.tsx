"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield, 
  Mail, 
  MessageSquare,
  Settings,
  Building,
  Crown,
  User,
  Eye
} from "lucide-react";
import { useTeamManagement } from '@/contexts/TeamManagementContext';
import { useTeamPermissions } from '@/hooks/useTeamPermissions';
import { TeamMember, TeamRole, Department } from '@/types/teamManagement';
import { useToast } from '@/hooks/use-toast';

interface TeamMemberManagementProps {
  className?: string;
}

const TeamMemberManagement: React.FC<TeamMemberManagementProps> = ({ className }) => {
  const { 
    teamMembers, 
    roles, 
    departments, 
    addMember, 
    updateMember, 
    removeMember, 
    updateMemberRole, 
    updateMemberDepartment,
    loading 
  } = useTeamManagement();
  
  const { 
    canManageMembers, 
    canInviteMembers, 
    canViewAnalytics,
    isAdmin 
  } = useTeamPermissions();
  
  const { toast } = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isDeleteMemberOpen, setIsDeleteMemberOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'department' | 'joinedAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form state for adding/editing members
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    skills: [] as string[],
    currentTask: ''
  });

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    let filtered = teamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || member.role.id === roleFilter;
      const matchesDepartment = departmentFilter === 'all' || member.department.id === departmentFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
    });

    // Sort members
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'role':
          aValue = a.role.displayName.toLowerCase();
          bValue = b.role.displayName.toLowerCase();
          break;
        case 'department':
          aValue = a.department.name.toLowerCase();
          bValue = b.department.name.toLowerCase();
          break;
        case 'joinedAt':
          aValue = new Date(a.joinedAt).getTime();
          bValue = new Date(b.joinedAt).getTime();
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
  }, [teamMembers, searchTerm, roleFilter, departmentFilter, statusFilter, sortBy, sortOrder]);

  // Get role icon
  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'Admin': return <Crown className="h-4 w-4" />;
      case 'Member': return <User className="h-4 w-4" />;
      case 'Viewer': return <Eye className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  // Handle add member
  const handleAddMember = async () => {
    if (!formData.name || !formData.email || !formData.role || !formData.department) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const role = roles.find(r => r.id === formData.role);
    const department = departments.find(d => d.id === formData.department);
    
    if (!role || !department) {
      toast({
        title: "Invalid selection",
        description: "Please select valid role and department.",
        variant: "destructive"
      });
      return;
    }

    await addMember({
      name: formData.name,
      email: formData.email,
      role,
      department,
      skills: formData.skills,
      currentTask: formData.currentTask || undefined
    });

    // Reset form
    setFormData({
      name: '',
      email: '',
      role: '',
      department: '',
      skills: [],
      currentTask: ''
    });
    setIsAddMemberOpen(false);
  };

  // Handle edit member
  const handleEditMember = async () => {
    if (!selectedMember) return;

    await updateMember(selectedMember.id, {
      name: formData.name,
      email: formData.email,
      skills: formData.skills,
      currentTask: formData.currentTask || undefined
    });

    setIsEditMemberOpen(false);
    setSelectedMember(null);
  };

  // Handle delete member
  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    await removeMember(selectedMember.id);
    setIsDeleteMemberOpen(false);
    setSelectedMember(null);
  };

  // Handle role change
  const handleRoleChange = async (memberId: string, newRoleId: string) => {
    await updateMemberRole(memberId, newRoleId);
  };

  // Handle department change
  const handleDepartmentChange = async (memberId: string, newDepartmentId: string) => {
    await updateMemberDepartment(memberId, newDepartmentId);
  };

  // Open edit modal
  const openEditModal = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role.id,
      department: member.department.id,
      skills: member.skills,
      currentTask: member.currentTask || ''
    });
    setIsEditMemberOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (member: TeamMember) => {
    setSelectedMember(member);
    setIsDeleteMemberOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      department: '',
      skills: [],
      currentTask: ''
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Team Members</h2>
          <p className="text-gray-400">Manage your team members, roles, and permissions</p>
        </div>
        {canInviteMembers && (
          <Button
            onClick={() => setIsAddMemberOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{teamMembers.length}</p>
                <p className="text-sm text-gray-400">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {teamMembers.filter(m => m.status === 'online').length}
                </p>
                <p className="text-sm text-gray-400">Online Now</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{departments.length}</p>
                <p className="text-sm text-gray-400">Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {teamMembers.filter(m => m.role.name === 'Admin').length}
                </p>
                <p className="text-sm text-gray-400">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-black/20 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/20 border-white/10 text-white"
                />
              </div>
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48 bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10">
                <SelectItem value="all" className="text-white hover:bg-white/10">All Roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id} className="text-white hover:bg-white/10">
                    {role.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-48 bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10">
                <SelectItem value="all" className="text-white hover:bg-white/10">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id} className="text-white hover:bg-white/10">
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10">
                <SelectItem value="all" className="text-white hover:bg-white/10">All Status</SelectItem>
                <SelectItem value="online" className="text-white hover:bg-white/10">Online</SelectItem>
                <SelectItem value="busy" className="text-white hover:bg-white/10">Busy</SelectItem>
                <SelectItem value="offline" className="text-white hover:bg-white/10">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <div className="space-y-4">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="bg-black/20 border-white/10 hover:bg-black/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-green-600 text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${getStatusColor(member.status)}`} />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{member.name}</h3>
                      {getRoleIcon(member.role.name)}
                    </div>
                    <p className="text-sm text-gray-400">{member.email}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={member.role.color}>
                        {member.role.displayName}
                      </Badge>
                      <Badge className={member.department.color}>
                        {member.department.name}
                      </Badge>
                      <Badge 
                        className={`text-xs ${
                          member.status === 'online' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : member.status === 'busy'
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}
                      >
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Quick Actions */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 hover:bg-white/5"
                    onClick={() => window.open(`mailto:${member.email}`, '_blank')}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 hover:bg-white/5"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>

                  {/* Management Actions */}
                  {canManageMembers && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-black/90 border-white/10">
                        <DropdownMenuItem 
                          onClick={() => openEditModal(member)}
                          className="text-white hover:bg-white/10"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Member
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => openDeleteModal(member)}
                          className="text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* Member Details */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Joined</p>
                    <p className="text-white">{new Date(member.joinedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Last Active</p>
                    <p className="text-white">{new Date(member.lastActive).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Tasks Progress</p>
                    <p className="text-white">
                      {member.tasksCompleted}/{member.totalTasks} 
                      ({member.totalTasks > 0 ? Math.round((member.tasksCompleted / member.totalTasks) * 100) : 0}%)
                    </p>
                  </div>
                </div>

                {/* Skills */}
                {member.skills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-gray-400 text-sm mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-white/20 text-gray-300">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Task */}
                {member.currentTask && (
                  <div className="mt-3">
                    <p className="text-gray-400 text-sm mb-1">Current Task</p>
                    <p className="text-white text-sm">{member.currentTask}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Member Modal */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-[500px] bg-black/90 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <UserPlus className="h-5 w-5 text-green-400" />
              Add Team Member
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-black/20 border-white/10 text-white"
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-black/20 border-white/10 text-white"
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-white">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10">
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id} className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role.name)}
                        {role.displayName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-white">Department *</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10">
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id} className="text-white hover:bg-white/10">
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentTask" className="text-white">Current Task</Label>
              <Input
                id="currentTask"
                value={formData.currentTask}
                onChange={(e) => setFormData(prev => ({ ...prev, currentTask: e.target.value }))}
                className="bg-black/20 border-white/10 text-white"
                placeholder="What are they working on?"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} className="bg-green-600 hover:bg-green-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={isEditMemberOpen} onOpenChange={setIsEditMemberOpen}>
        <DialogContent className="sm:max-w-[500px] bg-black/90 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Edit className="h-5 w-5 text-blue-400" />
              Edit Team Member
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-white">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-black/20 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-white">Email Address *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-black/20 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-white">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10">
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id} className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role.name)}
                        {role.displayName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-department" className="text-white">Department *</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10">
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id} className="text-white hover:bg-white/10">
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-currentTask" className="text-white">Current Task</Label>
              <Input
                id="edit-currentTask"
                value={formData.currentTask}
                onChange={(e) => setFormData(prev => ({ ...prev, currentTask: e.target.value }))}
                className="bg-black/20 border-white/10 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMemberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditMember} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Update Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Member Modal */}
      <Dialog open={isDeleteMemberOpen} onOpenChange={setIsDeleteMemberOpen}>
        <DialogContent className="sm:max-w-[400px] bg-black/90 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Trash2 className="h-5 w-5 text-red-400" />
              Remove Team Member
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-300">
              Are you sure you want to remove <strong>{selectedMember?.name}</strong> from the team? 
              This action cannot be undone.
            </p>
            <p className="text-sm text-gray-400">
              They will lose access to all team resources and data.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteMemberOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteMember} 
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamMemberManagement;
