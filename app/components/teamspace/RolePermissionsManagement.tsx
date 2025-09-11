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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Users,
  Crown,
  User,
  Eye,
  Settings,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useTeamManagement } from '@/contexts/TeamManagementContext';
import { useTeamPermissions } from '@/hooks/useTeamPermissions';
import { TeamRole, Permission, PermissionCategory, SYSTEM_PERMISSIONS } from '@/types/teamManagement';
import { useToast } from '@/hooks/use-toast';

interface RolePermissionsManagementProps {
  className?: string;
}

const RolePermissionsManagement: React.FC<RolePermissionsManagementProps> = ({ className }) => {
  const { 
    roles, 
    teamMembers,
    createRole, 
    updateRole, 
    deleteRole,
    loading 
  } = useTeamManagement();
  
  const { canManageMembers } = useTeamPermissions();
  const { toast } = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<TeamRole | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'memberCount' | 'order'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    permissions: [] as string[],
    isSystemRole: false,
    canBeAssigned: true,
    order: 0
  });

  // Color options
  const colorOptions = [
    { value: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Red', color: 'bg-red-500' },
    { value: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Blue', color: 'bg-blue-500' },
    { value: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Green', color: 'bg-green-500' },
    { value: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Purple', color: 'bg-purple-500' },
    { value: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Orange', color: 'bg-orange-500' },
    { value: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Yellow', color: 'bg-yellow-500' },
    { value: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', label: 'Indigo', color: 'bg-indigo-500' },
    { value: 'bg-pink-500/20 text-pink-400 border-pink-500/30', label: 'Pink', color: 'bg-pink-500' },
    { value: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'Gray', color: 'bg-gray-500' }
  ];

  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    const grouped: Record<PermissionCategory, Permission[]> = {
      team_management: [],
      task_management: [],
      meeting_management: [],
      message_management: [],
      project_management: [],
      settings_management: [],
      analytics_management: []
    };

    SYSTEM_PERMISSIONS.forEach(permission => {
      if (grouped[permission.category]) {
        grouped[permission.category].push(permission);
      }
    });

    return grouped;
  }, []);

  // Filter and sort roles
  const filteredRoles = useMemo(() => {
    let filtered = roles.filter(role => 
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort roles
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'memberCount':
          aValue = teamMembers.filter(m => m.role.id === a.id).length;
          bValue = teamMembers.filter(m => m.role.id === b.id).length;
          break;
        case 'order':
          aValue = a.order;
          bValue = b.order;
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
  }, [roles, teamMembers, searchTerm, sortBy, sortOrder]);

  // Get role members count
  const getRoleMembersCount = (roleId: string) => {
    return teamMembers.filter(member => member.role.id === roleId).length;
  };

  // Get role icon
  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'Admin': return <Crown className="h-5 w-5" />;
      case 'Member': return <User className="h-5 w-5" />;
      case 'Viewer': return <Eye className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  // Handle create role
  const handleCreateRole = async () => {
    if (!formData.name || !formData.displayName || !formData.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const selectedPermissions = SYSTEM_PERMISSIONS.filter(p => formData.permissions.includes(p.id));

    await createRole({
      name: formData.name as 'Admin' | 'Member' | 'Viewer',
      displayName: formData.displayName,
      description: formData.description,
      color: formData.color,
      permissions: selectedPermissions,
      isSystemRole: formData.isSystemRole,
      canBeAssigned: formData.canBeAssigned,
      order: formData.order
    });

    // Reset form
    setFormData({
      name: '',
      displayName: '',
      description: '',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      permissions: [],
      isSystemRole: false,
      canBeAssigned: true,
      order: 0
    });
    setIsCreateOpen(false);
  };

  // Handle edit role
  const handleEditRole = async () => {
    if (!selectedRole) return;

    const selectedPermissions = SYSTEM_PERMISSIONS.filter(p => formData.permissions.includes(p.id));

    await updateRole(selectedRole.id, {
      name: formData.name as 'Admin' | 'Member' | 'Viewer',
      displayName: formData.displayName,
      description: formData.description,
      color: formData.color,
      permissions: selectedPermissions,
      isSystemRole: formData.isSystemRole,
      canBeAssigned: formData.canBeAssigned,
      order: formData.order
    });

    setIsEditOpen(false);
    setSelectedRole(null);
  };

  // Handle delete role
  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    await deleteRole(selectedRole.id);
    setIsDeleteOpen(false);
    setSelectedRole(null);
  };

  // Open edit modal
  const openEditModal = (role: TeamRole) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      color: role.color,
      permissions: role.permissions.map(p => p.id),
      isSystemRole: role.isSystemRole,
      canBeAssigned: role.canBeAssigned,
      order: role.order
    });
    setIsEditOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (role: TeamRole) => {
    setSelectedRole(role);
    setIsDeleteOpen(true);
  };

  // Toggle permission
  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  // Select all permissions in category
  const selectAllInCategory = (category: PermissionCategory) => {
    const categoryPermissions = permissionsByCategory[category].map(p => p.id);
    setFormData(prev => ({
      ...prev,
      permissions: Array.from(new Set([...prev.permissions, ...categoryPermissions]))
    }));
  };

  // Deselect all permissions in category
  const deselectAllInCategory = (category: PermissionCategory) => {
    const categoryPermissions = permissionsByCategory[category].map(p => p.id);
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.filter(id => !categoryPermissions.includes(id))
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      permissions: [],
      isSystemRole: false,
      canBeAssigned: true,
      order: 0
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Roles & Permissions</h2>
          <p className="text-gray-400">Manage team roles and their permissions</p>
        </div>
        {canManageMembers && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{roles.length}</p>
                <p className="text-sm text-gray-400">Total Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {getRoleMembersCount('admin')}
                </p>
                <p className="text-sm text-gray-400">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {getRoleMembersCount('member')}
                </p>
                <p className="text-sm text-gray-400">Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {getRoleMembersCount('viewer')}
                </p>
                <p className="text-sm text-gray-400">Viewers</p>
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
                  placeholder="Search roles..."
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
                <SelectItem value="order" className="text-white hover:bg-white/10">Order</SelectItem>
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

      {/* Roles List */}
      <div className="space-y-4">
        {filteredRoles.map((role) => {
          const memberCount = getRoleMembersCount(role.id);

          return (
            <Card key={role.id} className="bg-black/20 border-white/10 hover:bg-black/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${role.color}`}>
                      {getRoleIcon(role.name)}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-lg">{role.displayName}</h3>
                        {role.isSystemRole && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-400">{role.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400">{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400">{role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={role.color}>
                      {role.name}
                    </Badge>
                    
                    {canManageMembers && !role.isSystemRole && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-black/90 border-white/10">
                          <DropdownMenuItem 
                            onClick={() => openEditModal(role)}
                            className="text-white hover:bg-white/10"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Role
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            onClick={() => openDeleteModal(role)}
                            className="text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Role
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {/* Permissions Preview */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400 mb-2">Permissions:</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.slice(0, 5).map((permission) => (
                      <Badge key={permission.id} variant="outline" className="text-xs border-white/20 text-gray-300">
                        {permission.name}
                      </Badge>
                    ))}
                    {role.permissions.length > 5 && (
                      <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                        +{role.permissions.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Role Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[700px] bg-black/90 border-white/10 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5 text-green-400" />
              Create Role
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Role Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-black/20 border-white/10 text-white"
                    placeholder="e.g., Moderator"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-white">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    className="bg-black/20 border-white/10 text-white"
                    placeholder="e.g., Team Moderator"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-black/20 border-white/10 text-white"
                  placeholder="Describe the role's responsibilities"
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

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canBeAssigned"
                    checked={formData.canBeAssigned}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, canBeAssigned: !!checked }))}
                  />
                  <Label htmlFor="canBeAssigned" className="text-white text-sm">
                    Can be assigned to members
                  </Label>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Permissions</h3>
              
              {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-white capitalize">
                      {category.replace('_', ' ')}
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => selectAllInCategory(category as PermissionCategory)}
                        className="text-xs border-white/10 hover:bg-white/5"
                      >
                        Select All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deselectAllInCategory(category as PermissionCategory)}
                        className="text-xs border-white/10 hover:bg-white/5"
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission.id}
                          checked={formData.permissions.includes(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                        />
                        <Label htmlFor={permission.id} className="text-white text-sm">
                          {permission.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[700px] bg-black/90 border-white/10 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Edit className="h-5 w-5 text-blue-400" />
              Edit Role
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-white">Role Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-displayName" className="text-white">Display Name *</Label>
                  <Input
                    id="edit-displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>
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

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-canBeAssigned"
                    checked={formData.canBeAssigned}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, canBeAssigned: !!checked }))}
                  />
                  <Label htmlFor="edit-canBeAssigned" className="text-white text-sm">
                    Can be assigned to members
                  </Label>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Permissions</h3>
              
              {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-white capitalize">
                      {category.replace('_', ' ')}
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => selectAllInCategory(category as PermissionCategory)}
                        className="text-xs border-white/10 hover:bg-white/5"
                      >
                        Select All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deselectAllInCategory(category as PermissionCategory)}
                        className="text-xs border-white/10 hover:bg-white/5"
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${permission.id}`}
                          checked={formData.permissions.includes(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                        />
                        <Label htmlFor={`edit-${permission.id}`} className="text-white text-sm">
                          {permission.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRole} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] bg-black/90 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Trash2 className="h-5 w-5 text-red-400" />
              Delete Role
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-300">
              Are you sure you want to delete <strong>{selectedRole?.displayName}</strong> role?
            </p>
            <p className="text-sm text-gray-400">
              All members with this role will be reassigned to the default role. 
              This action cannot be undone.
            </p>
            {selectedRole && getRoleMembersCount(selectedRole.id) > 0 && (
              <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  <strong>Warning:</strong> This role has {getRoleMembersCount(selectedRole.id)} member{getRoleMembersCount(selectedRole.id) !== 1 ? 's' : ''} who will be reassigned.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteRole} 
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolePermissionsManagement;
