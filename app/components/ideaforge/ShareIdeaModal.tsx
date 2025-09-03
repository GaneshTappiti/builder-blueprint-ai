"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Share2, 
  Copy, 
  Mail, 
  MessageSquare, 
  Users, 
  Link, 
  Eye, 
  Lock, 
  Globe,
  CheckCircle,
  Calendar,
  Clock,
  User,
  Settings
} from 'lucide-react';
import { StoredIdea } from '@/types/ideaforge';
import { useToast } from '@/hooks/use-toast';

interface ShareIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: StoredIdea;
}

interface ShareSettings {
  visibility: 'private' | 'public' | 'team';
  allowComments: boolean;
  allowFeedback: boolean;
  allowExport: boolean;
  expiresAt?: string;
}

const ShareIdeaModal: React.FC<ShareIdeaModalProps> = ({
  isOpen,
  onClose,
  idea
}) => {
  const [activeTab, setActiveTab] = useState('link');
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    visibility: 'private',
    allowComments: true,
    allowFeedback: true,
    allowExport: false
  });
  const [shareUrl, setShareUrl] = useState('');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const { toast } = useToast();

  const generateShareLink = async () => {
    setIsGeneratingLink(true);
    
    // Simulate API call to generate shareable link
    setTimeout(() => {
      const baseUrl = window.location.origin;
      const ideaId = idea.id;
      const shareToken = Math.random().toString(36).substring(2, 15);
      const url = `${baseUrl}/shared/idea/${ideaId}?token=${shareToken}`;
      setShareUrl(url);
      setIsGeneratingLink(false);
      
      toast({
        title: "Share Link Generated",
        description: "Your idea is now shareable with the selected settings.",
      });
    }, 1000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const sendEmailInvite = () => {
    if (!emailRecipients.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter at least one email address.",
        variant: "destructive",
      });
      return;
    }

    // Simulate email sending
    toast({
      title: "Invitations Sent",
      description: `Invitations sent to ${emailRecipients.split(',').length} recipients.`,
    });

    setEmailRecipients('');
    setEmailMessage('');
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return <Lock className="h-4 w-4" />;
      case 'public':
        return <Globe className="h-4 w-4" />;
      case 'team':
        return <Users className="h-4 w-4" />;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return 'bg-gray-600/20 text-gray-400';
      case 'public':
        return 'bg-green-600/20 text-green-400';
      case 'team':
        return 'bg-blue-600/20 text-blue-400';
    }
  };

  const getOverallProgress = () => {
    const progress = idea.progress || { wiki: 0, blueprint: 0, feedback: 0 };
    return Math.round((progress.wiki + progress.blueprint + progress.feedback) / 3);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black/95 backdrop-blur-sm border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <Share2 className="h-6 w-6 text-green-400" />
            Share "{idea.title}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Idea Preview */}
          <div className="bg-black/20 p-4 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">{idea.title}</h3>
                <p className="text-gray-300 text-sm mb-2 line-clamp-2">{idea.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Progress: {getOverallProgress()}%</span>
                  <span>Created: {new Date(idea.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Badge className={getVisibilityColor(shareSettings.visibility)}>
                {getVisibilityIcon(shareSettings.visibility)}
                <span className="ml-1 capitalize">{shareSettings.visibility}</span>
              </Badge>
            </div>
          </div>

          {/* Share Options Tabs */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={activeTab === 'link' ? 'default' : 'outline'}
              onClick={() => setActiveTab('link')}
              className={activeTab === 'link' ? 'bg-green-600' : 'border-gray-600 text-gray-300'}
            >
              <Link className="h-4 w-4 mr-2" />
              Share Link
            </Button>
            <Button
              variant={activeTab === 'email' ? 'default' : 'outline'}
              onClick={() => setActiveTab('email')}
              className={activeTab === 'email' ? 'bg-green-600' : 'border-gray-600 text-gray-300'}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Invite
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'outline'}
              onClick={() => setActiveTab('settings')}
              className={activeTab === 'settings' ? 'bg-green-600' : 'border-gray-600 text-gray-300'}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Share Link Tab */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Shareable Link</h4>
                {shareUrl ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={shareUrl}
                        readOnly
                        className="bg-black/20 border-white/10 text-white"
                      />
                      <Button
                        onClick={() => copyToClipboard(shareUrl)}
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(shareUrl)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(shareUrl, '_blank')}
                        className="border-gray-600 text-gray-300"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-white font-medium mb-2">Generate Share Link</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Create a shareable link with your current privacy settings.
                    </p>
                    <Button
                      onClick={generateShareLink}
                      disabled={isGeneratingLink}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isGeneratingLink ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Link className="h-4 w-4 mr-2" />
                          Generate Link
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Email Invite Tab */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Send Email Invitations</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Recipients</label>
                    <Input
                      value={emailRecipients}
                      onChange={(e) => setEmailRecipients(e.target.value)}
                      placeholder="Enter email addresses separated by commas"
                      className="bg-black/20 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Message (Optional)</label>
                    <Textarea
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      placeholder="Add a personal message..."
                      rows={3}
                      className="bg-black/20 border-white/10 text-white"
                    />
                  </div>
                  <Button
                    onClick={sendEmailInvite}
                    className="bg-green-600 hover:bg-green-700 w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitations
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-3">Privacy & Permissions</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Visibility</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['private', 'team', 'public'] as const).map((visibility) => (
                        <Button
                          key={visibility}
                          variant={shareSettings.visibility === visibility ? 'default' : 'outline'}
                          onClick={() => setShareSettings(prev => ({ ...prev, visibility }))}
                          className={shareSettings.visibility === visibility ? 'bg-green-600' : 'border-gray-600 text-gray-300'}
                        >
                          {getVisibilityIcon(visibility)}
                          <span className="ml-2 capitalize">{visibility}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                        <span className="text-white text-sm">Allow Comments</span>
                      </div>
                      <Button
                        variant={shareSettings.allowComments ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShareSettings(prev => ({ ...prev, allowComments: !prev.allowComments }))}
                        className={shareSettings.allowComments ? 'bg-green-600' : 'border-gray-600 text-gray-300'}
                      >
                        {shareSettings.allowComments ? 'Yes' : 'No'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-white text-sm">Allow Feedback</span>
                      </div>
                      <Button
                        variant={shareSettings.allowFeedback ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShareSettings(prev => ({ ...prev, allowFeedback: !prev.allowFeedback }))}
                        className={shareSettings.allowFeedback ? 'bg-green-600' : 'border-gray-600 text-gray-300'}
                      >
                        {shareSettings.allowFeedback ? 'Yes' : 'No'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-gray-400" />
                        <span className="text-white text-sm">Allow Export</span>
                      </div>
                      <Button
                        variant={shareSettings.allowExport ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShareSettings(prev => ({ ...prev, allowExport: !prev.allowExport }))}
                        className={shareSettings.allowExport ? 'bg-green-600' : 'border-gray-600 text-gray-300'}
                      >
                        {shareSettings.allowExport ? 'Yes' : 'No'}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Link Expiration (Optional)</label>
                    <Input
                      type="date"
                      value={shareSettings.expiresAt || ''}
                      onChange={(e) => setShareSettings(prev => ({ ...prev, expiresAt: e.target.value }))}
                      className="bg-black/20 border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300"
            >
              Close
            </Button>
            {shareUrl && (
              <Button
                onClick={() => copyToClipboard(shareUrl)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareIdeaModal;