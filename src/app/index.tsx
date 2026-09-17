import { Redirect } from 'expo-router';
import { useAppState } from '@/state/app-state';
export default function Index() {
  const { state } = useAppState();
  return <Redirect href={state.musicService ? '/home' : '/onboarding'} />;
}
