import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import MobileHealthScanner from '../components/MobileHealthScanner';

type Props = {
  isDarkMode: boolean;
  onBack?: () => void;
};

function ProfileScreen({ isDarkMode, onBack }: Props) {
  const { user } = useAuth();

  // Get display name for profile header
  const getDisplayName = (): string => {
    if (!user) return 'Guest User';
    
    if (user.firstName || user.lastName) {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
      if (fullName) return fullName;
    }
    if (user.firstName) return user.firstName;
    if (user.username) return user.username;
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const displayName = getDisplayName();

  // Format phone number for display
  const formatPhone = (phone: string | undefined): string => {
    if (!phone) return 'Not provided';
    // Remove any non-digit characters and format
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    return phone;
  };

  // Format date for display
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Get user initials for avatar
  const getInitials = (): string => {
    if (!user) return 'U';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName[0].toUpperCase();
    }
    if (user.username) {
      return user.username[0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const ProfileField = ({ label, value, icon }: { label: string; value: string | undefined; icon?: string }) => {
    if (!value && value !== '0') return null;
    return (
      <View style={[styles.fieldContainer, isDarkMode && styles.fieldContainerDark]}>
        {icon && <Text style={styles.fieldIcon}>{icon}</Text>}
        <View style={styles.fieldContent}>
          <Text style={[styles.fieldLabel, isDarkMode && styles.textLightSecondary]}>
            {label}
          </Text>
          <Text style={[styles.fieldValue, isDarkMode && styles.textLight]}>
            {value || 'Not provided'}
          </Text>
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, isDarkMode && styles.containerDark]}>
        <Text style={[styles.errorText, isDarkMode && styles.textLight]}>
          No user data available
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, isDarkMode && styles.containerDark]}
      contentContainerStyle={styles.content}>
      
      {/* Header with Back Button */}
      {onBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          accessibilityLabel="Go back">
          <Text style={[styles.backButtonText, isDarkMode && styles.textLight]}>← Back</Text>
        </TouchableOpacity>
      )}

      {/* Profile Header */}
      <View style={[styles.profileHeader, isDarkMode && styles.profileHeaderDark]}>
        <View style={[styles.avatar, isDarkMode && styles.avatarDark]}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
        <Text style={[styles.profileName, isDarkMode && styles.textLight]}>
          {displayName}
        </Text>
        {user.email && (
          <Text style={[styles.profileEmail, isDarkMode && styles.textLightSecondary]}>
            {user.email}
          </Text>
        )}
      </View>

      {/* Personal Information Section */}
      <View style={[styles.section, isDarkMode && styles.sectionDark]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
          Personal Information
        </Text>
        
        <ProfileField
          label="Username"
          value={user.username}
          icon="👤"
        />
        
        <ProfileField
          label="First Name"
          value={user.firstName || user.first_name}
          icon="📝"
        />
        
        <ProfileField
          label="Last Name"
          value={user.lastName || user.last_name}
          icon="📝"
        />
        
        <ProfileField
          label="Email Address"
          value={user.email}
          icon="✉️"
        />
        
        <ProfileField
          label="Phone Number"
          value={formatPhone(user.phone || user.phoneNumber)}
          icon="📱"
        />
      </View>

      {/* Account Information Section */}
      <View style={[styles.section, isDarkMode && styles.sectionDark]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
          Account Information
        </Text>
        
        <ProfileField
          label="User ID"
          value={user.id}
          icon="🆔"
        />
        
        <ProfileField
          label="Account Status"
          value={user.status ? user.status.replace(/_/g, ' ').toUpperCase() : undefined}
          icon="📊"
        />
        
        <ProfileField
          label="Email Verified"
          value={user.emailVerified || user.email_verified ? 'Yes' : 'No'}
          icon="✓"
        />
        
        <ProfileField
          label="Phone Verified"
          value={user.phoneVerified || user.phone_verified ? 'Yes' : 'No'}
          icon="✓"
        />
      </View>

      {/* Additional Information Section */}
      {(user.lastLogin || user.lastLoginIp || user.createdAt || user.created_at) && (
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
            Additional Information
          </Text>
          
          <ProfileField
            label="Last Login"
            value={formatDate(user.lastLogin || user.last_login)}
            icon="🕒"
          />
          
          <ProfileField
            label="Last Login IP"
            value={user.lastLoginIp || user.last_login_ip}
            icon="🌐"
          />
          
          <ProfileField
            label="Account Created"
            value={formatDate(user.createdAt || user.created_at)}
            icon="📅"
          />
        </View>
      )}

      {/* Mobile Health Scanner */}
      <MobileHealthScanner isDarkMode={isDarkMode} />
    </ScrollView>
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
  backButton: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeaderDark: {
    backgroundColor: '#1e293b',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarDark: {
    backgroundColor: '#3b82f6',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionDark: {
    backgroundColor: '#1e293b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  fieldContainerDark: {
    borderBottomColor: '#334155',
  },
  fieldIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
  textLight: {
    color: '#e2e8f0',
  },
  textLightSecondary: {
    color: '#94a3b8',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default ProfileScreen;

