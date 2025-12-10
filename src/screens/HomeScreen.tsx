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
};

function HomeScreen({ isDarkMode }: Props) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, isDarkMode && styles.containerDark]}
      contentContainerStyle={styles.content}>
      <Text style={[styles.title, isDarkMode && styles.textLight]}>
        Welcome!
      </Text>

      {user && (
        <View style={styles.userInfo}>
          <Text style={[styles.label, isDarkMode && styles.textLight]}>
            Email:
          </Text>
          <Text style={[styles.value, isDarkMode && styles.textLight]}>
            {user.email}
          </Text>

          {user.username && (
            <>
              <Text style={[styles.label, isDarkMode && styles.textLight]}>
                Username:
              </Text>
              <Text style={[styles.value, isDarkMode && styles.textLight]}>
                {user.username}
              </Text>
            </>
          )}

          {(user.firstName || user.lastName) && (
            <>
              <Text style={[styles.label, isDarkMode && styles.textLight]}>
                Name:
              </Text>
              <Text style={[styles.value, isDarkMode && styles.textLight]}>
                {[user.firstName, user.lastName].filter(Boolean).join(' ')}
              </Text>
            </>
          )}
        </View>
      )}

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
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 24,
    color: '#0f172a',
  },
  textLight: {
    color: '#e2e8f0',
  },
  userInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    color: '#64748b',
  },
  value: {
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 8,
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

