
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import Layout from '../components/Layout';
import { Badge } from '../components/ui/badge';
import { Clock, MapPin, Calendar, Star, BadgeCheck, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { useDeveloperProfile } from '../hooks/useDeveloperProfile';
import DeveloperProfileCard from '../components/profile/DeveloperProfileCard';
import ProfileLoadingState from '../components/profile/ProfileLoadingState';
import ProfileErrorState from '../components/profile/ProfileErrorState';
import { useAuth, logoutUser } from '../contexts/auth';
import { getSessionsHistoryPage } from '../utils/navigationUtils';
import { Developer } from '../types/product';

const DeveloperProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { userId, userType } = useAuth();
  const location = useLocation();
  const isEditing = location.pathname.includes('/edit');
  const isOwnProfile = id === userId;

  // Hook for own profile editing — always called (React rules)
  const ownProfile = useDeveloperProfile();

  // State for public (third-party) profile view
  const [publicDeveloper, setPublicDeveloper] = useState<Developer | null>(null);
  const [publicLoading, setPublicLoading] = useState(!isOwnProfile);
  const [publicError, setPublicError] = useState(false);

  useEffect(() => {
    if (isOwnProfile || !id) return;

    let cancelled = false;
    setPublicLoading(true);
    setPublicError(false);

    const fetchPublicProfile = async () => {
      try {
        // Fetch base profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (profileError || !profile) {
          if (!cancelled) setPublicError(true);
          return;
        }

        // Attempt to fetch developer-specific data (may not exist)
        const { data: devProfile } = await supabase
          .from('developer_profiles')
          .select('*')
          .eq('user_id', id)
          .maybeSingle();

        if (!cancelled) {
          setPublicDeveloper({
            id: profile.id,
            name: profile.name || 'Developer',
            image: profile.image || '',
            description: profile.description || devProfile?.bio || '',
            bio: devProfile?.bio || profile.description || '',
            location: profile.location || '',
            skills: devProfile?.skills || profile.skills || [],
            hourlyRate: devProfile?.hourly_rate ?? 0,
            minuteRate: devProfile?.minute_rate ?? 0,
            experience: devProfile?.experience || '',
            category: devProfile?.category || '',
            rating: devProfile?.rating ?? profile.rating ?? null,
            online: profile.is_online || false,
            availability: devProfile?.availability ?? profile.availability ?? false,
            featured: profile.featured || false,
            premiumVerified: profile.premium_verified || false,
            lastActive: profile.last_active || '',
          } as Developer);
        }
      } catch {
        if (!cancelled) setPublicError(true);
      } finally {
        if (!cancelled) setPublicLoading(false);
      }
    };

    fetchPublicProfile();
    return () => { cancelled = true; };
  }, [id, isOwnProfile]);

  // Resolve which data to show
  const developer = isOwnProfile ? ownProfile.developer : publicDeveloper;
  const isLoading = isOwnProfile ? ownProfile.isLoading : publicLoading;
  const hasError = isOwnProfile ? ownProfile.loadingTimeoutReached : publicError;

  if (isLoading) {
    return <ProfileLoadingState onForceLogout={logoutUser} />;
  }

  if (hasError) {
    return (
      <ProfileErrorState
        title={isOwnProfile ? 'Profile Loading Timeout' : 'Profile Not Found'}
        message={
          isOwnProfile
            ? 'Profile data loading timeout. Please try again or log out and back in.'
            : 'This developer profile could not be found.'
        }
        onRetry={isOwnProfile ? ownProfile.refreshProfile : undefined}
        onForceLogout={logoutUser}
      />
    );
  }

  if (!developer) {
    return (
      <ProfileErrorState
        title="Profile Not Found"
        message="Developer profile could not be found."
        onForceLogout={logoutUser}
      />
    );
  }

  const sessionsHistoryPath = getSessionsHistoryPage(userType);

  // Own profile in edit mode
  if (isEditing && isOwnProfile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold">Edit Profile</h1>
              <Link to={`/developer-profiles/${id}`}>
                <Button variant="ghost">View Public Profile</Button>
              </Link>
            </div>
            <DeveloperProfileCard
              developer={developer}
              formData={ownProfile.formData}
              onInputChange={ownProfile.handleInputChange}
              isSaving={ownProfile.isSaving}
              onSave={ownProfile.handleSaveChanges}
              refreshProfile={ownProfile.refreshProfile}
            />
          </div>
        </div>
      </Layout>
    );
  }

  // Public profile view (own or third-party)
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">
              {isOwnProfile ? 'My Profile' : 'Developer Profile'}
            </h1>
            {isOwnProfile && (
              <div className="flex items-center gap-2">
                <Link to={sessionsHistoryPath}>
                  <Button variant="outline">View All Activity</Button>
                </Link>
                <Link to={`/developer-profiles/${id}/edit`}>
                  <Button>Edit Profile</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={developer.image || '/placeholder.svg'}
                    alt={developer.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
                  />
                </div>

                <div className="flex flex-col gap-3 flex-grow">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-semibold">{developer.name}</h2>
                    {developer.premiumVerified && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <BadgeCheck className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                    {developer.featured && (
                      <Badge className="bg-amber-500 hover:bg-amber-600">Featured</Badge>
                    )}
                  </div>

                  {developer.category && (
                    <p className="text-muted-foreground">{developer.category}</p>
                  )}

                  <div className="flex flex-wrap gap-4 mt-2">
                    {developer.location && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {developer.location}
                      </div>
                    )}

                    {developer.online ? (
                      <div className="flex items-center gap-1.5 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-green-600 dark:text-green-400">Online</span>
                      </div>
                    ) : developer.lastActive ? (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Last active {developer.lastActive}
                      </div>
                    ) : null}

                    {developer.experience && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {developer.experience}
                      </div>
                    )}

                    {developer.rating != null && (
                      <div className="flex items-center gap-1.5 text-sm text-amber-500">
                        <Star className="h-4 w-4 fill-amber-500" />
                        {Number(developer.rating).toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">About</h3>
                  <p className="text-muted-foreground">
                    {developer.bio || developer.description || 'No bio provided.'}
                  </p>
                </div>

                {developer.skills && developer.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {developer.skills.map((skill) => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(developer.hourlyRate > 0 || developer.minuteRate > 0) && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Rates</h3>
                    <div className="flex flex-wrap gap-4">
                      {developer.hourlyRate > 0 && (
                        <div>
                          <span className="font-medium">${developer.hourlyRate}</span>/hour
                        </div>
                      )}
                      {developer.minuteRate > 0 && (
                        <div>
                          <span className="font-medium">${developer.minuteRate}</span>/minute
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!isOwnProfile && (
                  <div className="pt-4">
                    <Button className="w-full md:w-auto">Request Help</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DeveloperProfilePage;
