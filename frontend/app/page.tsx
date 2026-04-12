'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { apiService, AppUser } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const [error, setError] = useState('');

  useEffect(() => {
    const syncAndRoute = async () => {
      if (!isLoaded || !user) {
        return;
      }

      try {
        const appUser: AppUser = await apiService.syncUser({
          clerkUserId: user.id,
          name: user.fullName || 'Bus User',
          email: user.primaryEmailAddress?.emailAddress || '',
          phone: user.primaryPhoneNumber?.phoneNumber
        });

        if (appUser.role === 'admin') {
          router.replace('/admin');
          return;
        }

        router.replace('/dashboard');
      } catch {
        setError('Failed to initialize your account. Please try again.');
      }
    };

    void syncAndRoute();
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-xl rounded-2xl border border-orange-200 p-8 text-center shadow-sm">
          <h1 className="text-4xl font-bold text-gray-900">Bus Ticketing</h1>
          <p className="mt-3 text-gray-600">
            Sign in with Google (Clerk) to continue to your dashboard.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <SignInButton mode="modal">
              <button className="px-5 py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-5 py-3 rounded-lg border border-orange-300 text-orange-700 font-semibold hover:bg-orange-50">
                Sign Up
              </button>
            </SignUpButton>
          </div>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <p className="text-gray-600">Redirecting...</p>
    </div>
  );
}
