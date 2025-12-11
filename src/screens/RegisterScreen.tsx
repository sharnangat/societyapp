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

const usersEndpoint =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/user/register'
    : Platform.OS === 'web'
    ? 'http://localhost:3000/user/register'
    : 'http://localhost:3000/user/register';

type Props = {
  isDarkMode: boolean;
  onSwitchToLogin: () => void;
};

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

function RegisterScreen({ isDarkMode, onSwitchToLogin }: Props) {
  const [form, setForm] = useState<RegisterFormState>({
    username: '',
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof RegisterFormState>(
    key: K,
    value: RegisterFormState[K],
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    if (!form.username.trim()) {
      Alert.alert('Validation Error', 'Please enter a username');
      return false;
    }
    if (!form.email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address');
      return false;
    }
    if (!form.email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    if (!form.password.trim()) {
      Alert.alert('Validation Error', 'Password is required');
      return false;
    }
    if (form.password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  // Test backend connectivity
  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connectivity to:', usersEndpoint);
      const baseUrl = usersEndpoint.replace('/user/register', '');
      const testUrl = `${baseUrl}/health`;
      const response = await fetch(testUrl, { method: 'GET' });
      console.log('Backend health check status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Backend connectivity test failed:', error);
      return false;
    }
  };

  const handleSubmit = async () => {
    // Prevent double submission
    if (isSubmitting) {
      console.log('Registration already in progress, ignoring duplicate submit');
      return;
    }

    console.log('=== REGISTRATION DEBUG START ===');
    console.log('Current timestamp:', new Date().toISOString());
    
    // Validate form before submission
    if (!validateForm()) {
      console.log('=== REGISTRATION DEBUG END (VALIDATION FAILED) ===');
      return;
    }

    setIsSubmitting(true);

    // Test backend connection (optional, won't block if it fails)
    const backendReachable = await testBackendConnection();
    console.log('Backend reachable:', backendReachable);

    // The backend expects 'password' field, not 'password_hash'
    // The backend will hash the password server-side
    const payload: Record<string, any> = {
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password, // Changed from password_hash to password
      status: form.status,
      email_verified: form.emailVerified,
      phone_verified: form.phoneVerified,
      failed_login_attempts: Number(form.failedLoginAttempts || 0),
    };

    // Add optional fields only if they have values
    if (form.firstName.trim()) payload.first_name = form.firstName.trim();
    if (form.lastName.trim()) payload.last_name = form.lastName.trim();
    if (form.phone.trim()) payload.phone = form.phone.trim();
    if (form.accountLockedUntil) payload.account_locked_until = form.accountLockedUntil;
    if (form.passwordResetToken) payload.password_reset_token = form.passwordResetToken;
    if (form.passwordResetExpires) payload.password_reset_expires = form.passwordResetExpires;
    if (form.emailVerificationToken) payload.email_verification_token = form.emailVerificationToken;
    if (form.emailVerificationExpires) payload.email_verification_expires = form.emailVerificationExpires;
    if (form.lastLogin) payload.last_login = form.lastLogin;
    if (form.lastLoginIp) payload.last_login_ip = form.lastLoginIp;
    if (form.createdBy) payload.created_by = form.createdBy;

    console.log('Form data:', {
      username: form.username,
      email: form.email,
      password: form.password ? '***' : '',
      passwordLength: form.password.length,
      firstName: form.firstName,
      lastName: form.lastName,
    });
    console.log('Registration endpoint:', usersEndpoint);
    console.log('Platform:', Platform.OS);
    console.log('Registration payload (sanitized):', JSON.stringify({ ...payload, password: '***' }, null, 2));
    console.log('Registration payload (full, including password):', JSON.stringify(payload, null, 2));

    try {
      console.log('Making fetch request to:', usersEndpoint);
      console.log('Request method: POST');
      console.log('Request headers:', { 'Content-Type': 'application/json' });
      
      const startTime = Date.now();
      const res = await fetch(usersEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const endTime = Date.now();
      
      console.log('Request completed in:', endTime - startTime, 'ms');
      console.log('Registration response status:', res.status);
      console.log('Registration response statusText:', res.statusText);
      console.log('Registration response headers:', Object.fromEntries(res.headers.entries()));
      console.log('Registration response ok:', res.ok);
      
      if (!res.ok) {
        let errorText = '';
        try {
          errorText = await res.text();
          console.error('Registration error response (raw):', errorText);
          console.error('Registration error response length:', errorText.length);
        } catch (textError) {
          console.error('Failed to read error response text:', textError);
          errorText = `HTTP ${res.status} ${res.statusText}`;
        }
        
        console.error('Registration error status:', res.status);
        console.error('Registration error statusText:', res.statusText);
        console.error('Registration error URL:', res.url);
        
        let errorMessage = `Registration failed (${res.status})`;
        
        // Try to parse JSON error response
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            console.error('Registration error JSON (parsed):', JSON.stringify(errorJson, null, 2));
            errorMessage = errorJson.error || errorJson.message || errorJson.msg || errorJson.detail || errorMessage;
            
            // Log all possible error fields
            console.error('Error object keys:', Object.keys(errorJson));
            if (errorJson.errors) {
              console.error('Validation errors:', JSON.stringify(errorJson.errors, null, 2));
            }
            
            // Handle specific error cases
            if (errorMessage.toLowerCase().includes('already exists') || 
                errorMessage.toLowerCase().includes('user already exists') ||
                errorMessage.toLowerCase().includes('duplicate')) {
              errorMessage = 'An account with this email already exists. Please login instead.';
            } else if (errorMessage.toLowerCase().includes('password') && 
                       (errorMessage.toLowerCase().includes('required') || 
                        errorMessage.toLowerCase().includes('needed') ||
                        errorMessage.toLowerCase().includes('missing'))) {
              errorMessage = 'Password is required. Please enter a password.';
            } else if (errorMessage.toLowerCase().includes('email') && 
                       errorMessage.toLowerCase().includes('required')) {
              errorMessage = 'Email is required. Please enter a valid email address.';
            } else if (errorMessage.toLowerCase().includes('username') && 
                       errorMessage.toLowerCase().includes('required')) {
              errorMessage = 'Username is required. Please enter a username.';
            }
          } catch (parseError) {
            // If not JSON, use the text as is
            console.error('Registration error is not JSON. Raw text:', errorText);
            console.error('Parse error:', parseError);
            if (errorText) {
              if (errorText.toLowerCase().includes('already exists') || 
                  errorText.toLowerCase().includes('duplicate')) {
                errorMessage = 'An account with this email already exists. Please login instead.';
              } else if (errorText.toLowerCase().includes('password') && 
                         (errorText.toLowerCase().includes('required') || 
                          errorText.toLowerCase().includes('needed'))) {
                errorMessage = 'Password is required. Please enter a password.';
              } else {
                errorMessage = errorText;
              }
            }
          }
        }
        
        console.log('Final error message to show user:', errorMessage);
        console.log('=== REGISTRATION DEBUG END (ERROR) ===');
        throw new Error(errorMessage);
      }
      
      // Handle successful response
      let responseText = '';
      let data = null;
      
      try {
        responseText = await res.text();
        console.log('Registration response text (raw):', responseText);
        console.log('Registration response text length:', responseText.length);
        
        // Some APIs return empty body on success, which is okay
        if (responseText && responseText.trim().length > 0) {
          try {
            data = JSON.parse(responseText);
            console.log('Registration success data (parsed):', JSON.stringify(data, null, 2));
          } catch (parseError) {
            console.warn('Response is not valid JSON, but status is OK. Treating as success.');
            console.warn('Response was:', responseText);
            // Don't throw error if status is OK - empty response might be valid
          }
        } else {
          console.log('Empty response body (this is okay for some APIs)');
        }
        
        console.log('=== REGISTRATION DEBUG END (SUCCESS) ===');
        
        Alert.alert(
          'Success', 
          'Registration successful! You can now login.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Switch to login screen after successful registration
                onSwitchToLogin();
              }
            }
          ]
        );
      } catch (responseError) {
        console.error('Error reading success response:', responseError);
        // Even if we can't parse response, if status is OK, it's still a success
        console.log('Status was OK (200), treating as success despite parse error');
        Alert.alert(
          'Success', 
          'Registration request completed successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                onSwitchToLogin();
              }
            }
          ]
        );
      }
    } catch (err) {
      console.error('=== REGISTRATION DEBUG END (EXCEPTION) ===');
      console.error('Register submit error type:', err instanceof Error ? err.constructor.name : typeof err);
      console.error('Register submit error:', err);
      console.error('Error message:', err instanceof Error ? err.message : String(err));
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      
      let errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      // Check for network errors
      if (err instanceof TypeError) {
        if (err.message.includes('fetch') || err.message.includes('Network request failed')) {
          errorMessage = 'Network error: Cannot connect to server. Please check:\n' +
                        `1. Backend server is running on ${usersEndpoint}\n` +
                        '2. Android emulator can reach 10.0.2.2:3000\n' +
                        '3. No firewall blocking the connection';
          console.error('Network connectivity issue detected');
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Failed to connect to server. Make sure the backend is running on http://localhost:3000';
        }
      }
      
      // Check for CORS errors (though less common on Android)
      if (errorMessage.includes('CORS') || errorMessage.includes('cors')) {
        errorMessage = 'CORS error: Backend server may need to allow requests from this app';
      }
      
      console.error('Final error message to display:', errorMessage);
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
      console.log('Registration submission completed (success or error)');
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

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Create account</Text>
          )}
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
      <View style={styles.toggleRow}>
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

export default RegisterScreen;

