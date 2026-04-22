import { useState, useCallback } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { OAUTH_SCOPES } from '../config';
import { getUserEmail } from '../api/sheets';
import type { AuthState } from '../types';

export function useAuth(): AuthState {
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem('gtoken');
  });
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return sessionStorage.getItem('gemail');
  });

  const login = useGoogleLogin({
    scope: OAUTH_SCOPES,
    onSuccess: async (response) => {
      const t = response.access_token;
      sessionStorage.setItem('gtoken', t);
      setToken(t);
      const email = await getUserEmail(t);
      sessionStorage.setItem('gemail', email);
      setUserEmail(email);
    },
    onError: (err) => {
      console.error('Google login error', err);
    },
  });

  const signIn = useCallback(() => {
    login();
  }, [login]);

  const signOut = useCallback(() => {
    googleLogout();
    sessionStorage.removeItem('gtoken');
    sessionStorage.removeItem('gemail');
    setToken(null);
    setUserEmail(null);
  }, []);

  return { token, userEmail, signIn, signOut };
}
