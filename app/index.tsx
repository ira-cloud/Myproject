import { Redirect } from 'expo-router';
import { getRepositories } from '@/db/client';
import { getInitialRoute } from '@/navigation/getInitialRoute';

export default function Index() {
  const repos = getRepositories();
  const disclaimerAccepted = repos.settings.getBool('disclaimer_accepted');
  const hasProfile = Boolean(repos.userProfile.get());
  return <Redirect href={getInitialRoute(disclaimerAccepted, hasProfile)} />;
}
