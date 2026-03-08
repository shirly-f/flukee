import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import MessagesScreen from '../screens/MessagesScreen';
import { theme } from '../theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const { colors, typography } = theme;

function MainTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.sage,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.warmWhite,
          borderTopColor: colors.creamDark,
          borderTopWidth: 1,
          paddingTop: 12,
          height: 88,
        },
        tabBarLabelStyle: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 13,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t('dashboard.home'), tabBarLabel: t('dashboard.home') }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ title: t('messages.messages'), tabBarLabel: t('messages.messages') }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="TaskDetail"
            component={TaskDetailScreen}
            options={{
              headerShown: true,
              headerTitle: '',
              headerBackTitle: t('common.back'),
              headerStyle: {
                backgroundColor: colors.cream,
              },
              headerTintColor: colors.sage,
              headerTitleStyle: {
                fontFamily: 'PlayfairDisplay_600SemiBold',
                fontSize: 18,
              },
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
