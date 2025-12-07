import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  Share, 
  Dimensions,
  Platform,
  StatusBar 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/styles';
import { useIsRTL } from '../hooks/useIsRTL';
import { AiRecommendation } from '../components/VenueCard'; // מייבאים את הממשק

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 300;

export const PlaceDetailsScreen = ({ route, navigation }: any) => {
  const isRTL = useIsRTL();
  const place = route.params.place as AiRecommendation;
  const details = place.placeDetails || {};

  // --- Helpers ---
  
  const handleOpenMap = () => {
    const query = encodeURIComponent(place.search_query);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`
    });
    Linking.openURL(url || `https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const handleCall = () => {
    if (details.formatted_phone_number) {
      Linking.openURL(`tel:${details.formatted_phone_number}`);
    }
  };

  const handleWebsite = () => {
    if (details.website) {
      Linking.openURL(details.website);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this place for our date: ${place.name}\n${details.formatted_address || ''}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const renderPriceLevel = (level: number) => {
    return '💰'.repeat(level || 2);
  };

  // --- Render Sections ---

  const renderHeaderImages = () => {
    const images = place.imageUrls && place.imageUrls.length > 0 
      ? place.imageUrls 
      : ['https://via.placeholder.com/400x300.png?text=No+Image']; // Fallback

    return (
      <View style={styles.imageContainer}>
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={{ width, height: IMAGE_HEIGHT }}
        >
          {images.map((img, index) => (
            <Image 
              key={index} 
              source={{ uri: img }} 
              style={{ width, height: IMAGE_HEIGHT }} 
              resizeMode="cover"
            />
          ))}
        </ScrollView>
        
        {/* כפתור חזרה צף */}
        <TouchableOpacity 
          style={[styles.backButton, { [isRTL ? 'right' : 'left']: 20 }]} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-down" size={24} color="#333" />
        </TouchableOpacity>

        {/* אינדיקטור לתמונות (אם יש יותר מאחת) */}
        {images.length > 1 && (
            <View style={styles.paginationBadge}>
                <Text style={styles.paginationText}>1 / {images.length}</Text>
            </View>
        )}
      </View>
    );
  };

  const renderActionButtons = () => (
    <View style={[styles.actionsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <TouchableOpacity style={styles.actionBtn} onPress={handleOpenMap}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
            <Ionicons name="navigate" size={24} color="#fff" />
        </View>
        <Text style={styles.actionLabel}>Navigate</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionBtn} onPress={handleCall} disabled={!details.formatted_phone_number}>
        <View style={[styles.iconCircle, { backgroundColor: details.formatted_phone_number ? '#4CAF50' : '#ccc' }]}>
            <Ionicons name="call" size={24} color="#fff" />
        </View>
        <Text style={styles.actionLabel}>Call</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionBtn} onPress={handleWebsite} disabled={!details.website}>
        <View style={[styles.iconCircle, { backgroundColor: details.website ? '#2196F3' : '#ccc' }]}>
            <Ionicons name="globe-outline" size={24} color="#fff" />
        </View>
        <Text style={styles.actionLabel}>Website</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
        <View style={[styles.iconCircle, { backgroundColor: '#FF9800' }]}>
            <Ionicons name="share-social" size={24} color="#fff" />
        </View>
        <Text style={styles.actionLabel}>Share</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {renderHeaderImages()}

        {/* התוכן הראשי - עולה קצת על התמונה */}
        <View style={styles.contentContainer}>
            
            {/* כותרת ופרטים בסיסיים */}
            <View style={[styles.headerSection, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={styles.title}>{place.name}</Text>
                <View style={[styles.subHeaderRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={styles.category}>{place.category}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.rating}>{details.rating || 'New'}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.price}>{renderPriceLevel(details.price_level)}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            {/* --- הלב של האפליקציה: הנימוק של ה-AI --- */}
            <View style={styles.aiBox}>
                <View style={[styles.aiHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <MaterialCommunityIcons name="robot-happy" size={20} color={colors.primary} />
                    <Text style={[styles.aiTitle, isRTL ? { marginRight: 6 } : { marginLeft: 6 }]}>Our AI Says:</Text>
                </View>
                <Text style={[styles.aiText, { textAlign: isRTL ? 'right' : 'left' }]}>
                    "{place.description}"
                </Text>
            </View>

            {/* כפתורי פעולה */}
            {renderActionButtons()}

            <View style={styles.divider} />

            {/* פרטים נוספים (כתובת ושעות) */}
            <View style={styles.infoSection}>
                <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Ionicons name="location-outline" size={20} color="#666" />
                    <Text style={[styles.infoText, { textAlign: isRTL ? 'right' : 'left' }]}>
                        {details.formatted_address || place.search_query}
                    </Text>
                </View>
                
                {details.opening_hours && (
                    <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row', marginTop: 10 }]}>
                        <Ionicons name="time-outline" size={20} color="#666" />
                        <Text style={[styles.infoText, { textAlign: isRTL ? 'right' : 'left', color: details.opening_hours.open_now ? 'green' : 'red' }]}>
                            {details.opening_hours.open_now ? 'Open Now' : 'Closed'}
                        </Text>
                    </View>
                )}
            </View>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageContainer: { position: 'relative' },
  backButton: {
    position: 'absolute',
    top: 50,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  paginationBadge: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12
  },
  paginationText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  
  contentContainer: {
      marginTop: -20, // כדי שיעלה על התמונה
      backgroundColor: '#fff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      minHeight: 500 // שימלא את המסך
  },
  headerSection: { marginBottom: 15 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  subHeaderRow: { alignItems: 'center' },
  category: { fontSize: 14, color: '#666', fontWeight: '600' },
  rating: { fontSize: 14, color: '#333', fontWeight: 'bold', marginHorizontal: 4 },
  price: { fontSize: 14, color: '#666' },
  dot: { fontSize: 14, color: '#ccc', marginHorizontal: 6 },
  
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 20 },

  // AI Box
  aiBox: {
      backgroundColor: '#FFF0F5', // ורוד בהיר מאוד
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#FFC1E3'
  },
  aiHeader: { alignItems: 'center', marginBottom: 8 },
  aiTitle: { fontWeight: 'bold', color: colors.primary, fontSize: 14 },
  aiText: { fontSize: 15, color: '#444', fontStyle: 'italic', lineHeight: 22 },

  // Actions
  actionsRow: { justifyContent: 'space-around', marginTop: 20 },
  actionBtn: { alignItems: 'center' },
  iconCircle: {
      width: 50, height: 50, borderRadius: 25,
      justifyContent: 'center', alignItems: 'center',
      marginBottom: 6,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 }
  },
  actionLabel: { fontSize: 12, color: '#666', fontWeight: '500' },

  // Info
  infoSection: {},
  infoRow: { alignItems: 'flex-start' },
  infoText: { fontSize: 15, color: '#333', marginHorizontal: 10, flex: 1, lineHeight: 20 }
});

