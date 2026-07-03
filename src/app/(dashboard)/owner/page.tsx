'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OwnerPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/owner/admins');
  }, [router]);

  return null;
}
