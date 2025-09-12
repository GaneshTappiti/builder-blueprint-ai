"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  UserPlus, 
  CheckCircle, 
  X, 
  Clock, 
  Users,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TeamInvitationService from "@/services/teamInvitationService";
import { TeamInvitation } from "@/types/teamManagement";

interface TeamInvitationNotificationProps {
  userId: string;
  onInvitationProcessed: () => void;
}

const TeamInvitationNotification: React.FC<TeamInvitationNotificationProps> = ({
  userId,
  onInvitationProcessed
}) => {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadInvitations();
  }, [userId]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const pendingInvitations = await TeamInvitationService.getPendingInvitations(userId);
      setInvitations(pendingInvitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast({
        title: "Error",
        description: "Failed to load invitations. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId: string) => {
    setProcessing(invitationId);
    
    try {
      const result = await TeamInvitationService.acceptInvitation(invitationId, userId);
      
      if (result.success) {
        toast({
          title: "Welcome to the team!",
          description: "You have successfully joined the team.",
        });
        
        // Remove the invitation from the list
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        onInvitationProcessed();
      } else {
        toast({
          title: "Failed to join team",
          description: result.error || "Unable to join the team. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (invitationId: string) => {
    setProcessing(invitationId);
    
    try {
      const result = await TeamInvitationService.declineInvitation(invitationId, userId);
      
      if (result.success) {
        toast({
          title: "Invitation declined",
          description: "You have declined the team invitation.",
        });
        
        // Remove the invitation from the list
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        onInvitationProcessed();
      } else {
        toast({
          title: "Failed to decline invitation",
          description: result.error || "Unable to decline the invitation. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <Card className="workspace-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-green-400" />
            <span className="ml-2 text-gray-400">Loading invitations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card className="workspace-card">
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Pending Invitations</h3>
          <p className="text-gray-400">
            You don't have any pending team invitations at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="workspace-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <UserPlus className="h-5 w-5 text-green-400" />
            Team Invitations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className={`p-4 rounded-lg border ${
                isExpired(invitation.expiresAt)
                  ? 'border-red-500/30 bg-red-500/5'
                  : 'border-white/10 bg-black/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-green-600 text-white">
                        {invitation.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-white">
                        You've been invited to join a team
                      </h4>
                      <p className="text-sm text-gray-400">
                        Invited by {invitation.invitedBy} • {formatDate(invitation.invitedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="ml-13 space-y-2">
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Role:</span>
                        <Badge variant="outline" className="ml-1 text-green-400 border-green-500/30">
                          {invitation.role}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-400">Department:</span>
                        <Badge variant="outline" className="ml-1 text-blue-400 border-blue-500/30">
                          {invitation.department}
                        </Badge>
                      </div>
                    </div>

                    {invitation.message && (
                      <div className="mt-2 p-3 bg-black/30 rounded border border-white/5">
                        <p className="text-sm text-gray-300 italic">
                          "{invitation.message}"
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        {isExpired(invitation.expiresAt)
                          ? 'Expired'
                          : `Expires ${formatDate(invitation.expiresAt)}`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {isExpired(invitation.expiresAt) ? (
                    <Badge variant="outline" className="text-red-400 border-red-500/30">
                      Expired
                    </Badge>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(invitation.id)}
                        disabled={processing === invitation.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processing === invitation.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        <span className="ml-1">Accept</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDecline(invitation.id)}
                        disabled={processing === invitation.id}
                        className="border-red-500/30 text-red-400 hover:bg-red-600/10"
                      >
                        <X className="h-3 w-3" />
                        <span className="ml-1">Decline</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamInvitationNotification;
