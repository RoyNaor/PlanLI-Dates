import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface Props {
  placeholder: string;
  onLocationSelected: (location: Location) => void;
  zIndex?: number;
  value?: string; // חיוני כדי שהטקסט יישאר בשדה
}

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export const LocationSearch = ({ placeholder, onLocationSelected, zIndex = 1, value }: Props) => {
  const ref = useRef<GooglePlacesAutocompleteRef>(null);

  // עדכון הטקסט בשדה אם הערך החיצוני משתנה
  useEffect(() => {
    if (value) {
      ref.current?.setAddressText(value);
    }
  }, [value]);

  return (
    <View style={[styles.container, { zIndex }]}>
      <GooglePlacesAutocomplete
        ref={ref}
        placeholder={placeholder}
        fetchDetails={true}
        onPress={(data, details = null) => {
          if (details) {
            onLocationSelected({
              lat: details.geometry.location.lat,
              lng: details.geometry.location.lng,
              address: data.description,
            });
          }
        }}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: 'he', // שפת ממשק: עברית
          components: 'country:il', // מיקוד: ישראל
        }}
        styles={{
          textInput: styles.input,
          listView: styles.listView,
          container: { flex: 0 },
          row: { backgroundColor: '#fff', direction: 'rtl' }, // כיוון שורה
          description: { color: '#333', textAlign: 'right' }, // טקסט תוצאות לימין
        }}
        textInputProps={{
            textAlign: 'right', // טקסט קלט לימין
            placeholderTextColor: '#999'
        }}
        enablePoweredByContainer={false}
        debounce={200}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    width: '100%',
  },
  input: {
    height: 50,
    backgroundColor: '#FAFAFA', // רקע אפרפר מודרני יותר
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#333',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    textAlign: 'right', // חשוב לעברית
  },
  listView: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#eee',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    position: 'absolute',
    top: 50,
    width: '100%',
    zIndex: 999,
  }
});