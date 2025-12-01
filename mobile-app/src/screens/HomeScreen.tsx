import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthService } from '../services/auth';
import { useTranslation } from 'react-i18next';
import { useIsRTL } from '../hooks/useIsRTL';

export const HomeScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const isRTL = useIsRTL();

  const handleLogout = async () => {
    await AuthService.logout();
    navigation.replace('Login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'he' ? 'en' : 'he';
    i18n.changeLanguage(newLang);
  };

  return (
    <View style={styles.container}>
        <TouchableOpacity style={styles.langButton} onPress={toggleLanguage}>
            <Text style={styles.langText}>{i18n.language === 'he' ? '🇺🇸 English' : '🇮🇱 עברית'}</Text>
        </TouchableOpacity>

      <Text style={styles.title}>{t('home.welcome')}</Text>
      <View style={{ marginBottom: 20 }}>
          <Button title={t('home.logout')} onPress={handleLogout} />
      </View>
      <Button 
        title={t('home.planNewDate')}
        onPress={() => navigation.navigate('DateSetup')} 
        color="#C2185B"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  langButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      padding: 10,
      backgroundColor: '#f0f0f0',
      borderRadius: 20,
  },
  langText: {
      fontSize: 16,
  }
});
