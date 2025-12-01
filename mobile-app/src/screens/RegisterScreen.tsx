import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  Alert, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthService } from '../services/auth';
import { ApiService } from '../services/api';
import { colors, globalStyles } from '../theme/styles';

export const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Missing Info', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // 1. יצירת משתמש ב-Firebase
      await AuthService.signUp(email, password);

      // 2. יצירת משתמש ב-MongoDB
      await ApiService.post('/users/register', { name });

      Alert.alert('Success', 'Account created successfully!');
      navigation.replace('Home');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Registration Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* רקע גרדיינט */}
      <LinearGradient
        colors={[colors.primary, '#FF80AB']}
        style={styles.background}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
          
          {/* הכרטיס הלבן */}
          <View style={styles.card}>
            
            {/* לוגו */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/big_logo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subText}>Join PlanLI and start dating smarter</Text>

            {/* שדה שם מלא (חדש!) */}
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="account-outline" size={20} color={colors.textLight} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                autoCapitalize="words" // אות ראשונה גדולה בשם
              />
            </View>

            {/* שדה אימייל */}
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="email-outline" size={20} color={colors.textLight} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* שדה סיסמה */}
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={colors.textLight} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={colors.textLight} 
                />
              </TouchableOpacity>
            </View>

            {/* כפתור הרשמה */}
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
                <Text style={styles.primaryButtonText}>SIGN UP</Text>
              </TouchableOpacity>
            )}

            {/* קישור חזרה להתחברות */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Login</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 15,
    alignItems: 'center',
    marginVertical: 20, // מרווח מלמעלה ולמטה כדי שהמקלדת לא תסתיר
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoImage: {
    width: 180, // קצת יותר קטן מאשר ב-Login כי יש יותר שדות
    height: 100,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  subText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 25,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: '100%',
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    height: '100%',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 25,
  },
  footerText: {
    color: colors.textLight,
    fontSize: 14,
  },
  linkText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
