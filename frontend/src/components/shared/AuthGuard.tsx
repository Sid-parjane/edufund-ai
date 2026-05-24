'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

interface AuthGuardProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function AuthGuard({ children, adminOnly = false }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (adminOnly && user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, adminOnly, router]);

  if (!isAuthenticated) return null;
  if (adminOnly && user?.role !== 'ADMIN') return null;

  return <>{children}</>;
}
