import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/styles';

export const SavedDatesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>❤️ דייטים ששמרתי (בקרוב...)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: colors.text, fontWeight: 'bold' }
});