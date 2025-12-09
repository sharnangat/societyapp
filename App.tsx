/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [screen, setScreen] = useState<'login' | 'register'>('login');

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

export default App;
