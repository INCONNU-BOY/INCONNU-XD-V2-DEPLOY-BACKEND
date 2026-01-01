import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

// Context
import { AuthContext } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';

import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
import CreateServerScreen from '../screens/main/CreateServerScreen';

import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminUsers from '../screens/admin/AdminUsers';
import AdminServers from '../screens/admin/AdminServers';
import AdminLogs from '../screens/admin/AdminLogs';

import Sidebar from '../components/layout/Sidebar';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

/* ---------- Tabs ---------- */

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeScreen}
      options={{ tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} /> }}
    />
    <Tab.Screen name="Dashboard" component={DashboardScreen}
      options={{ tabBarIcon: ({ color, size }) => <Icon name="view-dashboard" size={size} color={color} /> }}
    />
    <Tab.Screen name="Create" component={CreateServerScreen}
      options={{ tabBarIcon: ({ color, size }) => <Icon name="plus-circle" size={size} color={color} /> }}
    />
    <Tab.Screen name="Profile" component={ProfileScreen}
      options={{ tabBarIcon: ({ color, size }) => <Icon name="account" size={size} color={color} /> }}
    />
  </Tab.Navigator>
);

const AdminTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="AdminHome" component={AdminDashboard}
      options={{ tabBarIcon: ({ color, size }) => <Icon name="shield-account" size={size} color={color} /> }}
    />
    <Tab.Screen name="AdminUsers" component={AdminUsers}
      options={{ tabBarIcon: ({ color, size }) => <Icon name="account-group" size={size} color={color} /> }}
    />
    <Tab.Screen name="AdminServers" component={AdminServers}
      options={{ tabBarIcon: ({ color, size }) => <Icon name="server-network" size={size} color={color} /> }}
    />
    <Tab.Screen name="AdminLogs" component={AdminLogs}
      options={{ tabBarIcon: ({ color, size }) => <Icon name="file-document" size={size} color={color} /> }}
    />
  </Tab.Navigator>
);

/* ---------- Drawer ---------- */

const DrawerNav = () => {
  const { user } = useContext(AuthContext);

  return (
    <Drawer.Navigator drawerContent={(props) => <Sidebar {...props} />} screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Main" component={MainTabs} />
      {user?.isAdmin && <Drawer.Screen name="Admin" component={AdminTabs} />}
    </Drawer.Navigator>
  );
};

/* ---------- Root ---------- */

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: 'white' }}>Loading user...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        </>
      ) : !user.emailVerified ? (
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      ) : (
        <Stack.Screen name="App" component={DrawerNav} />
      )}
    </Stack.Navigator>
  );
}
