import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;

      // Auto-heal missing profile for existing accounts
      if (!data && userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([{ 
               id: user.id, 
               email: user.email, 
               full_name: user.user_metadata?.full_name,
               avatar_url: user.user_metadata?.avatar_url
            }])
            .select()
            .single();
            
          if (!insertError) data = newProfile;
        }
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  };

  useEffect(() => {
    let active = true;
    let isInitial = true;

    const handleAuthChange = async (session) => {
      if (!active) return;
      const authUser = session?.user ?? null;
      setUser(authUser);

      if (authUser) {
        const profileData = await fetchProfile(authUser.id);
        if (active) {
          setProfile(profileData);
        }
      } else {
        if (active) {
          setProfile(null);
        }
      }

      if (active) {
        setLoading(false);
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isInitial) {
        isInitial = false;
        handleAuthChange(session);
      }
    }).catch((err) => {
      console.error("Error getting initial session:", err);
      if (active) {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setTimeout(() => {
        if (!active) return;
        if (event === 'INITIAL_SESSION' && !isInitial) {
          return;
        }
        isInitial = false;
        handleAuthChange(session);
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = (email, password, fullName, phone) => {
    return supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    });
  };

  const login = (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signInWithGoogle = () => {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
  };

  const logout = () => {
    return supabase.auth.signOut();
  };

  const updateProfile = async (updates) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const value = {
    user,
    profile,
    signUp,
    login,
    signInWithGoogle,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
          <img src="/logo.png" alt="Spendi" className="w-12 h-12 object-contain filter invert brightness-0 animate-pulse" />
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white/40 w-1/2 animate-[progress_1.5s_ease-in-out_infinite]"></div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
