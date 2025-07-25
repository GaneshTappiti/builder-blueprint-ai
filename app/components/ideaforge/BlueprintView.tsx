import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Plus, Smartphone, Code, Database } from "lucide-react";

interface BlueprintViewProps {
  ideaId: string;
}

const BlueprintView: React.FC<BlueprintViewProps> = ({ ideaId }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="h-6 w-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Product Blueprint</h2>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Feature
        </Button>
      </div>

      {/* App Type */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">App Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-green-400" />
            <span className="text-gray-300">Mobile App (iOS & Android)</span>
          </div>
        </CardContent>
      </Card>

      {/* Core Features */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Core Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
              <div>
                <h4 className="font-medium text-white">AI Workout Generation</h4>
                <p className="text-sm text-gray-400">Personalized workout plans based on user goals</p>
              </div>
              <Badge className="bg-red-600/20 text-red-400">High Priority</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
              <div>
                <h4 className="font-medium text-white">Form Analysis</h4>
                <p className="text-sm text-gray-400">Real-time computer vision feedback</p>
              </div>
              <Badge className="bg-red-600/20 text-red-400">High Priority</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
              <div>
                <h4 className="font-medium text-white">Progress Tracking</h4>
                <p className="text-sm text-gray-400">Comprehensive analytics and insights</p>
              </div>
              <Badge className="bg-yellow-600/20 text-yellow-400">Medium Priority</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
              <div>
                <h4 className="font-medium text-white">Social Features</h4>
                <p className="text-sm text-gray-400">Community challenges and sharing</p>
              </div>
              <Badge className="bg-green-600/20 text-green-400">Low Priority</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Tech Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-black/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-4 w-4 text-blue-400" />
                <span className="font-medium text-white">Frontend</span>
              </div>
              <p className="text-sm text-gray-400">React Native</p>
            </div>
            <div className="p-3 bg-black/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-4 w-4 text-green-400" />
                <span className="font-medium text-white">Backend</span>
              </div>
              <p className="text-sm text-gray-400">Node.js + Express</p>
            </div>
            <div className="p-3 bg-black/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-purple-400" />
                <span className="font-medium text-white">Database</span>
              </div>
              <p className="text-sm text-gray-400">PostgreSQL</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlueprintView;
