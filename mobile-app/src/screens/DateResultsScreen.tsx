import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { colors, globalStyles } from '../theme/styles'; // וודא שיש לך את זה
import { useTranslation } from 'react-i18next';
import { useIsRTL } from '../hooks/useIsRTL';

const { width } = Dimensions.get('window');

export const DateResultsScreen = ({ route, navigation }: any) => {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  // קבלה בטוחה של הנתונים
  const result = route.params?.result?.data || route.params?.result;
  
  if (!result) {
      return (
          <View style={styles.container}>
              <Text>{t('dateResults.errorLoading')}</Text>
          </View>
      );
  }

  const { l1, l2, lmid, aiSuggestions } = result;
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (mapRef.current && aiSuggestions.length > 0) {
        // איסוף כל הנקודות כדי למרכז את המפה
        const points = [
            { latitude: l1.lat, longitude: l1.lng },
            { latitude: l2.lat, longitude: l2.lng },
            // מסננים רק מקומות שיש להם פרטים מגוגל
            ...aiSuggestions
                .filter((s: any) => s.placeDetails?.geometry?.location)
                .map((s: any) => ({
                    latitude: s.placeDetails.geometry.location.lat,
                    longitude: s.placeDetails.geometry.location.lng
                }))
        ];

      mapRef.current.fitToCoordinates(points, {
        edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
        animated: true,
      });
    }
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    // אם אין פרטים מגוגל, נציג מידע חלקי (או נדלג)
    const details = item.placeDetails;
    const rating = details?.rating ? `⭐ ${details.rating} (${details.user_ratings_total})` : '';

    return (
        <View style={[styles.card, { direction: isRTL ? 'rtl' : 'ltr' }]}>
            <View style={[styles.cardHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.placeName, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.matchScore}>{item.matchScore}% {t('dateResults.match')}</Text>
            </View>
            
            <Text style={[styles.address, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
                {details?.formatted_address || t('dateResults.addressNotAvailable')}
            </Text>
            
            {rating ? <Text style={[styles.rating, { textAlign: isRTL ? 'right' : 'left' }]}>{rating}</Text> : null}
            
            <Text style={[styles.desc, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={3}>
                "{item.description}"
            </Text>
        </View>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
      >
        {/* המיקומים שלכם */}
        <Marker coordinate={{ latitude: l1.lat, longitude: l1.lng }} title="You" pinColor="blue" />
        <Marker coordinate={{ latitude: l2.lat, longitude: l2.lng }} title="Them" pinColor="red" />
        <Marker coordinate={{ latitude: lmid.lat, longitude: lmid.lng }} title="Midpoint" pinColor="yellow" />

        {/* המקומות המומלצים */}
        {aiSuggestions.map((item: any, index: number) => {
            if (!item.placeDetails?.geometry?.location) return null;
            
            return (
                <Marker
                    key={index}
                    coordinate={{
                        latitude: item.placeDetails.geometry.location.lat,
                        longitude: item.placeDetails.geometry.location.lng
                    }}
                    pinColor={colors.primary} // סגול/ורוד של המותג
                >
                    <Callout>
                        <View style={{ width: 150 }}>
                            <Text style={{ fontWeight: 'bold', textAlign: isRTL ? 'right' : 'left' }}>{item.name}</Text>
                            <Text style={{ fontSize: 12, textAlign: isRTL ? 'right' : 'left' }}>{item.matchScore}% {t('dateResults.match')}</Text>
                        </View>
                    </Callout>
                </Marker>
            );
        })}
      </MapView>

      {/* כרטיסיית התוצאות למטה */}
      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        <Text style={[styles.resultsTitle, { textAlign: isRTL ? 'right' : 'left', marginRight: isRTL ? 20 : 0, marginLeft: isRTL ? 0 : 20 }]}>{t('dateResults.topPicks')}</Text>
        
        <FlatList
          data={aiSuggestions}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
          snapToInterval={300} // רוחב הכרטיס + מרווח
          decelerationRate="fast"
          inverted={isRTL} // היפוך כיוון הגלילה ב-RTL
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
    height: '100%',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%', // קצת יותר גבוה
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
  card: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#eee',
    // Shadow light
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  matchScore: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    backgroundColor: '#FCE4EC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rating: {
    fontSize: 13,
    color: '#F57F17', // Gold color for stars
    marginBottom: 4,
    fontWeight: '600',
  },
  address: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    color: '#424242',
    fontStyle: 'italic',
    lineHeight: 18,
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
