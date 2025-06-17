import React, { useState, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserProfileProps {
  onNavigate?: (section: string) => void;
}

export default function UserProfile({ onNavigate }: UserProfileProps) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        
        // Check if this is a multiple rows error (data integrity issue)
        if (fetchError.code === 'PGRST116') {
          console.error('CRITICAL: Multiple profiles found for user ID:', user.id);
          console.error('This indicates a data integrity issue that needs to be resolved.');
          
          // Try to get all profiles for this user to understand the issue
          const { data: allProfiles, error: allProfilesError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id);
          
          if (!allProfilesError && allProfiles && allProfiles.length > 0) {
            console.error('Found profiles:', allProfiles);
            // Use the first profile as a fallback, but log this decision
            console.warn('Using first profile as fallback due to multiple profiles');
            setProfile(allProfiles[0]);
          }
        }
        return;
      }

      if (profileData) {
        // Profile exists, use it
        setProfile(profileData);
      } else {
        // No profile exists, create a basic one from auth user data
        console.log('No profile found, creating new profile for user:', user.id);
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            user_id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            role: 'user'
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
        } else {
          setProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
  };

  const handleSettingsClick = () => {
    onNavigate?.('settings');
    setShowDropdown(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'manager':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'sales':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'manager':
        return '👔';
      case 'sales':
        return '💼';
      default:
        return '👤';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div className="hidden sm:block">
          <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Guest User</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <img
          src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=3B82F6&color=fff`}
          alt={profile.name}
          className="w-8 h-8 rounded-full"
        />
        <div className="hidden sm:block text-left">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {profile.name}
            </p>
            <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full ${getRoleColor(profile.role)}`}>
              <span className="mr-1">{getRoleIcon(profile.role)}</span>
              {profile.role}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {profile.department || 'No department'}
          </p>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
            {/* User Info Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <img
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=3B82F6&color=fff`}
                  alt={profile.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {profile.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {profile.email}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(profile.role)}`}>
                      <span className="mr-1">{getRoleIcon(profile.role)}</span>
                      {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button
                onClick={handleSettingsClick}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Account Settings</span>
              </button>
              
              <hr className="my-2 border-gray-200 dark:border-gray-600" />
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Footer Info */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Signed in as</span>
                <span className="font-medium">{profile.role}</span>
              </div>
              {profile.department && (
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Department</span>
                  <span className="font-medium">{profile.department}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}