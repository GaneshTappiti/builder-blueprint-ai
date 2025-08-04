"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import InvestorsList from "@/components/investor/SimpleInvestorsList";
import FundingRoundsList from "@/components/investor/FundingRoundsList";
import PitchDeckView from "@/components/investor/PitchDeckView";
import InvestorDashboard from "@/components/investor/InvestorDashboard";
import { useToast } from "@/hooks/use-toast";
import FilterDrawer from "@/components/investor/FilterDrawer";
import { Investor, FundingRound, FundingRoundInput, InvestorStatus } from "@/types/investor";
import { TabsContent } from "@/components/ui/tabs";

import TabNavigation from "@/components/investor/TabNavigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Target, Menu } from "lucide-react";
import { investorRadarHelpers } from "@/lib/supabase-connection-helpers";
import { useAuth } from "@/contexts/AuthContext";

export default function InvestorRadarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("investors");
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [fundingRounds, setFundingRounds] = useState<FundingRound[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  // Load data from JSON file (with database fallback)
  const loadInvestors = async () => {
    try {
      setLoading(true);

      // Load from JSON file first (our processed investor data)
      try {
        console.log('Attempting to fetch investor data...');
        const response = await fetch('/data/investors.json');
        console.log('Fetch response status:', response.status);
        if (response.ok) {
          const jsonData = await response.json();
          console.log('Successfully loaded investors from JSON:', jsonData.length);
          console.log('First investor:', jsonData[0]);
          setInvestors(jsonData);
          return; // Success, exit early
        } else {
          console.error('Failed to fetch JSON data:', response.status, response.statusText);
        }
      } catch (jsonError) {
        console.error('Error loading JSON data:', jsonError);
      }

      // Fallback to database if user is authenticated
      if (user) {
        try {
          const { data: dbData, error } = await investorRadarHelpers.getInvestors(user.id);
          if (error) {
            console.warn('Database error:', error);
          } else {
            setInvestors(dbData || []);
            return;
          }
        } catch (dbError) {
          console.warn('Database connection failed:', dbError);
        }
      }

      // If both fail, use fallback sample data
      console.log('Using fallback sample data');
      const fallbackData: Investor[] = [
        {
          id: "sample-1",
          name: "John Smith",
          company: "TechVentures Capital",
          position: "Managing Partner",
          email: "john@techventures.com",
          linkedinUrl: "https://linkedin.com/in/johnsmith",
          website: "https://techventures.com",
          location: "San Francisco, CA",
          focusAreas: ["AI/ML", "SaaS", "FinTech"],
          investmentRange: "$500K - $5M",
          portfolioSize: 42,
          rating: 4.8,
          description: "Early-stage investor focused on AI and enterprise software.",
          status: "to-contact",
          lastMeeting: "Never",
          notes: "",
          avatar: "https://ui-avatars.com/api/?name=John%20Smith&background=random",
          recentInvestments: ["DataFlow AI", "CloudSync", "FinanceBot"],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "sample-2",
          name: "Sarah Chen",
          company: "Innovation Partners",
          position: "Senior Partner",
          email: "sarah@innovationpartners.com",
          linkedinUrl: "https://linkedin.com/in/sarahchen",
          website: "https://innovationpartners.com",
          location: "New York, NY",
          focusAreas: ["HealthTech", "EdTech", "Consumer"],
          investmentRange: "$250K - $2M",
          portfolioSize: 28,
          rating: 4.6,
          description: "Seed and Series A investor with deep healthcare expertise.",
          status: "to-contact",
          lastMeeting: "Never",
          notes: "",
          avatar: "https://ui-avatars.com/api/?name=Sarah%20Chen&background=random",
          recentInvestments: ["MedAssist", "LearnFast", "WellnessTracker"],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setInvestors(fallbackData);

    } catch (error: unknown) {
      console.error('Error loading investors:', error);
      toast({
        title: "Loading Investors",
        description: "Loading investor data from local files...",
        variant: "default"
      });
      setInvestors([]); // Set empty array to show "Add First Investor" state
    } finally {
      setLoading(false);
    }
  };

  const loadFundingRounds = async () => {
    if (!user) return;

    try {
      const { data, error } = await investorRadarHelpers.getFundingRounds(user.id);

      if (error) throw error;

      setFundingRounds(data || []);
    } catch (error: unknown) {
      console.error('Error loading funding rounds:', error);
    }
  };

  useEffect(() => {
    // Load investors immediately (doesn't require authentication for demo data)
    loadInvestors();

    // Load funding rounds only if user is authenticated
    if (user) {
      loadFundingRounds();
    }
  }, []);

  // Also try to load when user changes
  useEffect(() => {
    if (user && investors.length === 0) {
      loadInvestors();
    }
  }, [user]);





  const handleAddFundingRound = async (fundingData: FundingRoundInput) => {
    if (!user) return;

    try {
      const { data, error } = await investorRadarHelpers.createFundingRound({
        ...fundingData,
        user_id: user.id
      });

      if (error) throw error;

      if (data) {
        setFundingRounds(prev => [...prev, data]);
        toast({
          title: "Funding Round Added",
          description: "New funding round has been added.",
        });
      }
    } catch (error: unknown) {
      console.error('Error adding funding round:', error);
      toast({
        title: "Error Adding Funding Round",
        description: "Failed to add funding round. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogContact = async (investorId: string, contactData: any) => {
    try {
      const { error } = await investorRadarHelpers.logContact({
        investor_id: investorId,
        user_id: user?.id || '',
        ...contactData
      });

      if (error) throw error;

      toast({
        title: "Contact Logged",
        description: "Investor contact has been logged successfully.",
      });
    } catch (error: unknown) {
      console.error('Error logging contact:', error);
      toast({
        title: "Error Logging Contact",
        description: "Failed to log contact. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateInvestorStatus = async (investorId: string, status: InvestorStatus) => {
    try {
      const { error } = await investorRadarHelpers.updateInvestorStatus(investorId, status);

      if (error) {
        console.warn('Database update failed, updating locally only:', error);
      }

      // Update local state regardless of database success
      setInvestors(prev => prev.map(inv =>
        inv.id === investorId ? { ...inv, status } : inv
      ));

      toast({
        title: "Status Updated",
        description: "Investor status has been updated.",
      });
    } catch (error: unknown) {
      console.error('Error updating investor status:', error);
      // Still update locally even if database fails
      setInvestors(prev => prev.map(inv =>
        inv.id === investorId ? { ...inv, status } : inv
      ));
      toast({
        title: "Status Updated Locally",
        description: "Status updated locally. Database sync may be delayed.",
        variant: "default"
      });
    }
  };

  return (
    <div className="layout-container bg-gradient-to-br from-black via-gray-900 to-green-950">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="layout-main transition-all duration-300">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-black/30"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <Link
                  href="/workspace"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Workspace</span>
                </Link>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>{investors.length} Investors Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-8 w-8 text-green-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">Investor Radar</h1>
            </div>
            <p className="text-gray-400 text-lg">
              Browse verified investors, view their profiles, and connect directly for funding opportunities
            </p>
            {/* Debug info */}
            <div className="text-sm text-gray-500 mt-2">
              Debug: {loading ? 'Loading...' : `${investors.length} investors loaded`}
            </div>
          </div>

          {/* Dashboard */}
          {!loading && investors.length > 0 && (
            <InvestorDashboard investors={investors} />
          )}

          {/* Main Content Container */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6">

            <TabNavigation 
              activeTab={activeTab}
              onTabChange={setActiveTab}
            >
              <TabsContent value="investors" className="mt-4 md:mt-6 animate-fade-in">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading investors...</p>
                  </div>
                ) : (
                  <InvestorsList
                    investors={investors}
                    onLogContact={handleLogContact}
                    onStatusChange={handleUpdateInvestorStatus}
                  />
                )}
              </TabsContent>
              <TabsContent value="funding" className="mt-4 md:mt-6 animate-fade-in">
                <FundingRoundsList 
                  fundingRounds={fundingRounds} 
                  onAddFundingRound={handleAddFundingRound}
                />
              </TabsContent>
              <TabsContent value="pitchdeck" className="mt-4 md:mt-6 animate-fade-in">
                <PitchDeckView />
              </TabsContent>
            </TabNavigation>
          </div>
        </div>
      </main>
      {/* Modals and drawers */}
      <FilterDrawer 
        open={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
      />

    </div>
  );
}
