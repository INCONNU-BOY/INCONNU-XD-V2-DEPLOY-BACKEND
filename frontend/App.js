import React, { useEffect, useState } from 'react';
import { Platform, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import FlashMessage from 'react-native-flash-message';
import * as SplashScreen from 'expo-splash-screen';

// Context Providers
import { AuthProvider } from './src/context/AuthContext';
import { ServerProvider } from './src/context/ServerContext';
import { ThemeProvider } from './src/context/ThemeContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Splash screen ONLY mobile
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // preload if needed
      } catch (e) {
        console.warn('App preparation error:', e);
      } finally {
        setAppIsReady(true);
        if (Platform.OS !== 'web') {
          await SplashScreen.hideAsync();
        }
      }
    }
    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: 'white' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AuthProvider>
            <ServerProvider>
              <NavigationContainer>
                <StatusBar style="light" />
                <AppNavigator />
                <FlashMessage position="top" />
              </NavigationContainer>
            </ServerProvider>
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
    }
