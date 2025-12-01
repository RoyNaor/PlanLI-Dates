import React, { useState, useEffect } from 'react';
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
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Asset } from 'expo-asset'; // <--- הוספנו את זה
import { AuthService } from '../services/auth';
import { colors, globalStyles } from '../theme/styles';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // State לטעינת הלוגין (API)
  const [loading, setLoading] = useState(false);
  
  // State חדש: האם הנכסים (תמונות) נטענו?
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // 1. טעינה מוקדמת של התמונה
  useEffect(() => {
    const loadAssets = async () => {
      try {
        // טוען את התמונה לזיכרון המטמון
        const imageAssets = [require('../../assets/big_logo.png')];
        const cacheImages = imageAssets.map(image => {
          return Asset.fromModule(image).downloadAsync();
        });

        await Promise.all(cacheImages);
      } catch (e) {
        console.warn('Error loading assets:', e);
      } finally {
        // גם אם נכשל, נציג את המסך כדי לא לנתקע
        setAssetsLoaded(true);
      }
    };

    loadAssets();
  }, []);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await AuthService.signIn(email, password);
      navigation.replace('Home');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. אם התמונה לא טעונה עדיין - הצג מסך טעינה מלא
  if (!assetsLoaded) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primary, '#FF80AB']}
          style={[styles.background, { justifyContent: 'center', alignItems: 'center' }]}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 10, fontWeight: 'bold' }}>Loading PlanLI...</Text>
        </LinearGradient>
      </View>
    );
  }

  // 3. המסך הרגיל (יוצג רק אחרי שהתמונה בזיכרון)
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, '#FF80AB']}
        style={styles.background}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        <View style={styles.card}>
          
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/big_logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
              // אופציונלי: אפשר להוסיף גם כאן fadeDuration לאפקט חלק יותר
              fadeDuration={0} 
            />
          </View>

          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.subText}>Plan your perfect date instantly</Text>

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

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>LOGIN</Text>
            </TouchableOpacity>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to PlanLI? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 15,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoImage: {
    width: 180, 
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
    marginBottom: 30,
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
    borderWidth: 1,
    borderColor: 'transparent',
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
  loginButton: {
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
  loginButtonText: {
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