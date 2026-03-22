
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import PainPointsSection from '../components/PainPointsSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TargetAudienceSection from '../components/TargetAudienceSection';
import DeveloperShowcase from '../components/DeveloperShowcase';
import CTASection from '../components/CTASection';
import { useAuth } from '../contexts/auth';
import { getUserHomePage } from '../utils/navigationUtils';
import { supabase } from '../integrations/supabase/client';
import { Developer } from '../types/product';

const Index: React.FC = () => {
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && userType) {
      navigate(getUserHomePage(userType));
    }
  }, [isAuthenticated, userType, navigate]);

  useEffect(() => {
    const fetchRealDevelopers = async () => {
      setIsLoading(true);
      try {
        // First try: verified developers who are available
        let { data } = await supabase
          .from('profiles')
          .select('id, name, image, description, location, is_online, premium_verified, updated_at, developer_profiles(skills, hourly_rate, availability, premium_verified)')
          .eq('user_type', 'developer')
          .eq('premium_verified', true)
          .order('updated_at', { ascending: false })
          .limit(4);

        // Fallback: any real developer with a profile if no verified ones yet
        if (!data || data.length === 0) {
          ({ data } = await supabase
            .from('profiles')
            .select('id, name, image, description, location, is_online, premium_verified, updated_at, developer_profiles(skills, hourly_rate, availability, premium_verified)')
            .eq('user_type', 'developer')
            .not('name', 'is', null)
            .order('updated_at', { ascending: false })
            .limit(4));
        }

        if (data && data.length > 0) {
          const mapped: Developer[] = data.map((p: any) => {
            const dp = Array.isArray(p.developer_profiles) ? p.developer_profiles[0] : p.developer_profiles;
            return {
              id: p.id,
              name: p.name || 'Developer',
              image: p.image || '',
              description: p.description || '',
              bio: p.description || '',
              location: p.location || '',
              online: p.is_online || false,
              skills: dp?.skills || [],
              hourlyRate: dp?.hourly_rate || 0,
              minuteRate: 0,
              rating: null,
              experience: '',
              category: '',
              premiumVerified: p.premium_verified || false,
              featured: false,
              availability: dp?.availability || false,
              lastActive: '',
            } as Developer;
          });
          setDevelopers(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch developers for landing page:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealDevelopers();
  }, []);

  return (
    <Layout>
      <Hero />
      <DeveloperShowcase developers={developers} isLoading={isLoading} />
      <PainPointsSection />
      <HowItWorksSection />
      <TargetAudienceSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
