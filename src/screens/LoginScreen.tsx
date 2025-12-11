import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

type Props = {
  isDarkMode: boolean;
  onSwitchToRegister: () => void;
};

function LoginScreen({ isDarkMode, onSwitchToRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Validation Error', 'Please enter your password');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    console.log('=== LOGIN SCREEN: Form submission started ===');
    console.log('Form values - Email:', email, 'Password:', password ? '***' : '');
    
    if (!validateForm()) {
      console.log('=== LOGIN SCREEN: Form validation failed ===');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Login form submitted - calling login function');
      console.log('Trimmed email:', email.trim());
      await login(email.trim(), password);
      // Login successful - AuthContext will handle navigation via App.tsx
      console.log('=== LOGIN SCREEN: Login successful ===');
      Alert.alert('Success', 'Login successful!');
    } catch (err) {
      console.error('=== LOGIN SCREEN: Login failed ===');
      console.error('Login submit error:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      // Show user-friendly error messages
      let displayMessage = errorMessage;
      if (errorMessage.includes('Network error') || errorMessage.includes('fetch')) {
        displayMessage = 'Cannot connect to server. Please ensure the backend is running on http://localhost:3000';
      } else if (errorMessage.includes('401') || errorMessage.toLowerCase().includes('invalid')) {
        displayMessage = 'Invalid email or password. Please try again.';
      } else if (errorMessage.includes('404')) {
        displayMessage = 'Login endpoint not found. Please check server configuration.';
      }
      
      Alert.alert('Login Failed', displayMessage);
    } finally {
      setIsLoading(false);
      console.log('=== LOGIN SCREEN: Form submission completed ===');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDarkMode && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, isDarkMode && styles.textLight]}>
          Login
        </Text>

        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          keyboardType="email-address"
          isDarkMode={isDarkMode}
          required
        />
        <FormInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          isDarkMode={isDarkMode}
          required
        />

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Sign in</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={onSwitchToRegister}
          accessibilityRole="button">
          <Text style={[styles.linkText, isDarkMode && styles.textLight]}>
            Don’t have an account? Register
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type FormInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  isDarkMode: boolean;
  required?: boolean;
};

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry,
  isDarkMode,
  required,
}: FormInputProps) {
  return (
    <View style={styles.field}>
      <Text
        style={[
          styles.inputLabel,
          isDarkMode && styles.inputLabelDark,
        ]}>{`${label}${required ? ' *' : ''}`}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={isDarkMode ? '#94a3b8' : '#94a3b8'}
        style={[styles.input, isDarkMode && styles.inputDark]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    color: '#0f172a',
  },
  textLight: {
    color: '#e2e8f0',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#0f172a',
  },
  inputLabelDark: {
    color: '#cbd5e1',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#fff',
  },
  inputDark: {
    borderColor: '#334155',
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
  },
  field: {
    marginBottom: 14,
  },
  submitButton: {
    marginTop: 10,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkRow: {
    marginTop: 14,
    alignItems: 'center',
  },
  linkText: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default LoginScreen;

