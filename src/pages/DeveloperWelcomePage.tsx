
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Plus, Clock, Award, Activity, Users, BellRing } from 'lucide-react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { useAuth, getCurrentUserData } from '../contexts/auth';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

const DeveloperWelcomePage = () => {
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [developerData, setDeveloperData] = useState<any>(null);
  const [activeApplications, setActiveApplications] = useState(0);
  const [upcomingSessions, setUpcomingSessions] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    const fetchDeveloperData = async () => {
      try {
        setIsLoading(true);
        if (!userId) return;

        const userData = await getCurrentUserData();
        if (userData) {
          setDeveloperData(userData);
          
          // Calculate profile completion percentage
          let completed = 0;
          const totalFields = 6; // Adjust based on required profile fields
          
          if (userData.name) completed++;
          if (userData.email) completed++;
          if (userData.description) completed++;
          if (userData.skills && userData.skills.length > 0) completed++;
          if (userData.hourlyRate) completed++;
          if (userData.availability !== undefined) completed++;
          
          setProfileCompletion(Math.round((completed / totalFields) * 100));

          // Fetch real counts from Supabase
          const [{ count: appCount }, { count: sessionCount }] = await Promise.all([
            supabase
              .from('help_request_matches')
              .select('id', { count: 'exact', head: true })
              .eq('developer_id', userId)
              .in('status', ['pending', 'approved_by_client']),
            supabase
              .from('help_sessions')
              .select('id', { count: 'exact', head: true })
              .eq('developer_id', userId)
              .eq('status', 'scheduled'),
          ]);

          setActiveApplications(appCount ?? 0);
          setUpcomingSessions(sessionCount ?? 0);

          const { count: doneCount } = await supabase
            .from('help_sessions')
            .select('id', { count: 'exact', head: true })
            .eq('developer_id', userId)
            .eq('status', 'completed');

          setCompletedSessions(doneCount ?? 0);
        }
      } catch (error) {
        console.error('Error fetching developer data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeveloperData();
  }, [userId]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-muted/50 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Developer Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {developerData?.name || 'Developer'}</p>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        {/* Profile completion card */}
        <div className="mb-8 bg-card rounded-xl border border-border/40 shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Profile Completion</h2>
              <p className="text-muted-foreground">Complete your profile to increase your chances of getting matched with clients.</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/profile">Edit Profile</Link>
            </Button>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm">{profileCompletion}% Complete</span>
              <span className="text-sm text-muted-foreground">{profileCompletion < 100 ? 'In Progress' : 'Completed'}</span>
            </div>
            <Progress value={profileCompletion} className="h-2" />
          </div>
          
          {profileCompletion < 100 && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Complete your profile to improve matching with clients and increase visibility.</p>
            </div>
          )}
        </div>
        
        {/* Dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Activity summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-primary" />
                Activity Summary
              </CardTitle>
              <CardDescription>Your recent activity overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Applications</span>
                  <span className="font-medium">{activeApplications}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Upcoming Sessions</span>
                  <span className="font-medium">{upcomingSessions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Active</span>
                  <span className="font-medium">Today</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" asChild className="w-full">
                <Link to="/developer-tickets">View All Activity</Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BellRing className="mr-2 h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>Commonly used actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/developer-tickets">
                  <Plus className="mr-2 h-4 w-4" /> Browse Help Requests
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/profile">
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Update Availability
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/session-history">
                  <Clock className="mr-2 h-4 w-4" /> View Past Sessions
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Stats card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-primary" />
                Your Stats
              </CardTitle>
              <CardDescription>Performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Applications</span>
                  <span className="font-medium">{activeApplications}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Upcoming Sessions</span>
                  <span className="font-medium">{upcomingSessions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed Sessions</span>
                  <span className="font-medium">{completedSessions}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Featured section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Featured Help Requests
          </h2>
          
          <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden p-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">View the latest help requests that match your skills</p>
              <Button asChild>
                <Link to="/developer-tickets">Browse Help Requests</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DeveloperWelcomePage;
