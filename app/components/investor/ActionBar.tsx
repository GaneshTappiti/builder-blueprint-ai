"use client"

import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Filter, 
  Download, 
  Share2, 
  Settings,
  Search,
  MoreHorizontal
} from "lucide-react";

interface ActionBarProps {
  onAddInvestor?: () => void;
  onFilter?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  className?: string;
}

const ActionBar: React.FC<ActionBarProps> = ({ 
  onAddInvestor, 
  onFilter, 
  onExport, 
  onShare,
  className 
}) => {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Button 
          onClick={onAddInvestor}
          className="bg-green-600 hover:bg-green-700"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Investor
        </Button>
        
        <Button 
          onClick={onFilter}
          variant="outline" 
          size="sm"
          className="border-white/10 hover:bg-white/5"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          onClick={onExport}
          variant="outline" 
          size="sm"
          className="border-white/10 hover:bg-white/5"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <Button 
          onClick={onShare}
          variant="outline" 
          size="sm"
          className="border-white/10 hover:bg-white/5"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          className="border-white/10 hover:bg-white/5"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ActionBar;
