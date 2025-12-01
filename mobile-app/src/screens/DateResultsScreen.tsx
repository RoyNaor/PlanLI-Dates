import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export const DateResultsScreen = ({ route, navigation }: any) => {
  const { result } = route.params;
  const { l1, l2, lmid, aiSuggestions } = result.data;
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (mapRef.current) {
        // Collect all coordinates to fit map
        const coords = [
            { latitude: l1.lat, longitude: l1.lng },
            { latitude: l2.lat, longitude: l2.lng },
            { latitude: lmid.lat, longitude: lmid.lng },
            ...aiSuggestions.map((s: any) => s.placeDetails ? ({
                latitude: s.placeDetails.geometry.location.lat,
                longitude: s.placeDetails.geometry.location.lng
            }) : null).filter((c: any) => c)
        ];

      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 100, right: 50, bottom: 300, left: 50 }, // Bottom padding for sheet
        animated: true,
      });
    }
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.placeName}>{item.name}</Text>
      <Text style={styles.rating}>⭐ {item.placeDetails?.rating || 'N/A'} ({item.placeDetails?.user_ratings_total || 0})</Text>
      <Text style={styles.address} numberOfLines={1}>{item.placeDetails?.formatted_address}</Text>
      <Text style={styles.desc} numberOfLines={3}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
      >
        <Marker coordinate={{ latitude: l1.lat, longitude: l1.lng }} title="You" pinColor="blue" />
        <Marker coordinate={{ latitude: l2.lat, longitude: l2.lng }} title="Them" pinColor="red" />
        <Marker coordinate={{ latitude: lmid.lat, longitude: lmid.lng }} title="Midpoint" pinColor="yellow" />

        {aiSuggestions.map((item: any, index: number) => {
            if (!item.placeDetails) return null;
            return (
                <Marker
                    key={index}
                    coordinate={{
                        latitude: item.placeDetails.geometry.location.lat,
                        longitude: item.placeDetails.geometry.location.lng
                    }}
                    title={item.name}
                    pinColor="purple"
                />
            );
        })}
      </MapView>

      <View style={styles.bottomSheet}>
        <Text style={styles.resultsTitle}>Top Picks For You</Text>
        <FlatList
          data={aiSuggestions}
          renderItem={renderItem}
          keyExtractor={(item) => item.name}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Text style={{color: '#C2185B', fontWeight: 'bold'}}>New Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10,
    color: '#333',
  },
  card: {
    width: 280,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'space-between'
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  address: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  desc: {
    fontSize: 12,
    color: '#444',
    fontStyle: 'italic',
  },
  closeButton: {
      alignItems: 'center',
      marginTop: 10,
      padding: 10
  }
});
