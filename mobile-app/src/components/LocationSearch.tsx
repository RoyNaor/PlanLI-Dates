import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import { colors } from '../theme/styles';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface Props {
  placeholder: string;
  onLocationSelected: (location: Location) => void;
  zIndex?: number;
  value?: string; // <--- הוספנו את זה: הטקסט שאנחנו רוצים להציג
}

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export const LocationSearch = ({ placeholder, onLocationSelected, zIndex = 1, value }: Props) => {
  // יוצרים רפרנס לרכיב של גוגל כדי שנוכל "לדבר" איתו
  const ref = useRef<GooglePlacesAutocompleteRef>(null);

  // בכל פעם שה-Value משתנה (למשל כשבחרת כתובת), נעדכן את הטקסט בשדה
  useEffect(() => {
    if (value) {
      ref.current?.setAddressText(value);
    }
  }, [value]);

  return (
    <View style={[styles.container, { zIndex }]}>
      <GooglePlacesAutocomplete
        ref={ref} // מחברים את הרפרנס
        placeholder={placeholder}
        fetchDetails={true}
        onPress={(data, details = null) => {
          if (details) {
            onLocationSelected({
              lat: details.geometry.location.lat,
              lng: details.geometry.location.lng,
              address: data.description,
            });
            // הטקסט יתעדכן אוטומטית דרך ה-useEffect
          }
        }}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: 'he',
          components: 'country:il',
        }}
        styles={{
          textInput: styles.input,
          listView: styles.listView,
          container: { flex: 0 },
          row: { backgroundColor: '#fff' },
          description: { color: '#333' },
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
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#333',
    textAlign: 'right',
  },
  listView: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#eee',
    position: 'absolute',
    top: 50,
    width: '100%',
    zIndex: 9999,
    elevation: 5,
  },
});