import React, { useState } from 'react';
import {
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

type Props = {
  isDarkMode: boolean;
  onSwitchToRegister: () => void;
};

function LoginScreen({ isDarkMode, onSwitchToRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      Alert.alert('Success', 'Login submitted to /users');
    } catch (err) {
      console.error('Login submit error', err);
      Alert.alert('Error', 'Could not submit login. Check server logs.');
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

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Sign in</Text>
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

