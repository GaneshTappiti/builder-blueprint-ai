"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Video, 
  Music, 
  Archive, 
  X, 
  CheckCircle,
  AlertCircle,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/contexts/ChatContext";
import { FileAttachment } from "@/types/chat";

interface FileUploadProps {
  channelId?: string;
  onUploadComplete?: (attachment: FileAttachment) => void;
  onUploadError?: (error: Error) => void;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  multiple?: boolean;
  className?: string;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  attachment?: FileAttachment;
}

const FileUpload: React.FC<FileUploadProps> = ({
  channelId,
  onUploadComplete,
  onUploadError,
  maxFileSize = 10, // 10MB default
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt', '.zip'],
  multiple = false,
  className
}) => {
  const { toast } = useToast();
  const { uploadFile } = useChat();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (fileType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="h-4 w-4" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    const isValidType = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type.match(type.replace('*', '.*'));
    });

    if (!isValidType) {
      return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileUpload = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Validate files
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Invalid file",
          description: `${file.name}: ${error}`,
          variant: "destructive"
        });
        return;
      }
    }

    // Create uploading file entries
    const newUploadingFiles: UploadingFile[] = fileArray.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload files
    for (const uploadingFile of newUploadingFiles) {
      try {
        const attachment = await uploadFile(uploadingFile.file, channelId);
        
        setUploadingFiles(prev => prev.map(f => 
          f.id === uploadingFile.id 
            ? { ...f, status: 'completed', progress: 100, attachment }
            : f
        ));

        onUploadComplete?.(attachment);
        
        toast({
          title: "File uploaded",
          description: `${uploadingFile.file.name} has been uploaded successfully.`,
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        
        setUploadingFiles(prev => prev.map(f => 
          f.id === uploadingFile.id 
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : f
        ));

        onUploadError?.(error as Error);
        
        toast({
          title: "Upload failed",
          description: `Failed to upload ${uploadingFile.file.name}. Please try again.`,
          variant: "destructive"
        });
      }
    }
  }, [uploadFile, channelId, onUploadComplete, onUploadError, maxFileSize, allowedTypes, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };

  const downloadFile = (attachment: FileAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.file_url;
    link.download = attachment.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver 
            ? 'border-green-400 bg-green-500/10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-white mb-2">
          Upload Files
        </h3>
        <p className="text-gray-400 mb-4">
          Drag and drop files here, or click to select files
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Max file size: {maxFileSize}MB • Allowed types: {allowedTypes.join(', ')}
        </p>
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-green-600 hover:bg-green-700"
        >
          Select Files
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-white">Uploading Files</h4>
          {uploadingFiles.map((uploadingFile) => (
            <Card key={uploadingFile.id} className="bg-black/20 border-white/10">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-gray-400">
                      {getFileIcon(uploadingFile.file.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {uploadingFile.file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(uploadingFile.file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {uploadingFile.status === 'uploading' && (
                      <div className="w-16">
                        <Progress value={uploadingFile.progress} className="h-2" />
                      </div>
                    )}
                    
                    {uploadingFile.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                    
                    {uploadingFile.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    )}
                    
                    {uploadingFile.status === 'completed' && uploadingFile.attachment && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadFile(uploadingFile.attachment!)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUploadingFile(uploadingFile.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {uploadingFile.status === 'error' && uploadingFile.error && (
                  <p className="text-xs text-red-400 mt-2">
                    {uploadingFile.error}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
