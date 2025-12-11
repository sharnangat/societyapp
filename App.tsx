/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { ActivityIndicator, StatusBar, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';

function AppContent() {
  const isDarkMode = useColorScheme() === 'dark';
  const [screen, setScreen] = useState<'login' | 'register'>('login');
  const { isAuthenticated, isLoading, user, token } = useAuth();

  React.useEffect(() => {
    console.log('=== APP CONTENT DEBUG ===');
    console.log('isLoading:', isLoading);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('Current screen:', screen);
    console.log('User:', user ? JSON.stringify(user, null, 2) : 'null');
    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'null');
  }, [isLoading, isAuthenticated, screen, user, token]);

  if (isLoading) {
    console.log('Rendering loading screen');
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (isAuthenticated) {
    console.log('Rendering HomeScreen - user is authenticated');
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <HomeScreen isDarkMode={isDarkMode} />
      </SafeAreaProvider>
    );
  }
  
  console.log('Rendering auth screen (login/register)');

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {screen === 'login' ? (
        <LoginScreen
          isDarkMode={isDarkMode}
          onSwitchToRegister={() => setScreen('register')}
        />
      ) : (
        <RegisterScreen
          isDarkMode={isDarkMode}
          onSwitchToLogin={() => setScreen('login')}
        />
      )}
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
