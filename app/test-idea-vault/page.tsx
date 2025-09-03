"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ideaVaultHelpers } from '@/utils/idea-vault-helpers';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function TestIdeaVault() {
  const { toast } = useToast();
  const router = useRouter();

  const createTestIdea = () => {
    try {
      const testIdea = ideaVaultHelpers.createTestIdea();
      console.log('Created test idea:', testIdea);
      
      toast({
        title: "Test Idea Created",
        description: "A test idea has been added to your vault. Check the Idea Vault page.",
      });
    } catch (error) {
      console.error('Error creating test idea:', error);
      toast({
        title: "Error",
        description: "Failed to create test idea.",
        variant: "destructive"
      });
    }
  };

  const checkLocalStorage = () => {
    const ideas = localStorage.getItem('ideaVault');
    console.log('Ideas in localStorage:', ideas);
    
    if (ideas) {
      const parsedIdeas = JSON.parse(ideas);
      console.log('Parsed ideas:', parsedIdeas);
      console.log('Number of ideas:', parsedIdeas.length);
    }
    
    toast({
      title: "Check Console",
      description: "Ideas data logged to browser console.",
    });
  };

  const clearIdeas = () => {
    localStorage.removeItem('ideaVault');
    toast({
      title: "Ideas Cleared",
      description: "All ideas have been removed from localStorage.",
    });
  };

  const goToIdeaVault = () => {
    router.push('/workspace/idea-vault');
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Test Idea Vault</h1>
      
      <div className="space-y-4">
        <Button onClick={createTestIdea} className="bg-blue-600 hover:bg-blue-700">
          Create Test Idea
        </Button>
        
        <Button onClick={checkLocalStorage} variant="outline" className="border-gray-600 text-gray-300">
          Check localStorage
        </Button>
        
        <Button onClick={goToIdeaVault} className="bg-green-600 hover:bg-green-700">
          Go to Idea Vault
        </Button>
        
        <Button onClick={clearIdeas} variant="destructive">
          Clear All Ideas
        </Button>
      </div>
    </div>
  );
}
