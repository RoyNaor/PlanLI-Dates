import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { colors } from '../theme/styles';
import { useTranslation } from 'react-i18next';
import { useIsRTL } from '../hooks/useIsRTL';
import { VenueCard } from '../components/VenueCard';

const { width } = Dimensions.get('window');

export const DateResultsScreen = ({ route, navigation }: any) => {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  
  const result = route.params?.result?.data || route.params?.result;
  
  if (!result) {
      return (
          <View style={styles.container}>
              <Text style={{textAlign: 'center', marginTop: 50}}>{t('dateResults.errorLoading')}</Text>
          </View>
      );
  }

  const { l1, l2, lmid, focusPoint, aiSuggestions } = result; 
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const centerToFocus = focusPoint || lmid;

    if (mapRef.current && centerToFocus) {
      const radiusInMeters = 2500; 
      const delta = (radiusInMeters * 2.5) / 111000;

      const region = {
        latitude: centerToFocus.lat, 
        longitude: centerToFocus.long,
        latitudeDelta: delta,
        longitudeDelta: delta,
      };

      mapRef.current.animateToRegion(region, 1000);
    }
  }, [focusPoint, lmid]);

  const handleVenuePress = (item: any) => {
    navigation.navigate('PlaceDetails', { place: item });
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
        <VenueCard 
            item={item} 
            onPress={() => handleVenuePress(item)} 
        />
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
      >
        <Marker coordinate={{ latitude: l1.lat, longitude: l1.long }} title="You" pinColor="blue" />
        {l2 && <Marker coordinate={{ latitude: l2.lat, longitude: l2.long }} title="Them" pinColor="red" />}
        <Marker coordinate={{ latitude: lmid.lat, longitude: lmid.long }} title="Midpoint" pinColor="yellow" />

        {aiSuggestions.map((item: any, index: number) => {
            if (!item.placeDetails?.geometry?.location) return null;
            
            return (
                <Marker
                    key={index}
                    coordinate={{
                        latitude: item.placeDetails.geometry.location.lat,
                        longitude: item.placeDetails.geometry.location.lng
                    }}
                    pinColor={colors.primary}
                    onCalloutPress={() => handleVenuePress(item)} // לחיצה גם מהבלון במפה
                >
                    <Callout>
                        <View style={{ width: 150 }}>
                            <Text style={{ fontWeight: 'bold', textAlign: isRTL ? 'right' : 'left' }}>{item.name}</Text>
                            <Text style={{ fontSize: 12, textAlign: isRTL ? 'right' : 'left' }}>{item.matchScore}% Match</Text>
                        </View>
                    </Callout>
                </Marker>
            );
        })}
      </MapView>

      {/* Bottom Sheet Area */}
      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        <Text style={[styles.resultsTitle, { textAlign: isRTL ? 'right' : 'left', marginRight: isRTL ? 20 : 0, marginLeft: isRTL ? 0 : 20 }]}>
            {t('dateResults.topPicks')}
        </Text>
        
        <FlatList
          data={aiSuggestions}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
          snapToInterval={275} // הותאם לרווח החדש (260 + 15)
          decelerationRate="fast"
          inverted={isRTL} 
        />
        
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Text style={styles.closeButtonText}>{t('dateResults.tryAgain')}</Text>
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
    height: '100%', // המפה תופסת הכל, והבוטום שיט צף עליה
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 350, // גובה קבוע שמתאים לכרטיס החדש (320) + כותרת וכפתור
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text,
  },
  closeButton: {
      alignItems: 'center',
      paddingVertical: 15,
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
      marginTop: 5
  },
  closeButtonText: {
      color: colors.primary,
      fontWeight: 'bold',
      fontSize: 16
  }
});