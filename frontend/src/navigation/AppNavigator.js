import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Context
import { AuthContext } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
import ServerScreen from '../screens/main/ServerScreen';
import CreateServerScreen from '../screens/main/CreateServerScreen';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminUsers from '../screens/admin/AdminUsers';
import AdminServers from '../screens/admin/AdminServers';
import AdminLogs from '../screens/admin/AdminLogs';

// Custom Components
import Sidebar from '../components/layout/Sidebar';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateServerScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="plus-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Admin Tab Navigator
const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: '#f59e0b',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="AdminHome"
        component={AdminDashboard}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Icon name="shield-account" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AdminUsers"
        component={AdminUsers}
        options={{
          tabBarLabel: 'Users',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AdminServers"
        component={AdminServers}
        options={{
          tabBarLabel: 'Servers',
          tabBarIcon: ({ color, size }) => (
            <Icon name="server-network" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AdminLogs"
        component={AdminLogs}
        options={{
          tabBarLabel: 'Logs',
          tabBarIcon: ({ color, size }) => (
            <Icon name="file-document" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main Drawer Navigator
const MainDrawerNavigator = () => {
  const { user } = useContext(AuthContext);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <Sidebar {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#0f172a',
          width: 300,
        },
        drawerActiveTintColor: '#667eea',
        drawerInactiveTintColor: '#94a3b8',
        drawerLabelStyle: {
          fontSize: 14,
          fontWeight: '500',
          marginLeft: -16,
        },
        drawerItemStyle: {
          borderRadius: 10,
          marginVertical: 4,
          marginHorizontal: 8,
        },
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          drawerLabel: 'Home',
          drawerIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      
      {user?.isAdmin && (
        <Drawer.Screen
          name="AdminTabs"
          component={AdminTabNavigator}
          options={{
            drawerLabel: 'Admin Panel',
            drawerIcon: ({ color, size }) => (
              <Icon name="shield-account" size={size} color={color} />
            ),
          }}
        />
      )}
    </Drawer.Navigator>
  );
};

// App Navigator
const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#0f172a' },
      }}
    >
      {!user ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        </>
      ) : !user.emailVerified ? (
        // Email Verification
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      ) : (
        // Main App
        <Stack.Screen name="Main" component={MainDrawerNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
