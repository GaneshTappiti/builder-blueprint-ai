"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TeamInvitationService from "@/services/teamInvitationService";

interface TeamInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  inviterId: string;
  inviterName: string;
  onInvitationSent: () => void;
}

const TeamInvitationModal: React.FC<TeamInvitationModalProps> = ({
  isOpen,
  onClose,
  teamId,
  inviterId,
  inviterName,
  onInvitationSent
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    department: '',
    message: ''
  });

  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'UI/UX Designer',
    'Product Manager',
    'Marketing Manager',
    'Sales Representative',
    'Data Analyst',
    'DevOps Engineer',
    'QA Engineer',
    'Project Manager',
    'Business Analyst'
  ];

  const departments = [
    'Engineering',
    'Design',
    'Product',
    'Marketing',
    'Sales',
    'Operations',
    'Finance',
    'HR',
    'Customer Success',
    'Business Development'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.role || !formData.department) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await TeamInvitationService.sendInvitation(
        {
          teamId,
          inviteeEmail: formData.email,
          role: formData.role,
          department: formData.department,
          message: formData.message || undefined
        },
        inviterId,
        inviterName
      );

      if (result.success) {
        toast({
          title: "Invitation Sent!",
          description: `Invitation has been sent to ${formData.email}. They will receive a notification to accept or decline.`,
        });
        
        onInvitationSent();
        handleClose();
      } else {
        toast({
          title: "Invitation Failed",
          description: result.error || "Failed to send invitation. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      role: '',
      department: '',
      message: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-black/90 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserPlus className="h-5 w-5 text-green-400" />
            Invite Team Member
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="bg-black/20 border-white/10 text-white"
              placeholder="Enter team member's email address"
              required
            />
            <p className="text-xs text-gray-400">
              The person must be registered on the platform to receive the invitation.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-white">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              required
            >
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role} className="text-white">
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-white">Department *</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
              required
            >
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept} className="text-white">
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-white">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="bg-black/20 border-white/10 text-white min-h-[100px]"
              placeholder="Add a personal message to your invitation..."
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeamInvitationModal;
