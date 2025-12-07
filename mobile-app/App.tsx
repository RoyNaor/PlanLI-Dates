import './src/i18n';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { DateResultsScreen } from './src/screens/DateResultsScreen';
import { MainTabs } from './src/navigation/MainTabs'; 
import { auth } from './src/config/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ActivityIndicator, View } from 'react-native';
import { PlaceDetailsScreen } from './src/screens/PlaceDetailsScreen'; 
import { colors } from './src/theme/styles';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // משתמש מחובר: נכנס לטאבים הראשיים
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            {/* תוצאות הדייט הן מסך מלא ש"קופץ" מעל הטאבים */}
            <Stack.Screen 
                name="DateResults" 
                component={DateResultsScreen} 
                options={{ presentation: 'modal' }} 
            />
            <Stack.Screen 
                name="PlaceDetails" 
                component={PlaceDetailsScreen} 
                options={{ headerShown: false }} 
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}