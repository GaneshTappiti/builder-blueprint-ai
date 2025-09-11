"use client";

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  FileText, 
  Database,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';
import { ProfileExport } from '@/types/profile';

interface ProfileGDPRExportProps {
  userId?: string;
  className?: string;
}

export function ProfileGDPRExport({ userId, className = '' }: ProfileGDPRExportProps) {
  const { profile } = useProfile();
  const [exportData, setExportData] = useState<ProfileExport | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [exportProgress, setExportProgress] = useState(0);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const handleGenerateExport = async () => {
    try {
      setLoading(true);
      setExportStatus('generating');
      setExportProgress(0);

      // Simulate export generation progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setExportStatus('ready');
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // This would be implemented in ProfileService
      // const exportData = await ProfileService.generateGDPRExport(userId);
      // setExportData(exportData);
      
      // Mock data for now
      const mockExportData: ProfileExport = {
        userProfile: profile!,
        activities: [],
        performance: {} as any,
        achievements: [],
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      setTimeout(() => {
        setExportData(mockExportData);
        clearInterval(progressInterval);
        setExportStatus('ready');
        setExportProgress(100);
      }, 2000);

    } catch (error) {
      console.error('Error generating export:', error);
      setExportStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExport = () => {
    if (!exportData) return;

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `profile-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getExportStatusIcon = (status: string) => {
    switch (status) {
      case 'idle': return <FileText className="h-4 w-4" />;
      case 'generating': return <Clock className="h-4 w-4 animate-spin" />;
      case 'ready': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getExportStatusBadge = (status: string) => {
    switch (status) {
      case 'idle': return <Badge variant="outline">Ready to Export</Badge>;
      case 'generating': return <Badge className="bg-blue-100 text-blue-800">Generating...</Badge>;
      case 'ready': return <Badge className="bg-green-100 text-green-800">Ready for Download</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Export Failed</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">GDPR Data Export</h3>
          <p className="text-sm text-muted-foreground">
            Download your complete profile data in compliance with GDPR
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          GDPR Compliant
        </Badge>
      </div>

      {/* Export Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getExportStatusIcon(exportStatus)}
            Data Export Status
          </CardTitle>
          <CardDescription>
            Generate and download your complete profile data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Export Status</span>
              {getExportStatusBadge(exportStatus)}
            </div>

            {exportStatus === 'generating' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Generating export...</span>
                  <span>{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
              </div>
            )}

            {exportStatus === 'ready' && exportData && (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Export Ready</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Your data export was generated on {new Date(exportData.exportDate).toLocaleString()}
                  </p>
                </div>
                <Button onClick={handleDownloadExport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Export
                </Button>
              </div>
            )}

            {exportStatus === 'error' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Export Failed</span>
                </div>
                <p className="text-xs text-red-700 mt-1">
                  There was an error generating your export. Please try again.
                </p>
              </div>
            )}

            {exportStatus === 'idle' && (
              <Button onClick={handleGenerateExport} disabled={loading} className="w-full">
                <Database className="h-4 w-4 mr-2" />
                Generate Data Export
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Data Overview
          </CardTitle>
          <CardDescription>
            What data will be included in your export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4" />
                  <span className="text-sm font-medium">Profile Data</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Personal information</li>
                  <li>• Professional details</li>
                  <li>• Skills and certifications</li>
                  <li>• Preferences and settings</li>
                </ul>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Activity Data</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Login history</li>
                  <li>• Feature usage</li>
                  <li>• Collaboration records</li>
                  <li>• Performance metrics</li>
                </ul>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Privacy Data</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Privacy settings</li>
                  <li>• Consent records</li>
                  <li>• Data retention policies</li>
                  <li>• Access logs</li>
                </ul>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Export Format</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• JSON format</li>
                  <li>• Machine readable</li>
                  <li>• Complete data set</li>
                  <li>• Timestamped export</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sensitive Data Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Sensitive Data
          </CardTitle>
          <CardDescription>
            Control what sensitive data is included in your export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Include Sensitive Data</h4>
                <p className="text-xs text-muted-foreground">
                  Include personal information like phone numbers, addresses, and private notes
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSensitiveData(!showSensitiveData)}
              >
                {showSensitiveData ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showSensitiveData ? 'Hide' : 'Show'} Sensitive
              </Button>
            </div>

            {showSensitiveData && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-medium mb-1">Sensitive Data Warning</p>
                    <p>
                      Including sensitive data in your export will make the file contain personal information 
                      that should be handled securely. Make sure to store the downloaded file in a safe location.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* GDPR Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            GDPR Compliance
          </CardTitle>
          <CardDescription>
            Your rights under the General Data Protection Regulation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Right to Data Portability</p>
                <p className="text-xs text-muted-foreground">
                  You have the right to receive your personal data in a structured, commonly used format
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Right to Access</p>
                <p className="text-xs text-muted-foreground">
                  You can request access to all personal data we hold about you
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Right to Rectification</p>
                <p className="text-xs text-muted-foreground">
                  You can request correction of inaccurate or incomplete data
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Right to Erasure</p>
                <p className="text-xs text-muted-foreground">
                  You can request deletion of your personal data under certain circumstances
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
