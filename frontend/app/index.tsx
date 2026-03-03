import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Text } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) return <Text>Loading...</Text>;
  
  if (user) {
    return <Redirect href="/(tabs)" />;
  }
  
  return <Redirect href="/(auth)/login" />;
}