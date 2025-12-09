import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const PulsingHeart = ({ size = 100, color = '#fff' }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // לולאה אינסופית של גדילה וקטנה (פעימות)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2, // גדל ל-120%
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1, // חוזר לגודל מקורי
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {/* אפשר להחליף לאייקון אחר או לתמונה */}
        <Ionicons name="heart" size={size} color={color} />
      </Animated.View>
      
      {/* אופציונלי: הוספת "הילה" או אפקט נוסף */}
      <Animated.View style={[styles.glow, { 
          transform: [{ scale: scaleAnim }],
          backgroundColor: color,
          opacity: 0.3 
      }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: -1,
  }
});