import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'

export function useAuthCache() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Cache user profile data
  const userProfile = useQuery({
    queryKey: ['user-profile', user?.uid],
    queryFn: async () => {
      if (!user) return null
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: 'emailVerified' in user ? user.emailVerified : true,
      }
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Cache authentication state
  const authState = useQuery({
    queryKey: ['auth-state'],
    queryFn: async () => ({
      isAuthenticated: !!user,
      isLoading: false,
      user: user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      } : null,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Invalidate cache on auth changes
  const invalidateAuthCache = () => {
    queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    queryClient.invalidateQueries({ queryKey: ['auth-state'] })
    queryClient.invalidateQueries({ queryKey: ['user-orders'] })
    queryClient.invalidateQueries({ queryKey: ['user-addresses'] })
  }

  return {
    userProfile: userProfile.data,
    authState: authState.data,
    isLoading: userProfile.isLoading || authState.isLoading,
    invalidateAuthCache,
  }
}
