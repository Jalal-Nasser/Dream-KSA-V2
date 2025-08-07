import { Redirect } from 'expo-router';

export default function Index() {
  // For testing purposes, redirect directly to tabs
  // Remove this and restore login when ready for production
  return <Redirect href="/(tabs)" />;
}
