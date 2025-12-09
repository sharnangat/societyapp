/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [screen, setScreen] = useState<'login' | 'register'>('login');

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AuthSwitcher
        screen={screen}
        setScreen={setScreen}
        isDarkMode={isDarkMode}
      />
    </SafeAreaProvider>
  );
}

type AuthSwitcherProps = {
  screen: 'login' | 'register';
  setScreen: (s: 'login' | 'register') => void;
  isDarkMode: boolean;
};

function AuthSwitcher({ screen, setScreen, isDarkMode }: AuthSwitcherProps) {
  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            screen === 'login' && styles.tabButtonActive,
          ]}
          onPress={() => setScreen('login')}>
          <Text
            style={[
              styles.tabText,
              screen === 'login' && styles.tabTextActive,
            ]}>
            Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            screen === 'register' && styles.tabButtonActive,
          ]}
          onPress={() => setScreen('register')}>
          <Text
            style={[
              styles.tabText,
              screen === 'register' && styles.tabTextActive,
            ]}>
            Register
          </Text>
        </TouchableOpacity>
      </View>
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
    </View>
  );
}

type LoginScreenProps = {
  isDarkMode: boolean;
  onSwitchToRegister: () => void;
};

function LoginScreen({ isDarkMode, onSwitchToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    // TODO: replace with real auth call
    console.log('Login payload:', { email, password });
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

type RegisterFormState = {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  failedLoginAttempts: string;
  accountLockedUntil: string;
  passwordResetToken: string;
  passwordResetExpires: string;
  emailVerificationToken: string;
  emailVerificationExpires: string;
  lastLogin: string;
  lastLoginIp: string;
  createdBy: string;
};

type RegisterScreenProps = {
  isDarkMode: boolean;
  onSwitchToLogin: () => void;
};

function RegisterScreen({ isDarkMode, onSwitchToLogin }: RegisterScreenProps) {
  const [form, setForm] = useState<RegisterFormState>({
    username: 'temp_username',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    status: 'pending_verification',
    emailVerified: false,
    phoneVerified: false,
    failedLoginAttempts: '0',
    accountLockedUntil: '',
    passwordResetToken: '',
    passwordResetExpires: '',
    emailVerificationToken: '',
    emailVerificationExpires: '',
    lastLogin: '',
    lastLoginIp: '',
    createdBy: '',
  });

  const updateField = <K extends keyof RegisterFormState>(
    key: K,
    value: RegisterFormState[K],
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    // TODO: replace with registration API call
    console.log('Register payload:', {
      username: form.username,
      email: form.email,
      password_hash: form.password,
      first_name: form.firstName,
      last_name: form.lastName,
      phone: form.phone,
      status: form.status,
      email_verified: form.emailVerified,
      phone_verified: form.phoneVerified,
      failed_login_attempts: Number(form.failedLoginAttempts || 0),
      account_locked_until: form.accountLockedUntil,
      password_reset_token: form.passwordResetToken,
      password_reset_expires: form.passwordResetExpires,
      email_verification_token: form.emailVerificationToken,
      email_verification_expires: form.emailVerificationExpires,
      last_login: form.lastLogin,
      last_login_ip: form.lastLoginIp,
      created_by: form.createdBy,
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDarkMode && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, isDarkMode && styles.textLight]}>
          Register
        </Text>

        <FormInput
          label="Username"
          value={form.username}
          onChangeText={text => updateField('username', text)}
          placeholder="temp_username"
          isDarkMode={isDarkMode}
          required
        />
        <FormInput
          label="Email"
          value={form.email}
          onChangeText={text => updateField('email', text)}
          placeholder="name@example.com"
          keyboardType="email-address"
          isDarkMode={isDarkMode}
          required
        />
        <FormInput
          label="Password"
          value={form.password}
          onChangeText={text => updateField('password', text)}
          placeholder="••••••••"
          secureTextEntry
          isDarkMode={isDarkMode}
          required
        />
        <FormInput
          label="First name"
          value={form.firstName}
          onChangeText={text => updateField('firstName', text)}
          isDarkMode={isDarkMode}
        />
        <FormInput
          label="Last name"
          value={form.lastName}
          onChangeText={text => updateField('lastName', text)}
          isDarkMode={isDarkMode}
        />
        <FormInput
          label="Phone"
          value={form.phone}
          onChangeText={text => updateField('phone', text)}
          placeholder="+1 555 0100"
          keyboardType="phone-pad"
          isDarkMode={isDarkMode}
        />
        <FormInput
          label="Status"
          value={form.status}
          onChangeText={text => updateField('status', text)}
          placeholder="pending_verification"
          isDarkMode={isDarkMode}
        />
        <ToggleRow
          label="Email verified"
          value={form.emailVerified}
          onValueChange={val => updateField('emailVerified', val)}
          isDarkMode={isDarkMode}
        />
        <ToggleRow
          label="Phone verified"
          value={form.phoneVerified}
          onValueChange={val => updateField('phoneVerified', val)}
          isDarkMode={isDarkMode}
        />
        <FormInput
          label="Failed login attempts"
          value={form.failedLoginAttempts}
          onChangeText={text => updateField('failedLoginAttempts', text)}
          keyboardType="numeric"
          isDarkMode={isDarkMode}
        />
        <FormInput
          label="Account locked until"
          value={form.accountLockedUntil}
          onChangeText={text => updateField('accountLockedUntil', text)}
          placeholder="YYYY-MM-DDTHH:mm:ssZ"
          isDarkMode={isDarkMode}
        />
        <FormInput
          label="Password reset token"
          value={form.passwordResetToken}
          onChangeText={text => updateField('passwordResetToken', text)}
          isDarkMode={isDarkMode}
        />
        <FormInput
          label="Password reset expires"
          value={form.passwordResetExpires}
          onChangeText={text => updateField('passwordResetExpires', text)}
          placeholder="YYYY-MM-DDTHH:mm:ssZ"
          isDarkMode={isDarkMode}
        />
        <FormInput
          label="Email verification token"
          value={form.emailVerificationToken}
          onChangeText={text => updateField('emailVerificationToken', text)}
          isDarkMode={isDarkMode}
        />
        <FormInput
          label="Email verification expires"
          value={form.emailVerificationExpires}
          onChangeText={text => updateField('emailVerificationExpires', text)}
          placeholder="YYYY-MM-DDTHH:mm:ssZ"
          isDarkMode={isDarkMode}
        />
        <FormInput
          label="Last login"
          value={form.lastLogin}
          onChangeText={text => updateField('lastLogin', text)}
          placeholder="YYYY-MM-DDTHH:mm:ssZ"
          isDarkMode={isDarkMode}
        />
        <FormInput
          label="Last login IP"
          value={form.lastLoginIp}
          onChangeText={text => updateField('lastLoginIp', text)}
          placeholder="192.0.2.1"
          isDarkMode={isDarkMode}
        />
        <FormInput
          label="Created by"
          value={form.createdBy}
          onChangeText={text => updateField('createdBy', text)}
          isDarkMode={isDarkMode}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Create account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={onSwitchToLogin}
          accessibilityRole="button">
          <Text style={[styles.linkText, isDarkMode && styles.textLight]}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  tabTextActive: {
    color: '#fff',
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
  togglePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
  },
  togglePillOn: {
    backgroundColor: '#22c55e',
  },
  togglePillOff: {
    backgroundColor: '#e2e8f0',
  },
  togglePillText: {
    color: '#0f172a',
    fontWeight: '700',
  },
});

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

type ToggleRowProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isDarkMode: boolean;
};

function ToggleRow({ label, value, onValueChange, isDarkMode }: ToggleRowProps) {
  return (
    <View style={styles.field}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text
          style={[
            styles.inputLabel,
            isDarkMode && styles.inputLabelDark,
          ]}>{label}</Text>
        <TouchableOpacity
          onPress={() => onValueChange(!value)}
          style={[
            styles.togglePill,
            value ? styles.togglePillOn : styles.togglePillOff,
          ]}>
          <Text style={styles.togglePillText}>{value ? 'Yes' : 'No'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default App;
