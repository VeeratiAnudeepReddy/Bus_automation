'use client';

import { createContext, useContext } from 'react';
import type { AppUser } from './api';
import type { AppRole } from './roles';

export type ClerkUserLike = {
  id?: string;
  fullName?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  primaryPhoneNumber?: { phoneNumber?: string | null } | null;
};

export type AuthGateStatus = 'checking' | 'network_error' | 'signed_out' | 'needs_setup' | 'no_app_account' | 'needs_profile' | 'ready';

export type AppAuthContextValue = {
  isLoaded: boolean;
  user: ClerkUserLike | null | undefined;
  appUser: AppUser | null;
  role: AppRole | null;
  ready: boolean;
  status: AuthGateStatus;
  authError: string | null;
  getToken: () => Promise<string | null>;
  refreshAuth: () => Promise<void>;
};

export const AppAuthContext = createContext<AppAuthContextValue | null>(null);

export function useAppAuth() {
  const context = useContext(AppAuthContext);
  if (!context) {
    throw new Error('useAppAuth must be used inside AuthGate');
  }
  return context;
}
