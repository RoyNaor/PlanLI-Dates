import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Button, Text, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LocationSearch, Location } from '../components/LocationSearch';

export const CreateDateScreen = ({ navigation }: any) => {
  const [l1, setL1] = useState<Location | null>(null);
  const [l2, setL2] = useState<Location | null>(null);
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

  const handleCalculate = async () => {
    if (!l1 || !l2) {
      Alert.alert('Error', 'Please select both locations');
      return;
    }
    // Call API stub
    Alert.alert("Ready", "Calculated logic would run here.");
    console.log("L1:", l1);
    console.log("L2:", l2);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plan a Date</Text>

      {/* Inputs with zIndex to handle dropdown overlap */}
      <View style={{ zIndex: 2 }}>
        <LocationSearch
            placeholder="Your Location (L1)"
            onLocationSelected={setL1}
            zIndex={2}
        />
      </View>
      <View style={{ zIndex: 1 }}>
        <LocationSearch
            placeholder="Their Location (L2)"
            onLocationSelected={setL2}
            zIndex={1}
        />
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
        <Button title="Find Meeting Point" onPress={handleCalculate} color="#C2185B" />
      </View>
    </View>
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
    color: '#C2185B', // Primary Color
    marginBottom: 20,
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonContainer: {
    marginTop: 20,
  }
});
