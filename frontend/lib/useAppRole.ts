'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { apiService, AppUser } from '@/lib/api';

export function useAppRole() {
  const { isLoaded, user } = useUser();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = async () => {
      if (!isLoaded) {
        return;
      }
      if (!user) {
        setAppUser(null);
        setReady(true);
        return;
      }

      try {
        const synced = await apiService.syncUser({
          clerkUserId: user.id,
          name: user.fullName || 'Bus User',
          email: user.primaryEmailAddress?.emailAddress || '',
          phone: user.primaryPhoneNumber?.phoneNumber
        });
        setAppUser(synced);
      } catch {
        setAppUser(null);
      } finally {
        setReady(true);
      }
    };

    void sync();
  }, [isLoaded, user]);

  return {
    isLoaded,
    user,
    appUser,
    role: appUser?.role ?? null,
    ready
  };
}

