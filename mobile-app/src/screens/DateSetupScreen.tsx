import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Button, Text, Alert, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LocationSearch, Location } from '../components/LocationSearch';
import { ApiService } from '../services/api';

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
      Alert.alert('Error', 'Please select both locations');
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

        navigation.navigate('DateResults', { result });
    } catch (e: any) {
        console.error(e);
        Alert.alert("Error", e.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Plan a Date</Text>

      <View style={{ zIndex: 2, marginBottom: 10 }}>
        <LocationSearch
            placeholder="Your Location (L1)"
            onLocationSelected={setL1}
            zIndex={2}
        />
      </View>
      <View style={{ zIndex: 1, marginBottom: 20 }}>
        <LocationSearch
            placeholder="Their Location (L2)"
            onLocationSelected={setL2}
            zIndex={1}
        />
      </View>

      <Text style={styles.label}>Strategy</Text>
      <View style={styles.row}>
        {['MIDPOINT', 'NEAR_ME', 'NEAR_THEM'].map((s) => (
            <TouchableOpacity
                key={s}
                style={[styles.chip, strategy === s && styles.chipSelected]}
                onPress={() => setStrategy(s as any)}
            >
                <Text style={[styles.chipText, strategy === s && styles.chipTextSelected]}>{s.replace('_', ' ')}</Text>
            </TouchableOpacity>
        ))}
      </View>

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

      <View style={styles.buttonContainer}>
        {loading ? <ActivityIndicator color="#C2185B" /> : <Button title="Find Perfect Spot" onPress={handleCalculate} color="#C2185B" />}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#C2185B',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C2185B',
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  chipSelected: {
    backgroundColor: '#C2185B',
  },
  chipText: {
    color: '#C2185B',
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#fff',
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonContainer: {
    marginTop: 30,
  }
});
