import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface Props {
  placeholder: string;
  onLocationSelected: (location: Location) => void;
  zIndex?: number;
}

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export const LocationSearch = ({ placeholder, onLocationSelected, zIndex = 1 }: Props) => {
  return (
    <View style={[styles.container, { zIndex }]}>
      <GooglePlacesAutocomplete
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
          language: 'en',
        }}
        styles={{
          textInput: styles.input,
          listView: styles.listView,
          container: { flex: 0 },
        }}
        enablePoweredByContainer={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    width: '100%',
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    left: 0,
    right: 0,
    zIndex: 999,
  }
});
