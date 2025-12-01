import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Button, 
  Text, 
  Alert, 
  TouchableOpacity, 
  ActivityIndicator, 
  FlatList, // <--- חובה להשתמש בזה
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LocationSearch, Location } from '../components/LocationSearch';
import { ApiService } from '../services/api';
import { colors, globalStyles } from '../theme/styles'; // וודא שהאימפורט הזה קיים אצלך

const BUDGETS = ['$', '$$', '$$$'];
const VIBES = ['Romantic', 'Casual', 'Cocktails', 'Activity', 'Coffee'];

export const DateSetupScreen = ({ navigation }: any) => {
  const [l1, setL1] = useState<Location | null>(null);
  const [l2, setL2] = useState<Location | null>(null);
  const [strategy, setStrategy] = useState<'MIDPOINT' | 'NEAR_ME' | 'NEAR_THEM'>('MIDPOINT');
  const [selectedBudget, setSelectedBudget] = useState('$$');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const mapRef = useRef<MapView>(null);

  // זום אוטומטי למפה
  useEffect(() => {
    if (l1 && l2 && mapRef.current) {
      mapRef.current.fitToCoordinates([
        { latitude: l1.lat, longitude: l1.lng },
        { latitude: l2.lat, longitude: l2.lng }
      ], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    } else if (l1 && mapRef.current) {
        mapRef.current.animateToRegion({
            latitude: l1.lat,
            longitude: l1.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        });
    }
  }, [l1, l2]);

  const toggleVibe = (vibe: string) => {
    if (selectedVibes.includes(vibe)) {
      setSelectedVibes(selectedVibes.filter(v => v !== vibe));
    } else {
      setSelectedVibes([...selectedVibes, vibe]);
    }
  };

  const handleCalculate = async () => {
    if (!l1 || !l2) {
      Alert.alert('חסרים נתונים', 'אנא בחר את שני המיקומים');
      return;
    }

    setLoading(true);
    try {
        const preferences = `${selectedBudget} budget, ${selectedVibes.join(', ')}`;
        const result = await ApiService.post('/dates/calculate', {
            l1,
            l2,
            strategy,
            preferences
        });

        navigation.navigate('DateResults', { result: result.data || result }); // תמיכה במבנה תשובה שונה
    } catch (e: any) {
        console.error(e);
        Alert.alert("Error", e.message);
    } finally {
        setLoading(false);
    }
  };

  // --- כל התוכן של המסך נכנס לפה ---
  const renderContent = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.title}>Plan a Date</Text>

      {/* מיקומים (עם Z-Index גבוה כדי שיצופו מעל המפה והכפתורים) */}
      <View style={{ zIndex: 2000, marginBottom: 10 }}>
        <Text style={styles.label}>Where are you?</Text>
        <LocationSearch
            placeholder="חפש את הכתובת שלך..."
            onLocationSelected={setL1}
            zIndex={2000}
            value={l1?.address}
        />
      </View>
      
      <View style={{ zIndex: 1000, marginBottom: 20 }}>
        <Text style={styles.label}>Where are they?</Text>
        <LocationSearch
            placeholder="חפש את הכתובת שלהם..."
            onLocationSelected={setL2}
            zIndex={1000}
            value={l2?.address}
        />
      </View>

      {/* אסטרטגיה */}
      <View style={styles.section}>
        <Text style={styles.label}>Where to meet?</Text>
        <View style={styles.row}>
            {['MIDPOINT', 'NEAR_ME', 'NEAR_THEM'].map((s) => (
                <TouchableOpacity
                    key={s}
                    style={[styles.chip, strategy === s && styles.chipSelected]}
                    onPress={() => setStrategy(s as any)}
                >
                    <Text style={[styles.chipText, strategy === s && styles.chipTextSelected]}>
                        {s === 'MIDPOINT' ? '⚖️ Midpoint' : s === 'NEAR_ME' ? '📍 Near Me' : '🏠 Near Them'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
      </View>

      {/* תקציב */}
      <View style={styles.section}>
        <Text style={styles.label}>Budget</Text>
        <View style={styles.row}>
            {BUDGETS.map((b) => (
                <TouchableOpacity
                    key={b}
                    style={[styles.chip, selectedBudget === b && styles.chipSelected]}
                    onPress={() => setSelectedBudget(b)}
                >
                    <Text style={[styles.chipText, selectedBudget === b && styles.chipTextSelected]}>{b}</Text>
                </TouchableOpacity>
            ))}
        </View>
      </View>

      {/* אווירה (Vibe) */}
      <View style={styles.section}>
        <Text style={styles.label}>Vibe</Text>
        <View style={styles.row}>
            {VIBES.map((v) => (
                <TouchableOpacity
                    key={v}
                    style={[styles.chip, selectedVibes.includes(v) && styles.chipSelected]}
                    onPress={() => toggleVibe(v)}
                >
                    <Text style={[styles.chipText, selectedVibes.includes(v) && styles.chipTextSelected]}>{v}</Text>
                </TouchableOpacity>
            ))}
        </View>
      </View>

      {/* מפה קטנה לתצוגה מקדימה */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
            latitude: 32.0853,
            longitude: 34.7818,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        }}
      >
        {l1 && <Marker coordinate={{ latitude: l1.lat, longitude: l1.lng }} title="You" pinColor="blue" />}
        {l2 && <Marker coordinate={{ latitude: l2.lat, longitude: l2.lng }} title="Them" pinColor="red" />}
      </MapView>

      {/* כפתור פעולה */}
      <View style={styles.buttonContainer}>
        {loading ? (
            <ActivityIndicator size="large" color="#C2185B" />
        ) : (
            <TouchableOpacity style={styles.mainButton} onPress={handleCalculate}>
                <Text style={styles.mainButtonText}>Find Perfect Spot 🚀</Text>
            </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        data={[]} 
        renderItem={null}
        ListHeaderComponent={renderContent}
        keyboardShouldPersistTaps="handled" // <--- זה הפתרון לבאג התקיעה!
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C2185B',
    marginBottom: 25,
    textAlign: 'center',
    marginTop: 10,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  chipSelected: {
    backgroundColor: '#C2185B',
    borderColor: '#C2185B',
  },
  chipText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 14,
  },
  chipTextSelected: {
    color: '#fff',
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 10,
  },
  mainButton: {
    backgroundColor: '#C2185B',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});