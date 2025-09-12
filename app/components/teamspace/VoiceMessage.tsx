"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Trash2, 
  Send,
  Volume2,
  VolumeX,
  Clock,
  Waveform
} from "lucide-react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { cn } from "@/lib/utils";

interface VoiceMessageProps {
  onSend: (audioBlob: Blob) => void;
  onCancel: () => void;
  maxDuration?: number; // in seconds
  className?: string;
}

interface VoiceMessagePlayerProps {
  audioUrl: string;
  duration: number;
  senderName?: string;
  timestamp?: string;
  className?: string;
}

export function VoiceMessage({ 
  onSend, 
  onCancel, 
  maxDuration = 300, // 5 minutes max
  className 
}: VoiceMessageProps) {
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    playRecording,
    stopPlayback,
    formatDuration
  } = useVoiceRecording();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  // Auto-stop recording at max duration
  useEffect(() => {
    if (isRecording && duration >= maxDuration) {
      stopRecording();
    }
  }, [isRecording, duration, maxDuration, stopRecording]);

  // Handle playback state
  useEffect(() => {
    const audio = document.querySelector('audio');
    if (audio) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => {
        setIsPlaying(false);
        setPlaybackProgress(0);
      };
      const handleTimeUpdate = () => {
        if (audio.duration) {
          setPlaybackProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [audioUrl]);

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob);
      clearRecording();
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playRecording();
    }
  };

  const getRecordingStatus = () => {
    if (error) return { text: 'Error', color: 'text-red-400' };
    if (isRecording && !isPaused) return { text: 'Recording...', color: 'text-red-400' };
    if (isRecording && isPaused) return { text: 'Paused', color: 'text-yellow-400' };
    if (audioBlob) return { text: 'Ready to send', color: 'text-green-400' };
    return { text: 'Ready to record', color: 'text-gray-400' };
  };

  const status = getRecordingStatus();

  return (
    <div className={cn("bg-gray-800 rounded-lg p-4 space-y-4", className)}>
      {/* Recording Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={cn("w-2 h-2 rounded-full", {
            'bg-red-500 animate-pulse': isRecording && !isPaused,
            'bg-yellow-500': isRecording && isPaused,
            'bg-green-500': audioBlob && !isRecording,
            'bg-gray-500': !isRecording && !audioBlob
          })} />
          <span className={cn("text-sm font-medium", status.color)}>
            {status.text}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-400">
            {formatDuration}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Recording Controls */}
      {!audioBlob && (
        <div className="flex items-center justify-center space-x-4">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16"
            >
              <Mic className="h-6 w-6" />
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                onClick={isPaused ? resumeRecording : pauseRecording}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              
              <Button
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12"
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Recording Progress */}
      {isRecording && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Waveform className="h-4 w-4 text-red-400" />
            <Progress 
              value={(duration / maxDuration) * 100} 
              className="flex-1"
            />
            <span className="text-xs text-gray-400">
              {Math.round((duration / maxDuration) * 100)}%
            </span>
          </div>
          
          {duration >= maxDuration * 0.8 && (
            <p className="text-xs text-yellow-400 text-center">
              Recording will stop automatically at {Math.floor(maxDuration / 60)}:{(maxDuration % 60).toString().padStart(2, '0')}
            </p>
          )}
        </div>
      )}

      {/* Playback Controls */}
      {audioBlob && (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Button
              onClick={handlePlayPause}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Volume2 className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-400">Voice message</span>
                <Badge variant="secondary" className="text-xs">
                  {formatDuration}
                </Badge>
              </div>
              <Progress value={playbackProgress} className="h-1" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              onClick={clearRecording}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={onCancel}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element for playback */}
      {audioUrl && (
        <audio
          src={audioUrl}
          preload="metadata"
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
}

export function VoiceMessagePlayer({ 
  audioUrl, 
  duration, 
  senderName, 
  timestamp,
  className 
}: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    setAudioElement(audio);

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.pause();
    };
  }, [audioUrl]);

  const handlePlayPause = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn("bg-gray-800 rounded-lg p-3 space-y-2", className)}>
      <div className="flex items-center space-x-3">
        <Button
          onClick={handlePlayPause}
          variant="outline"
          size="sm"
          className="border-gray-600 text-gray-300 hover:bg-gray-700 w-8 h-8 p-0"
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <Volume2 className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-400">
              {senderName ? `${senderName} • ` : ''}Voice message
            </span>
            {timestamp && (
              <span className="text-xs text-gray-500">
                {new Date(timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Progress value={progress} className="flex-1 h-1" />
            <span className="text-xs text-gray-400 min-w-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
