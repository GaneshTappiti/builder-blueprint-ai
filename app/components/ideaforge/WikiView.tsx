import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, FileText } from "lucide-react";
import { StoredIdea } from "@/types/ideaforge";

interface WikiViewProps {
  idea: StoredIdea;
}

const WikiView: React.FC<WikiViewProps> = ({ idea }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Wiki Knowledge Base</h2>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Wiki Sections */}
      <div className="grid gap-4">
        {/* Market Research Section */}
        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Market Research
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              The global fitness app market is valued at $4.4 billion and growing at 14.7% CAGR. 
              Key trends include AI-powered personalization and computer vision integration.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Last updated: 2 hours ago</span>
            </div>
          </CardContent>
        </Card>

        {/* Problem Statement Section */}
        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Problem Statement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              Many people struggle with proper form during workouts, leading to injuries and 
              ineffective training. Current fitness apps lack real-time feedback capabilities.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Last updated: 5 hours ago</span>
            </div>
          </CardContent>
        </Card>

        {/* Solution Overview Section */}
        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Solution Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              AI-powered fitness coach that uses computer vision to analyze form in real-time, 
              provides personalized workout plans, and adapts based on user progress and feedback.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Last updated: 1 day ago</span>
            </div>
          </CardContent>
        </Card>

        {/* Empty State for More Sections */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/5 border-dashed">
          <CardContent className="p-8 text-center">
            <FileText className="h-8 w-8 text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Add More Sections</h3>
            <p className="text-gray-500 mb-4">
              Document your research, competitive analysis, user personas, and more.
            </p>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WikiView;
