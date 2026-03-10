import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { ActivityIndicator } from 'react-native';
import { colors } from '../../theme';

export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <ActivityIndicator size="large" color={colors.accentBlue} />;
  }
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Products',
          tabBarLabel: 'Products'
        }} 
      />
      <Tabs.Screen 
        name="cart" 
        options={{ 
          title: 'Cart',
          tabBarLabel: 'Cart'
        }} 
      />
      <Tabs.Screen 
        name="revenue" 
        options={{ 
          title: 'Revenue',
          tabBarLabel: 'Revenue'
        }} 
      />
    </Tabs>
  );
}