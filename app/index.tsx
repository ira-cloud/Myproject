import { useEffect } from 'react';
import { router } from 'expo-router';
import { getRepositories } from '@/db/client';
import { getInitialRoute } from '@/navigation/getInitialRoute';

export default function Index() {
  useEffect(() => {
    const repos = getRepositories();
    const disclaimerAccepted = repos.settings.getBool('disclaimer_accepted');
    const hasProfile = Boolean(repos.userProfile.get());
    router.replace(getInitialRoute(disclaimerAccepted, hasProfile));
  }, []);
  return null;
}
