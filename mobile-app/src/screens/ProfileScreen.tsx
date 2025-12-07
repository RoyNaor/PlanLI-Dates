import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../theme/styles';
import { auth } from '../config/firebase';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen = () => {
  const { t, i18n } = useTranslation();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLang = () => {
    const newLang = i18n.language === 'he' ? 'en' : 'he';
    i18n.changeLanguage(newLang);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.email?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={toggleLang}>
            <Ionicons name="language-outline" size={24} color={colors.text} />
            <Text style={styles.rowText}>
                {i18n.language === 'he' ? 'Switch to English' : 'עבור לעברית'}
            </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#D32F2F" />
            <Text style={[styles.rowText, { color: '#D32F2F' }]}>
                {t('settings.logout', { defaultValue: 'Logout' })}
            </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20, display: 'flex', flexDirection: 'column' , justifyContent: 'center', marginTop: 0 },
  header: { alignItems: 'center', marginBottom: 40, marginTop: 40 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  email: { fontSize: 18, color: colors.text, fontWeight: '500' },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 10, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  rowText: { fontSize: 16, marginLeft: 15, fontWeight: '500' }
});