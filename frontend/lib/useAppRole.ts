'use client';

import { useAppAuth } from './auth-context';

export function useAppRole() {
  return useAppAuth();
}
