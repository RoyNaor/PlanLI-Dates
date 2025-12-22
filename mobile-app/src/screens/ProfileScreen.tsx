import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '../theme/styles';
import { auth } from '../config/firebase';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { updateProfile } from 'firebase/auth';
import { ApiService } from '../services/api';

export const ProfileScreen = () => {
  const { t, i18n } = useTranslation();
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState<string>(user?.displayName || '');
  const [pendingName, setPendingName] = useState<string>(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
      setPendingName(user.displayName);
    }
  }, [user?.displayName]);

  const needsDisplayName = useMemo(() => {
    const normalized = (displayName || '').trim();
    return !normalized || normalized === 'אורח' || normalized.toLowerCase() === 'guest';
  }, [displayName]);

  const safeDisplayName = displayName || 'אורח';
  const initial = safeDisplayName.charAt(0).toUpperCase();

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

  const handleSaveDisplayName = async () => {
    if (!user) {
      Alert.alert('שגיאה', 'לא נמצא משתמש מחובר');
      return;
    }

    const trimmedName = pendingName.trim();
    if (!trimmedName) {
      Alert.alert('שגיאה', 'הזן שם מלא תקין');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile(user, { displayName: trimmedName });
      await ApiService.put('/users/profile', { displayName: trimmedName, photoUrl: user.photoURL || '' });
      await user.reload();

      setDisplayName(auth.currentUser?.displayName || trimmedName);
      Alert.alert('הצלחה', 'שם הפרופיל עודכן');
    } catch (error) {
      console.error('Failed to update profile', error);
      Alert.alert('שגיאה', 'לא הצלחנו לעדכן את הפרופיל');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {needsDisplayName && (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>השלם את הפרופיל שלך</Text>
          <Text style={styles.bannerSubtitle}>הוסף שם מלא כדי שחברים יזהו אותך</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.nameInput}
              placeholder="שם מלא"
              value={pendingName}
              onChangeText={setPendingName}
              placeholderTextColor="#8a8a8a"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveDisplayName} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>שמור</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.email}>{safeDisplayName}</Text>
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
  banner: {
    backgroundColor: '#FFE6F1',
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFC0D7'
  },
  bannerTitle: { fontSize: 18, fontWeight: '700', color: '#C2185B', marginBottom: 6, textAlign: 'right' },
  bannerSubtitle: { fontSize: 14, color: '#7A7A7A', marginBottom: 12, textAlign: 'right' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  nameInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 10,
    textAlign: 'right'
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveButtonText: { color: '#fff', fontWeight: '700' },
  header: { alignItems: 'center', marginBottom: 40, marginTop: 40 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  email: { fontSize: 18, color: colors.text, fontWeight: '500' },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 10, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  rowText: { fontSize: 16, marginLeft: 15, fontWeight: '500' }
});