"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  ScreenShare, 
  Settings,
  Users,
  Signal,
  Wifi,
  Volume2,
  VolumeX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JitsiVideoCallProps {
  roomName: string;
  displayName: string;
  isActive: boolean;
  onEndCall: () => void;
  onMuteToggle: (muted: boolean) => void;
  onVideoToggle: (videoOff: boolean) => void;
  onScreenShareToggle: (sharing: boolean) => void;
  className?: string;
}

interface CallQuality {
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  audioLevel: number;
  videoResolution: string;
  bandwidth: number;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function JitsiVideoCall({
  roomName,
  displayName,
  isActive,
  onEndCall,
  onMuteToggle,
  onVideoToggle,
  onScreenShareToggle,
  className
}: JitsiVideoCallProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const { toast } = useToast();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [callQuality, setCallQuality] = useState<CallQuality>({
    connectionQuality: 'excellent',
    audioLevel: 0,
    videoResolution: '720p',
    bandwidth: 0
  });

  // Load Jitsi Meet API
  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Initialize Jitsi Meet when component becomes active
  useEffect(() => {
    if (isActive && window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
      const domain = 'meet.jit.si';
      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: displayName,
        },
        configOverwrite: {
          startWithAudioMuted: isMuted,
          startWithVideoMuted: isVideoOff,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_POWERED_BY: false,
        }
      };

      try {
        apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
        
        // Event listeners
        apiRef.current.addEventListeners({
          videoConferenceJoined: () => {
            toast({
              title: "Joined video call",
              description: `Connected to room: ${roomName}`,
            });
          },
          videoConferenceLeft: () => {
            onEndCall();
          },
          participantJoined: (participant: any) => {
            setParticipantCount(prev => prev + 1);
            toast({
              title: "Participant joined",
              description: participant.displayName || "Unknown user",
            });
          },
          participantLeft: (participant: any) => {
            setParticipantCount(prev => Math.max(1, prev - 1));
          },
          audioMuteStatusChanged: (audio: any) => {
            setIsMuted(audio.muted);
            onMuteToggle(audio.muted);
          },
          videoMuteStatusChanged: (video: any) => {
            setIsVideoOff(video.muted);
            onVideoToggle(video.muted);
          },
          screenShareToggled: (event: any) => {
            setIsScreenSharing(event.isSharing);
            onScreenShareToggle(event.isSharing);
          },
          connectionQualityChanged: (quality: any) => {
            setCallQuality(prev => ({
              ...prev,
              connectionQuality: quality.connectionQuality || 'excellent'
            }));
          }
        });

        // Monitor call quality with simplified approach
        const qualityInterval = setInterval(() => {
          if (apiRef.current) {
            setCallQuality(prev => ({
              ...prev,
              audioLevel: Math.random() * 100, // Mock audio level for demonstration
              bandwidth: Math.floor(Math.random() * 1000) + 500 // Mock bandwidth
            }));
          }
        }, 5000);

        return () => {
          clearInterval(qualityInterval);
          if (apiRef.current) {
            apiRef.current.dispose();
            apiRef.current = null;
          }
        };
      } catch (error) {
        console.error('Failed to initialize Jitsi Meet:', error);
        toast({
          title: "Connection Error",
          description: "Failed to start video call. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [isActive, roomName, displayName, isMuted, isVideoOff]);

  const handleMuteToggle = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleAudio');
    }
  };

  const handleVideoToggle = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleVideo');
    }
  };

  const handleScreenShare = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleShareScreen');
    }
  };

  const handleEndCall = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup');
    }
    onEndCall();
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-yellow-400';
      case 'fair': return 'text-orange-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <Signal className="h-4 w-4 text-green-400" />;
      case 'good': return <Wifi className="h-4 w-4 text-yellow-400" />;
      case 'fair': return <Wifi className="h-4 w-4 text-orange-400" />;
      case 'poor': return <Wifi className="h-4 w-4 text-red-400" />;
      default: return <Wifi className="h-4 w-4 text-gray-400" />;
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <Card className={`bg-gray-900 border-gray-700 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Call - {roomName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-900 text-green-300">
              <Users className="h-3 w-3 mr-1" />
              {participantCount}
            </Badge>
            <Badge variant="outline" className={getQualityColor(callQuality.connectionQuality)}>
              {getQualityIcon(callQuality.connectionQuality)}
              <span className="ml-1 capitalize">{callQuality.connectionQuality}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Video Container */}
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '400px' }}>
          <div 
            ref={jitsiContainerRef} 
            className="w-full h-full"
            style={{ minHeight: '400px' }}
          />
        </div>

        {/* Call Quality Indicators */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Audio Level</span>
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <Progress 
                value={callQuality.audioLevel} 
                className="w-20 h-2" 
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Bandwidth</span>
            <span className="text-white">{callQuality.bandwidth} kbps</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={handleMuteToggle}
            variant={isMuted ? "destructive" : "outline"}
            size="lg"
            className="rounded-full w-12 h-12"
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          
          <Button
            onClick={handleVideoToggle}
            variant={isVideoOff ? "destructive" : "outline"}
            size="lg"
            className="rounded-full w-12 h-12"
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>
          
          <Button
            onClick={handleScreenShare}
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            className="rounded-full w-12 h-12"
          >
            <ScreenShare className="h-5 w-5" />
          </Button>
          
          <Button
            onClick={handleEndCall}
            variant="destructive"
            size="lg"
            className="rounded-full w-12 h-12"
          >
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
