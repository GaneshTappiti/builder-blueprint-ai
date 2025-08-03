"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Users, 
  TrendingUp,
  ExternalLink,
  Star,
  Building2,
  Globe
} from "lucide-react";

interface Investor {
  id: string;
  name: string;
  firm: string;
  avatar?: string;
  location: string;
  focusAreas: string[];
  investmentRange: string;
  portfolioSize: number;
  rating: number;
  description: string;
  website?: string;
  recentInvestments: string[];
}

const InvestorsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock investor data
  const investors: Investor[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      firm: 'TechVentures Capital',
      location: 'San Francisco, CA',
      focusAreas: ['AI/ML', 'SaaS', 'FinTech'],
      investmentRange: '$500K - $5M',
      portfolioSize: 42,
      rating: 4.8,
      description: 'Early-stage investor focused on AI and enterprise software. Former founder with 2 successful exits.',
      website: 'https://techventures.com',
      recentInvestments: ['DataFlow AI', 'CloudSync', 'FinanceBot']
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      firm: 'Innovation Partners',
      location: 'New York, NY',
      focusAreas: ['HealthTech', 'EdTech', 'Consumer'],
      investmentRange: '$250K - $2M',
      portfolioSize: 28,
      rating: 4.6,
      description: 'Seed and Series A investor with deep healthcare and education expertise.',
      website: 'https://innovationpartners.com',
      recentInvestments: ['MedAssist', 'LearnFast', 'WellnessTracker']
    },
    {
      id: '3',
      name: 'Emily Watson',
      firm: 'Future Fund',
      location: 'Austin, TX',
      focusAreas: ['Climate Tech', 'Sustainability', 'Energy'],
      investmentRange: '$1M - $10M',
      portfolioSize: 35,
      rating: 4.9,
      description: 'Climate-focused investor backing solutions for environmental challenges.',
      website: 'https://futurefund.com',
      recentInvestments: ['SolarGrid', 'CarbonCapture', 'GreenLogistics']
    },
    {
      id: '4',
      name: 'David Kim',
      firm: 'Startup Accelerator',
      location: 'Seattle, WA',
      focusAreas: ['B2B SaaS', 'DevTools', 'Infrastructure'],
      investmentRange: '$100K - $1M',
      portfolioSize: 67,
      rating: 4.7,
      description: 'Pre-seed and seed investor with strong technical background in enterprise software.',
      website: 'https://startupaccelerator.com',
      recentInvestments: ['DevOps Pro', 'API Gateway', 'CloudMonitor']
    }
  ];

  const filteredInvestors = investors.filter(investor => {
    const matchesSearch = investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.firm.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.focusAreas.some(area => area.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && investor.focusAreas.some(area => 
      area.toLowerCase().includes(selectedFilter.toLowerCase())
    );
  });

  const focusAreaFilters = ['all', 'AI/ML', 'SaaS', 'FinTech', 'HealthTech', 'Climate Tech'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Investor Directory</h2>
          <p className="text-gray-400">Connect with investors who match your startup</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search investors, firms, or focus areas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/20 border-white/10 text-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {focusAreaFilters.map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter)}
              className={selectedFilter === filter ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {filter === 'all' ? 'All Areas' : filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-400">
        Showing {filteredInvestors.length} of {investors.length} investors
      </div>

      {/* Investors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInvestors.map((investor) => (
          <Card key={investor.id} className="workspace-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={investor.avatar} />
                  <AvatarFallback className="bg-green-600 text-white">
                    {investor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-white text-lg">{investor.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-300">{investor.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <Building2 className="h-4 w-4" />
                    <span>{investor.firm}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{investor.location}</span>
                  </div>
                </div>
                
                {investor.website && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={investor.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm">{investor.description}</p>
              
              {/* Focus Areas */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Focus Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {investor.focusAreas.map((area, index) => (
                    <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Investment Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-xs text-gray-400">Investment Range</p>
                    <p className="text-sm font-medium text-white">{investor.investmentRange}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-400">Portfolio Size</p>
                    <p className="text-sm font-medium text-white">{investor.portfolioSize} companies</p>
                  </div>
                </div>
              </div>
              
              {/* Recent Investments */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Recent Investments</h4>
                <div className="flex flex-wrap gap-2">
                  {investor.recentInvestments.slice(0, 3).map((investment, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                      {investment}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1">
                  Connect
                </Button>
                <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {filteredInvestors.length > 0 && (
        <div className="text-center">
          <Button variant="outline" className="border-white/10 hover:bg-white/5">
            Load More Investors
          </Button>
        </div>
      )}
    </div>
  );
};

export default InvestorsList;
