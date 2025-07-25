import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Plus, Calendar, Lightbulb, Target, Users } from "lucide-react";

interface JourneyViewProps {
  ideaId: string;
}

const JourneyView: React.FC<JourneyViewProps> = ({ ideaId }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="h-6 w-6 text-orange-400" />
          <h2 className="text-2xl font-bold text-white">Founder's Journey</h2>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Journey Timeline */}
      <div className="space-y-4">
        {/* Entry 1 */}
        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                Initial Idea Validation
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>2 days ago</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <Badge className="bg-yellow-600/20 text-yellow-400">Insight</Badge>
            </div>
            <p className="text-gray-300 mb-4">
              Conducted initial market research and found that 73% of gym-goers struggle with proper form. 
              This validates our core problem statement and the need for real-time feedback.
            </p>
            <div className="text-sm text-gray-400">
              Key takeaway: Focus on form correction as the primary value proposition
            </div>
          </CardContent>
        </Card>

        {/* Entry 2 */}
        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                User Interview Insights
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>5 days ago</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <Badge className="bg-blue-600/20 text-blue-400">Research</Badge>
            </div>
            <p className="text-gray-300 mb-4">
              Interviewed 12 fitness enthusiasts. Main pain points: lack of personalized guidance, 
              fear of injury, and difficulty tracking progress effectively.
            </p>
            <div className="text-sm text-gray-400">
              Next step: Create user personas and refine feature priorities
            </div>
          </CardContent>
        </Card>

        {/* Entry 3 */}
        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-green-400" />
                Competitive Analysis Complete
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>1 week ago</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <Badge className="bg-green-600/20 text-green-400">Analysis</Badge>
            </div>
            <p className="text-gray-300 mb-4">
              Analyzed 8 major competitors including Nike Training Club, Freeletics, and Fitbod. 
              None offer real-time form correction using computer vision - this is our differentiator.
            </p>
            <div className="text-sm text-gray-400">
              Opportunity: First-mover advantage in AI-powered form correction
            </div>
          </CardContent>
        </Card>

        {/* Add Entry Placeholder */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/5 border-dashed">
          <CardContent className="p-8 text-center">
            <GitBranch className="h-8 w-8 text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Document Your Journey</h3>
            <p className="text-gray-500 mb-4">
              Track insights, decisions, and milestones as you develop your idea.
            </p>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JourneyView;
