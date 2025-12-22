import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Alert, 
  Animated, 
  Easing 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { CommonActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// --- רכיב האנימציה הפנימי (הלב הפועם) ---
const PulsingHeart = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        // אפקט הגדלה/הקטנה
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
        // אפקט הבהוב עדין של ההילה
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  return (
    <View style={styles.heartContainer}>
      {/* ההילה מסביב */}
      <Animated.View style={[
        styles.glow, 
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim }
      ]} />
      
      {/* הלב עצמו */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons name="heart" size={100} color="#fff" />
      </Animated.View>
    </View>
  );
};

// --- המסך הראשי ---
export const DateGenerationScreen = ({ route, navigation }: any) => {
  const { payload } = route.params;
  const { t } = useTranslation();

  useEffect(() => {
    generateDate();
  }, []);

  const generateDate = async () => {
    try {
      const minWaitTime = new Promise(resolve => setTimeout(resolve, 3000));
      
      const apiCall = ApiService.post('/dates/calculate', payload);

      const [_, result] = await Promise.all([minWaitTime, apiCall]);

      const response: any = result;
      const payloadResult = response?.data ?? response;

      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'MainTabs' },
            { name: 'DateResults', params: { result: payloadResult } },
          ],
        })
      );

    } catch (e: any) {
      console.error(e);
      Alert.alert(
        t('common.error') || 'Error',
        'Could not calculate date. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <LinearGradient
      colors={['#C2185B', '#FF4081']} 
      style={styles.container}
    >
      <View style={styles.content}>
        
        <PulsingHeart />

       {/* הטיפ השיווקי */}
        <View style={styles.tipContainer}>
            <View style={styles.tipHeader}>
                <Ionicons name="sparkles" size={16} color="#FFD700" style={{marginRight: 6}} />
                <Text style={styles.tipTitle}>הידעת?</Text>
            </View>
            <Text style={styles.tipText}>
                האלגוריתם שלנו לומד ומשתפר בזכותך!
                {"\n"}
                שתפו חוויות ודרגו מקומות כדי לעזור לקהילה למצוא דייטים מושלמים.
            </Text>
        </View>

      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 30,
    width: '100%',
  },
  // סגנונות הלב
  heartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    height: 150, 
    width: 150,
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.5)',
    zIndex: -1,
  },
  // טקסטים
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 50,
  },
  // קופסת הטיפ
  tipContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)', // כהה יותר מהרקע לשקיפות יפה
    padding: 20,
    borderRadius: 20,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tipText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
});