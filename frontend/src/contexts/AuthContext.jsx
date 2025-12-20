import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  useLoginMutation,
  useCurrentUserQuery,
} from '../store/services/authApi';
import { logout as logoutAction, setUser } from '../store/slices/authSlice';

// Compatibility wrapper to keep existing imports; no longer provides context.
export const AuthProvider = ({ children }) => children;

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, status, error } = useAppSelector((s) => s.auth);

  const {
    isFetching: currentUserLoading,
    refetch: refetchCurrentUser,
  } = useCurrentUserQuery(undefined, {
    skip: !token || isAuthenticated,
  });

  const [loginMutation, { isLoading: loginLoading }] = useLoginMutation();

  const login = async (email, password) => {
    try {
      await loginMutation({ email, password }).unwrap();
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error?.data?.message || error?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    dispatch(setUser(userData));
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (!user.permissions) return false;
    return user.permissions.includes(permission);
  };

  return {
    user,
    token,
    isAuthenticated,
    loading: status === 'loading' || currentUserLoading || loginLoading,
    error,
    login,
    logout,
    updateUser,
    hasPermission,
    refetchCurrentUser,
  };
};
