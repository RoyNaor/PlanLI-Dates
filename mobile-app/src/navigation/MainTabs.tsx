import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DateSetupScreen } from '../screens/DateSetupScreen';
import { SavedDatesScreen } from '../screens/SavedDatesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ChatScreen } from '../screens/ChatScreen'; // <--- 1. ייבוא חדש
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/styles';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator();

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
            height: Platform.OS === 'ios' ? 85 : 65,
            paddingBottom: Platform.OS === 'ios' ? 25 : 10,
            paddingTop: 10,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
            elevation: 8
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Plan') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Saved') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* סדר הטאבים */}
      <Tab.Screen 
        name="Saved" 
        component={SavedDatesScreen} 
        options={{ title: '' }} 
      />
      
      <Tab.Screen 
        name="Plan" 
        component={DateSetupScreen} 
        options={{ title: '' }} 
      />

      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ title: '' }} 
      />

      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: '' }} 
      />
    </Tab.Navigator>
  );
};