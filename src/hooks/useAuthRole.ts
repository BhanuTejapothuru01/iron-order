import { useAuth } from '../features/auth/AuthContext';

export function useAuthRole() {
  const { user, role, isLoading } = useAuth();

  return {
    profile: user,
    role,
    loading: isLoading,
    isCustomer: role === 'customer',
    isOwner: role === 'owner',
    isAdmin: role === 'admin',
  };
}
