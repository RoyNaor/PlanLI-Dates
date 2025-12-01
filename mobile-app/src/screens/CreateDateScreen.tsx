import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { ApiService } from '../services/api';

export const CreateDateScreen = () => {
  // שמתי ברירת מחדל כדי שיהיה קל לבדוק (ת"א)
  const [l1Lat, setL1Lat] = useState('32.0754');
  const [l1Lng, setL1Lng] = useState('34.7757');
  
  const [l2Lat, setL2Lat] = useState('32.0741');
  const [l2Lng, setL2Lng] = useState('34.7915');
  
  const [preferences, setPreferences] = useState('Romantic, Italian food, Quiet');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setResult(null); // איפוס תוצאות קודמות

    try {
      const payload = {
        l1: { lat: parseFloat(l1Lat), lng: parseFloat(l1Lng) },
        l2: { lat: parseFloat(l2Lat), lng: parseFloat(l2Lng) },
        preferences: preferences
      };

      // שליחת הבקשה לשרת
      const response = await ApiService.post('/dates/calculate', payload);
      
      // אם הגענו לפה - יש תשובה!
      if (response.success) {
        setResult(response.data);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Plan a New Date ❤️</Text>

      {/* User 1 Inputs */}
      <Text style={styles.label}>User 1 Location (Lat/Lng):</Text>
      <View style={styles.row}>
        <TextInput style={styles.inputHalf} value={l1Lat} onChangeText={setL1Lat} keyboardType="numeric" />
        <TextInput style={styles.inputHalf} value={l1Lng} onChangeText={setL1Lng} keyboardType="numeric" />
      </View>

      {/* User 2 Inputs */}
      <Text style={styles.label}>User 2 Location (Lat/Lng):</Text>
      <View style={styles.row}>
        <TextInput style={styles.inputHalf} value={l2Lat} onChangeText={setL2Lat} keyboardType="numeric" />
        <TextInput style={styles.inputHalf} value={l2Lng} onChangeText={setL2Lng} keyboardType="numeric" />
      </View>

      {/* Preferences */}
      <Text style={styles.label}>Vibe & Preferences:</Text>
      <TextInput 
        style={styles.input} 
        value={preferences} 
        onChangeText={setPreferences} 
        placeholder="e.g. Sushi, Cheap, Fun"
      />

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        {loading ? (
            <ActivityIndicator size="large" color="#C2185B" />
        ) : (
            <Button title="Find Perfect Spot ✨" onPress={handleCalculate} color="#C2185B" />
        )}
      </View>

      {/* Results Display */}
      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultHeader}>Results:</Text>
          <Text>📍 Distance: {result.distanceKm} km</Text>
          <Text>🎯 Midpoint: {result.lmid.lat.toFixed(4)}, {result.lmid.lng.toFixed(4)}</Text>
          
          <Text style={[styles.resultHeader, { marginTop: 15 }]}>AI Recommendations:</Text>
          
          {result.aiSuggestions?.map((item: any, index: number) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{index + 1}. {item.name} ({item.matchScore}%)</Text>
              <Text style={styles.cardAddress}>{item.address}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#C2185B' },
  label: { fontWeight: 'bold', marginTop: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginTop: 5, backgroundColor: '#fff' },
  inputHalf: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginTop: 5, width: '48%', backgroundColor: '#fff' },
  buttonContainer: { marginTop: 20 },
  resultContainer: { marginTop: 30, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 },
  resultHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  card: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  cardAddress: { color: '#666', fontSize: 12, marginBottom: 5 },
  cardDesc: { fontStyle: 'italic', color: '#444' }
});