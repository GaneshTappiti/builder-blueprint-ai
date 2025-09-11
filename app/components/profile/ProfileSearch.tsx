"use client";

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { UserProfile, ProfileSearchFilters } from '@/types/profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Circle, 
  AlertCircle,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProfileSearchProps {
  onProfileSelect?: (profile: UserProfile) => void;
  className?: string;
}

export function ProfileSearch({ onProfileSelect, className = '' }: ProfileSearchProps) {
  const { searchProfiles } = useProfile();
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ProfileSearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim() && Object.keys(filters).length === 0) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchProfiles(filters, 20, 0);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ProfileSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setSearchResults([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'away': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-3 w-3" />;
      case 'busy': return <AlertCircle className="h-3 w-3" />;
      case 'away': return <Clock className="h-3 w-3" />;
      default: return <Circle className="h-3 w-3" />;
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Find Team Members
          </CardTitle>
          <CardDescription>
            Search and discover team members by skills, location, or other criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, skills, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
                <div>
                  <label className="text-sm font-medium mb-1 block">Department</label>
                  <Select
                    value={filters.departments?.[0] || ''}
                    onValueChange={(value) => handleFilterChange('departments', value ? [value] : [])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All departments</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <Select
                    value={filters.availability || ''}
                    onValueChange={(value) => handleFilterChange('availability', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="away">Away</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Location</label>
                  <Input
                    placeholder="Enter location"
                    value={filters.location || ''}
                    onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
                  />
                </div>

                <div className="col-span-full flex justify-end space-x-2">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <Button onClick={handleSearch}>
                    Search
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Searching...</span>
            </div>
          </CardContent>
        </Card>
      ) : searchResults.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found {searchResults.length} team members
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((profile) => (
              <Card 
                key={profile.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onProfileSelect?.(profile)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.avatar_url} alt={profile.name} />
                        <AvatarFallback>
                          {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${getStatusColor(profile.status)} flex items-center justify-center`}>
                        {getStatusIcon(profile.status)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {profile.displayName || profile.name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {profile.jobTitle} {profile.department && `• ${profile.department}`}
                      </p>
                      
                      {profile.location && (
                        <div className="flex items-center space-x-1 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{profile.location}</span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {profile.skills?.slice(0, 3).map((skill) => (
                          <Badge key={skill.id} variant="secondary" className="text-xs">
                            {skill.name}
                          </Badge>
                        ))}
                        {profile.skills && profile.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Actions */}
                  <div className="flex space-x-1 mt-3">
                    {profile.email && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
                    )}
                    {profile.phone && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                    )}
                    {profile.linkedin && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Linkedin className="h-3 w-3 mr-1" />
                        LinkedIn
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : searchTerm || Object.keys(filters).length > 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No team members found matching your criteria</p>
              <Button variant="outline" onClick={clearFilters} className="mt-2">
                Clear Search
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Enter a search term or use filters to find team members</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProfileSearch;
