'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiService, type AppUser } from '@/lib/api';
import { AppAuthContext, type AuthGateStatus } from '@/lib/auth-context';
import { canAccessPath, dashboardForRole } from '@/lib/roles';

const publicPrefixes = ['/', '/sign-in', '/sign-up', '/register', '/accept-invite', '/setup', '/help', '/403'];
const authFlowPrefixes = ['/register', '/choose-account', '/accept-invite', '/setup', '/complete-profile'];
const accountCreationPrefixes = ['/register', '/choose-account', '/accept-invite', '/setup', '/organizations/new'];

function isExactOrNested(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isPublicPath(pathname: string) {
  return publicPrefixes.some((prefix) => (prefix === '/' ? pathname === '/' : isExactOrNested(pathname, prefix)));
}

function isAuthFlowPath(pathname: string) {
  return authFlowPrefixes.some((prefix) => isExactOrNested(pathname, prefix));
}

function destinationForState(status: AuthGateStatus, appUser: AppUser | null) {
  if (status === 'signed_out') return '/sign-in';
  if (status === 'needs_setup') return '/setup';
  if (status === 'no_app_account') return '/register';
  if (status === 'needs_profile') return '/complete-profile';
  if (status === 'ready') return dashboardForRole(appUser?.role ?? null);
  return null;
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const userId = user?.id ?? null;
  const { getToken } = useAuth();
  const [status, setStatus] = useState<AuthGateStatus>('checking');
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const lastRedirectRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  const resolveAuthState = useCallback(async () => {
    if (!isLoaded) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setStatus('checking');
    setAuthError(null);

    try {
      const platform = await apiService.getPlatformStatus();
      if (requestIdRef.current !== requestId) return;

      if (platform.needsSetup) {
        setAppUser(null);
        setStatus('needs_setup');
        return;
      }

      if (!userId) {
        setAppUser(null);
        setStatus('signed_out');
        return;
      }

      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token');

      const current = await apiService.getCurrentUser(token);
      if (requestIdRef.current !== requestId) return;

      if (!current.user) {
        setAppUser(null);
        setStatus('no_app_account');
        return;
      }

      setAppUser(current.user);
      setStatus(current.user.profileComplete ? 'ready' : 'needs_profile');
    } catch (error) {
      if (requestIdRef.current !== requestId) return;
      setAuthError(error instanceof Error ? error.message : 'Unable to contact server');
      setStatus('network_error');
    }
  }, [getToken, isLoaded, userId]);

  useEffect(() => {
    void resolveAuthState();
  }, [resolveAuthState]);

  useEffect(() => {
    lastRedirectRef.current = null;
  }, [pathname]);

  useEffect(() => {
    if (!isLoaded || status === 'checking' || status === 'network_error') return;

    const publicPath = isPublicPath(pathname);
    const authFlowPath = isAuthFlowPath(pathname);
    const accountCreationPath = accountCreationPrefixes.some((prefix) => isExactOrNested(pathname, prefix));
    const desired = destinationForState(status, appUser);
    let destination: string | null = null;

    if (status === 'signed_out') {
      destination = publicPath ? null : desired;
    } else if (status === 'needs_setup') {
      destination = pathname.startsWith('/setup') || pathname.startsWith('/sign-') ? null : desired;
    } else if (status === 'no_app_account') {
      destination = accountCreationPath ? null : desired;
    } else if (status === 'needs_profile') {
      destination = pathname.startsWith('/complete-profile') ? null : desired;
    } else if (status === 'ready') {
      if (pathname === '/' || pathname === '/dashboard' || authFlowPath) {
        destination = desired;
      } else if (!publicPath && !canAccessPath(appUser?.role ?? null, pathname)) {
        destination = '/403';
      }
    }

    if (!destination || destination === pathname || lastRedirectRef.current === `${pathname}->${destination}`) return;
    lastRedirectRef.current = `${pathname}->${destination}`;
    router.replace(destination);
  }, [appUser, isLoaded, pathname, router, status]);

  const value = useMemo(
    () => ({
      isLoaded,
      user,
      appUser,
      role: appUser?.role ?? null,
      ready: status !== 'checking',
      status,
      authError,
      getToken,
      refreshAuth: resolveAuthState
    }),
    [appUser, authError, getToken, isLoaded, resolveAuthState, status, user]
  );

  if (status === 'checking') {
    return (
      <AppAuthContext.Provider value={value}>
        <div className="min-h-screen bg-[#f6f6f6] px-4 py-8">
          <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-600">Checking your session...</p>
          </div>
        </div>
      </AppAuthContext.Provider>
    );
  }

  if (status === 'network_error') {
    return (
      <AppAuthContext.Provider value={value}>
        <div className="min-h-screen bg-[#f6f6f6] px-4 py-8">
          <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase text-zinc-500">Authentication unavailable</p>
            <h1 className="mt-2 text-xl font-semibold text-zinc-900">Unable to contact server.</h1>
            <p className="mt-2 text-sm text-zinc-600">Your current page was not changed. Retry when the backend is reachable.</p>
            {authError ? <p className="mt-3 rounded-xl bg-zinc-100 p-3 text-xs text-zinc-600">{authError}</p> : null}
            <button
              type="button"
              onClick={() => void resolveAuthState()}
              className="mt-4 w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white"
            >
              Retry
            </button>
          </div>
        </div>
      </AppAuthContext.Provider>
    );
  }

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}
