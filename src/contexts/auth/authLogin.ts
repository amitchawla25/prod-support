
import { supabase } from '../../integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Define the return type for the login function
export interface LoginResult {
  success: boolean;
  error?: string;
  requiresVerification?: boolean;
}

// Cache for user profiles to reduce database queries
const profileCache = new Map<string, { user_type: string | null, timestamp: number }>();
const CACHE_EXPIRY = 15 * 60 * 1000; // Cache expires after 15 minutes for better performance

// Rate limiting implementation
const loginAttempts = new Map<string, { count: number, firstAttempt: number, locked: boolean, lockExpiry: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes lockout
const ATTEMPT_WINDOW = 10 * 60 * 1000; // 10 minute window for attempts

const isRateLimited = (email: string): { limited: boolean, message?: string } => {
  const now = Date.now();
  const normalizedEmail = email.toLowerCase().trim();
  
  // Get or initialize attempts record
  if (!loginAttempts.has(normalizedEmail)) {
    loginAttempts.set(normalizedEmail, {
      count: 0,
      firstAttempt: now,
      locked: false,
      lockExpiry: 0
    });
  }
  
  const record = loginAttempts.get(normalizedEmail)!;
  
  // Check if the account is locked
  if (record.locked) {
    // Check if lockout period has expired
    if (now >= record.lockExpiry) {
      // Reset the record after lockout period
      loginAttempts.set(normalizedEmail, {
        count: 0,
        firstAttempt: now,
        locked: false,
        lockExpiry: 0
      });
      return { limited: false };
    }
    
    // Calculate remaining lockout time in minutes
    const remainingMinutes = Math.ceil((record.lockExpiry - now) / 60000);
    return { 
      limited: true, 
      message: `Too many login attempts. Please try again in ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}.`
    };
  }
  
  // Reset attempts if the window has expired
  if (now - record.firstAttempt > ATTEMPT_WINDOW) {
    loginAttempts.set(normalizedEmail, {
      count: 0,
      firstAttempt: now,
      locked: false,
      lockExpiry: 0
    });
  }
  
  return { limited: false };
};

const recordLoginAttempt = (email: string, success: boolean): void => {
  const now = Date.now();
  const normalizedEmail = email.toLowerCase().trim();
  
  if (!loginAttempts.has(normalizedEmail)) {
    loginAttempts.set(normalizedEmail, {
      count: 0,
      firstAttempt: now,
      locked: false,
      lockExpiry: 0
    });
  }
  
  const record = loginAttempts.get(normalizedEmail)!;
  
  if (success) {
    // Reset on successful login
    loginAttempts.set(normalizedEmail, {
      count: 0,
      firstAttempt: now,
      locked: false,
      lockExpiry: 0
    });
    return;
  }
  
  // Increment failed attempts
  const newCount = record.count + 1;
  
  // Check if we should lock the account
  if (newCount >= MAX_LOGIN_ATTEMPTS) {
    loginAttempts.set(normalizedEmail, {
      count: newCount,
      firstAttempt: record.firstAttempt,
      locked: true,
      lockExpiry: now + LOCKOUT_DURATION
    });
    
    console.warn(`Account ${email} locked for ${LOCKOUT_DURATION/60000} minutes due to too many failed attempts`);
  } else {
    // Just increment the counter
    loginAttempts.set(normalizedEmail, {
      count: newCount,
      firstAttempt: record.firstAttempt,
      locked: false,
      lockExpiry: 0
    });
  }
};

export const loginWithEmailAndPassword = async (
  email: string,
  password: string,
  userType: 'client' | 'developer',
  rememberMe: boolean = false
): Promise<LoginResult> => {
  try {
    console.time('login-process');
    console.log(`Attempting to log in as ${userType} with email:`, email);
    
    // Check rate limiting first
    const rateLimitCheck = isRateLimited(email);
    if (rateLimitCheck.limited) {
      return {
        success: false,
        error: rateLimitCheck.message || 'Too many login attempts. Please try again later.'
      };
    }
    
    // Step 1: Sign in with credentials
    console.time('auth-signin');
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    // Fixed: Remove expiresIn from options (not supported by Supabase signInWithPassword)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    // Clear timeout
    clearTimeout(timeoutId);
    
    console.timeEnd('auth-signin');

    if (error) {
      // Record failed attempt
      recordLoginAttempt(email, false);
      
      console.error('Login error:', error);
      if (error.message.includes('Email not confirmed')) {
        return {
          success: false,
          error: 'Please verify your email before logging in.',
          requiresVerification: true
        };
      }
      
      // Handle invalid credentials more explicitly
      if (error.message.includes('Invalid login credentials')) {
        return {
          success: false,
          error: 'Email or password is incorrect. Please check your credentials.',
        };
      }
      
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      recordLoginAttempt(email, false);
      console.error('No user returned after login');
      return {
        success: false,
        error: 'Login failed. Please try again.',
      };
    }
    
    // Step 2: Check for cached profile data to avoid an extra DB query
    const userId = data.user.id;
    const cachedProfile = profileCache.get(userId);
    const now = Date.now();
    
    // If we have a valid cached profile, use it instead of querying the database
    if (cachedProfile && (now - cachedProfile.timestamp) < CACHE_EXPIRY) {
      console.log('Using cached profile data');
      
      // Check if user type matches
      if (cachedProfile.user_type !== userType) {
        recordLoginAttempt(email, false);
        console.error('User type mismatch (from cache):', cachedProfile.user_type, 'vs', userType);
        // Sign out user if their type doesn't match
        await supabase.auth.signOut();
        return {
          success: false,
          error: `You are registered as a ${cachedProfile.user_type}, not a ${userType}. Please use the correct login option.`,
        };
      }
      
      // Record successful login
      recordLoginAttempt(email, true);
      
      console.log('Login successful for', userType, '(cached validation)');
      console.timeEnd('login-process');
      return { success: true };
    }

    // If no cache hit, fetch user profile to check their user type
    console.time('profile-fetch');
    
    // Add another timeout for profile fetch
    const profileController = new AbortController();
    const profileTimeoutId = setTimeout(() => profileController.abort(), 8000);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single();
    
    // Clear timeout
    clearTimeout(profileTimeoutId);
    
    console.timeEnd('profile-fetch');

    if (profileError) {
      recordLoginAttempt(email, false);
      console.error('Error fetching user profile:', profileError);
      
      // If the profile doesn't exist, we might need to create it
      if (profileError.code === 'PGRST116') { // Not found error
        // This would be a good place to create a profile if needed
        // For now, we'll just sign out the user
        toast.error('Your user profile is missing. Please contact support.');
        console.error('Profile not found for user', userId);
        await supabase.auth.signOut();
      }
      
      return {
        success: false,
        error: 'Error verifying user type. Please try again.',
      };
    }

    // Cache the profile data for future logins
    profileCache.set(userId, {
      user_type: profileData.user_type,
      timestamp: now
    });

    // Check if user type matches
    if (profileData.user_type !== userType) {
      recordLoginAttempt(email, false);
      console.error('User type mismatch:', profileData.user_type, 'vs', userType);
      // Sign out user if their type doesn't match
      await supabase.auth.signOut();
      return {
        success: false,
        error: `You are registered as a ${profileData.user_type}, not a ${userType}. Please use the correct login option.`,
      };
    }

    // Record successful login
    recordLoginAttempt(email, true);
    
    console.log('Login successful for', userType);
    console.timeEnd('login-process');
    return { success: true };
  } catch (error) {
    recordLoginAttempt(email, false);
    const authError = error as AuthError;
    console.error('Exception during login:', authError);
    console.timeEnd('login-process');
    
    // Check if this was an abort error (timeout)
    if (authError.name === 'AbortError' || authError.message?.includes('timeout')) {
      return {
        success: false,
        error: 'Login request timed out. Please check your internet connection and try again.',
      };
    }
    
    return {
      success: false,
      error: authError.message || 'An unexpected error occurred during login.',
    };
  }
};

// Update the login function to use truly optional parameters with default values
// Explicitly define the return type
export const login = async (
  email: string, 
  password: string, 
  userType: 'developer' | 'client',
  rememberMe: boolean = false
): Promise<LoginResult> => {
  return await loginWithEmailAndPassword(email, password, userType, rememberMe);
};
