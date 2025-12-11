import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

type Props = {
  isDarkMode: boolean;
  onNavigateToProfile?: () => void;
};

function HomeScreen({ isDarkMode, onNavigateToProfile }: Props) {
  const { user, logout, token } = useAuth();

  React.useEffect(() => {
    console.log('=== HOME SCREEN DEBUG ===');
    console.log('User data:', JSON.stringify(user, null, 2));
    console.log('Token present:', token ? 'YES' : 'NO');
    console.log('Token value:', token ? `${token.substring(0, 20)}...` : 'N/A');
  }, [user, token]);

  const handleLogout = async () => {
    console.log('=== LOGOUT DEBUG ===');
    console.log('Logging out user:', user?.email);
    try {
      await logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get display name for welcome message
  const getDisplayName = (): string => {
    if (!user) return 'Guest';
    
    // Priority: firstName + lastName > firstName > username > email (without @domain)
    if (user.firstName || user.lastName) {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
      if (fullName) return fullName;
    }
    if (user.firstName) return user.firstName;
    if (user.username) return user.username;
    if (user.email) {
      // Extract name from email (part before @)
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const displayName = getDisplayName();

  return (
    <ScrollView
      style={[styles.container, isDarkMode && styles.containerDark]}
      contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, isDarkMode && styles.textLight]}>
          Welcome, {displayName}!
        </Text>
        {onNavigateToProfile && (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={onNavigateToProfile}
            accessibilityLabel="View profile">
            <Text style={styles.profileButtonIcon}>👤</Text>
            <Text style={[styles.profileButtonText, isDarkMode && styles.textLight]}>
              Profile
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  textLight: {
    color: '#e2e8f0',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  profileButtonIcon: {
    fontSize: 18,
  },
  profileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HomeScreen;

