import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import { colors } from '../theme/styles';

interface Props {
  radius: number; setRadius: (n: number) => void;
  center: { latitude: number; longitude: number };
}

export const StepRadius = ({ radius, setRadius, center }: Props) => (
  <View>
    <Text style={styles.title}>Search Radius 📏</Text>
    <Text style={styles.subTitle}>{(radius / 1000).toFixed(1)} km around the target</Text>

    <View style={styles.mapContainer}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          ...center,
          latitudeDelta: (radius / 111000) * 2.5,
          longitudeDelta: (radius / 111000) * 2.5,
        }}
        scrollEnabled={false}
      >
        <Marker coordinate={center} pinColor={colors.primary} />
        <Circle center={center} radius={radius} fillColor="rgba(194, 24, 91, 0.2)" strokeColor={colors.primary} />
      </MapView>
    </View>

    <View style={styles.sliderRow}>
      <Text>500m</Text>
      <Slider
        style={{ flex: 1, marginHorizontal: 10 }}
        minimumValue={500} maximumValue={10000} step={100}
        value={radius} onValueChange={setRadius}
        minimumTrackTintColor={colors.primary} thumbTintColor={colors.primary}
      />
      <Text>10km</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  subTitle: { fontSize: 16, color: colors.primary, marginBottom: 10 },
  mapContainer: { height: 250, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
  map: { width: '100%', height: '100%' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 }
});