import { useAuth as useAuthContext } from '@/store/AuthContext';

export const useAuth = () => {
  const context = useAuthContext();

  return {
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    loading: context.loading,
    userRole: context.user?.role,
    tenantId: context.user?.tenant_id,
    login: context.login,
    register: context.register,
    logout: context.logout,
    getUser: () => context.user,
  };
};

export default useAuth;
