import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserRole, Profile } from '../../types';
import { supabase, isRealSupabaseConfigured } from '../../lib/supabase';

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<Profile>;
  signup: (email: string, pass: string, fullName: string, role: UserRole, phone?: string) => Promise<Profile>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>({
    id: 'usr-customer-1',
    role: 'customer',
    full_name: 'Priya Sharma (Demo)',
    phone: '+91 98765 00001'
  });
  const [role, setRole] = useState<UserRole>('customer');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      if (isRealSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser(profile);
              setRole(profile.role);
            }
          }
        } catch (e) {
          console.error('Error fetching Supabase session', e);
        }
      }
      setIsLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<Profile> => {
    setIsLoading(true);
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) {
        setIsLoading(false);
        throw new Error(error.message);
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      setUser(profile);
      setRole(profile.role);
      setIsLoading(false);
      return profile;
    } else {
      // Mock Login Engine: determine role from email or default
      let targetRole: UserRole = 'customer';
      let name = 'Customer User';
      let id = `usr-${Date.now()}`;

      if (email.toLowerCase() === 'tejapothuru94413@gmail.com' || email.includes('admin')) {
        targetRole = 'admin';
        name = 'Teja Pothuru (Master Admin)';
        id = 'usr-admin-1';
      } else if (email.includes('owner')) {
        targetRole = 'owner';
        name = 'Rajesh Kumar (Owner)';
        id = 'usr-owner-1';
      }

      const mockUser: Profile = {
        id,
        role: targetRole,
        full_name: name,
        phone: '+91 98765 43210'
      };

      setUser(mockUser);
      setRole(targetRole);
      setIsLoading(false);
      return mockUser;
    }
  };

  const signup = async (
    email: string,
    pass: string,
    fullName: string,
    requestedRole: UserRole,
    phone?: string
  ): Promise<Profile> => {
    setIsLoading(true);
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { full_name: fullName, role: requestedRole, phone }
        }
      });
      if (error) {
        setIsLoading(false);
        throw new Error(error.message);
      }

      // Insert profile into database
      const newProfile: Profile = {
        id: data.user!.id,
        role: requestedRole,
        full_name: fullName,
        phone: phone || null
      };

      await supabase.from('profiles').insert(newProfile);
      setUser(newProfile);
      setRole(requestedRole);
      setIsLoading(false);
      return newProfile;
    } else {
      const mockUser: Profile = {
        id: `usr-${Date.now()}`,
        role: requestedRole,
        full_name: fullName,
        phone: phone || null
      };
      setUser(mockUser);
      setRole(requestedRole);
      setIsLoading(false);
      return mockUser;
    }
  };

  const logout = async () => {
    if (isRealSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setRole('customer');
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (user) {
      setUser({
        ...user,
        role: newRole,
        full_name: newRole === 'admin' ? 'System Admin' : newRole === 'owner' ? 'Shop Owner' : 'Customer User'
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, login, signup, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
