import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  // During development, allow missing env vars for now
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Warning: Missing Supabase environment variables. Some features will not work.');
  } else {
    throw new Error('Missing Supabase environment variables');
  }
}

// Server-side client with service role key for admin operations
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Helper function to get user from JWT token
export const getUserFromToken = async (authHeader: string) => {
  if (!supabaseAdmin || !authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          university: string | null;
          bio: string | null;
          profile_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          university?: string | null;
          bio?: string | null;
          profile_image?: string | null;
        };
        Update: {
          full_name?: string | null;
          university?: string | null;
          bio?: string | null;
          profile_image?: string | null;
        };
      };
      clubs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: string;
          location: string;
          profile_image: string | null;
          website: string | null;
          contact_email: string | null;
          member_count: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          type: string;
          location: string;
          profile_image?: string | null;
          website?: string | null;
          contact_email?: string | null;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          location?: string;
          profile_image?: string | null;
          website?: string | null;
          contact_email?: string | null;
        };
      };
      club_memberships: {
        Row: {
          id: string;
          club_id: string;
          user_id: string;
          role: 'member' | 'manager';
          status: 'pending' | 'approved' | 'denied';
          requested_at: string;
          approved_at: string | null;
          message: string | null;
        };
        Insert: {
          club_id: string;
          user_id: string;
          role?: 'member' | 'manager';
          status?: 'pending' | 'approved' | 'denied';
          message?: string | null;
        };
        Update: {
          role?: 'member' | 'manager';
          status?: 'pending' | 'approved' | 'denied';
          approved_at?: string | null;
        };
      };
      activities: {
        Row: {
          id: string;
          title: string;
          type: string;
          date: string;
          time: string;
          location: string;
          meetup_location: string;
          max_participants: number | null;
          special_comments: string | null;
          difficulty: string | null;
          club_id: string | null;
          organizer_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          type: string;
          date: string;
          time: string;
          location: string;
          meetup_location: string;
          max_participants?: number | null;
          special_comments?: string | null;
          difficulty?: string | null;
          club_id?: string | null;
          organizer_id: string;
        };
        Update: {
          title?: string;
          type?: string;
          date?: string;
          time?: string;
          location?: string;
          meetup_location?: string;
          max_participants?: number | null;
          special_comments?: string | null;
          difficulty?: string | null;
          club_id?: string | null;
        };
      };
    };
  };
}
