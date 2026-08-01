import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Dashboard } from '@/components/Dashboard';
import { getRepositories } from '@/db/client';
import type { UserProfile } from '@/types';

export default function DashboardScreen() {
  // Held in state rather than re-read on every render: a fresh object each
  // render would defeat the memoisation inside <Dashboard/>, and re-reading
  // SQLite on every render buys nothing.
  const [profile] = useState<UserProfile | undefined>(() => getRepositories().userProfile.get());

  // Deep-linking straight to /dashboard before onboarding is finished used to
  // crash on a non-null assertion; send the user back to the start instead.
  useEffect(() => {
    if (!profile) router.replace('/onboarding/disclaimer');
  }, [profile]);

  if (!profile) return null;
  return <Dashboard profile={profile} />;
}
