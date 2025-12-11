import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id?: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@societyapp:token';
const USER_KEY = '@societyapp:user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored auth data on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    console.log('=== LOADING STORED AUTH ===');
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      console.log('Stored token found:', storedToken ? 'YES' : 'NO');
      console.log('Stored user found:', storedUser ? 'YES' : 'NO');
      
      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('Loaded user from storage:', JSON.stringify(parsedUser, null, 2));
        console.log('Loaded token from storage:', storedToken.substring(0, 20) + '...');
        setTokenState(storedToken);
        setUser(parsedUser);
        console.log('Auth state restored from storage');
      } else {
        console.log('No stored auth data found - user needs to login');
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
      console.log('=== LOADING STORED AUTH COMPLETE ===');
    }
  };

  const setToken = async (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  };

  const login = async (emailOrPhone: string, password: string) => {
    console.log('=== LOGIN DEBUG START ===');
    console.log('Login email/phone:', emailOrPhone);
    console.log('Login password provided:', password ? 'YES' : 'NO');
    
    // Detect if input is email or phone
    const isEmailFormat = emailOrPhone.includes('@');
    const loginIdentifier = isEmailFormat ? 'email' : 'phone';
    console.log('Login identifier type:', loginIdentifier);
    
    try {
      const baseUrl =
        Platform.OS === 'android'
          ? 'http://10.0.2.2:3000'
          : Platform.OS === 'web'
          ? 'http://localhost:3000'
          : 'http://localhost:3000';

      const loginEndpoint = `${baseUrl}/api/login`;
      
      console.log('Platform:', Platform.OS);
      console.log('Base URL:', baseUrl);
      console.log('Login endpoint:', loginEndpoint);
      
      // Send the appropriate field based on whether it's email or phone
      const loginPayload = isEmailFormat 
        ? { email: emailOrPhone, password }
        : { phone: emailOrPhone, password };
      
      console.log('Login payload (without password):', { 
        [loginIdentifier]: emailOrPhone 
      });
      
      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginPayload),
      });

      console.log('Login response status:', response.status);
      console.log('Login response status text:', response.statusText);
      console.log('Login response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login error response:', errorText);
        console.error('Login error status:', response.status);
        let errorMessage = `Login failed: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          console.error('Login error JSON:', errorJson);
          errorMessage = errorJson.message || errorJson.error || errorJson.msg || errorMessage;
        } catch {
          console.error('Login error is not JSON:', errorText);
          errorMessage = errorText || errorMessage;
        }
        console.log('=== LOGIN DEBUG END (ERROR) ===');
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Login success data (full):', JSON.stringify(data, null, 2));
      
      // Handle different response formats
      const authToken = data.token || data.accessToken || data.access_token || data.authToken;
      const userData = data.user || data;

      console.log('Extracted token:', authToken ? 'TOKEN_PRESENT' : 'TOKEN_MISSING');
      console.log('Extracted user data:', JSON.stringify(userData, null, 2));

      if (!authToken) {
        console.warn('No token found in response, available keys:', Object.keys(data));
        console.log('=== LOGIN DEBUG END (NO TOKEN) ===');
        throw new Error('No authentication token received from server. Please check server response format.');
      }

      await setToken(authToken);
      console.log('Token stored in state and AsyncStorage');
      setUser(userData);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      console.log('User data stored:', JSON.stringify(userData, null, 2));
      console.log('=== LOGIN DEBUG END (SUCCESS) ===');
    } catch (error) {
      console.error('=== LOGIN DEBUG END (EXCEPTION) ===');
      console.error('Login error details:', error);
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error detected - cannot reach server');
        throw new Error('Network error: Could not connect to server. Make sure the backend is running on http://localhost:3000');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      setTokenState(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    setUser,
    setToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

