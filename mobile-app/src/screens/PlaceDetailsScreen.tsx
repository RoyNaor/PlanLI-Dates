import React, { useState } from 'react';
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
  StatusBar,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/styles';
import { useIsRTL } from '../hooks/useIsRTL';
import { AiRecommendation } from '../components/VenueCard';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 300;

export const PlaceDetailsScreen = ({ route, navigation }: any) => {
  const isRTL = useIsRTL();
  const place = route.params.place as AiRecommendation;
  const details = place.placeDetails || {};

  // --- State ---
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info'); 
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleSubmitReview = () => {
    if (rating === 0) {
      Alert.alert('אופס', 'נשמח לדירוג לבבות לפני השליחה ❤️');
      return;
    }
    // TODO: Send to backend
    setIsSubmitted(true);
  };

  const renderHeaderImages = () => {
    const images = place.imageUrls && place.imageUrls.length > 0 
      ? place.imageUrls 
      : ['https://via.placeholder.com/400x300.png?text=No+Image']; 

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
        
        <TouchableOpacity 
          style={[styles.backButton, { [isRTL ? 'right' : 'left']: 20 }]} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-down" size={24} color="#333" />
        </TouchableOpacity>

        {images.length > 1 && (
            <View style={styles.paginationBadge}>
                <Text style={styles.paginationText}>1 / {images.length}</Text>
            </View>
        )}
      </View>
    );
  };

  // --- TAB SWITCHER ---
  const renderTabs = () => (
    <View style={[styles.tabContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'info' && styles.activeTabButton]} 
            onPress={() => setActiveTab('info')}
        >
            <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>פרטים</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'reviews' && styles.activeTabButton]} 
            onPress={() => setActiveTab('reviews')}
        >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>תגובות</Text>
        </TouchableOpacity>
    </View>
  );

  // --- ACTION BUTTONS (Reusable) ---
  const renderActionButtons = () => (
    <View style={[styles.actionsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleOpenMap}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                <Ionicons name="navigate" size={24} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>נווט</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleCall} disabled={!details.formatted_phone_number}>
            <View style={[styles.iconCircle, { backgroundColor: details.formatted_phone_number ? '#4CAF50' : '#ccc' }]}>
                <Ionicons name="call" size={24} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>חייג</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleWebsite} disabled={!details.website}>
            <View style={[styles.iconCircle, { backgroundColor: details.website ? '#2196F3' : '#ccc' }]}>
                <Ionicons name="globe-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>אתר</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <View style={[styles.iconCircle, { backgroundColor: '#FF9800' }]}>
                <Ionicons name="share-social" size={24} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>שתף</Text>
        </TouchableOpacity>
    </View>
  );

  // --- NEW: Interactive PlanLi Card ---
  const renderInteractivePlanLiCard = () => {
      if (isSubmitted) {
        return (
            <View style={styles.planLiCard}>
                <View style={{alignItems: 'center', paddingVertical: 20}}>
                     <Ionicons name="checkmark-circle" size={50} color="#fff" />
                     <Text style={[styles.planLiTitle, {marginTop: 10}]}>תודה רבה!</Text>
                     <Text style={[styles.planLiText, {textAlign: 'center'}]}>הקהילה מודה לך ❤️</Text>
                </View>
            </View>
        );
      }

      return (
        <View style={styles.planLiCard}>
            <View style={[styles.planLiHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Ionicons name="people-circle-outline" size={24} color="#fff" />
                <Text style={[styles.planLiTitle, isRTL ? { marginRight: 8 } : { marginLeft: 8 }]}>
                    עזרו לקהילה! הייתם פה?
                </Text>
            </View>
            
            <Text style={[styles.planLiText, { textAlign: isRTL ? 'right' : 'left', marginBottom: 15 }]}>
                 שתפו אותנו כדי שהאלגוריתם ימצא דייטים מושלמים לאחרים.
            </Text>

            {/* Rating Stars on Ruby Background */}
            <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                        <Ionicons 
                            name={star <= rating ? "heart" : "heart-outline"} 
                            size={36} 
                            color="#fff" // כוכבים לבנים על רקע אדום
                            style={{ marginHorizontal: 6 }}
                        />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Input Field - White box inside the red card */}
            <TextInput
                style={[styles.cardInput, { textAlign: isRTL ? 'right' : 'left' }]}
                placeholder="איך הייתה האווירה? ספרו לנו..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={2}
                value={reviewText}
                onChangeText={setReviewText}
            />

            <TouchableOpacity style={styles.cardSubmitBtn} onPress={handleSubmitReview}>
                <Text style={styles.cardSubmitText}>שלח המלצה</Text>
            </TouchableOpacity>
        </View>
      );
  };

  // --- TAB CONTENT: INFO ---
  const renderInfoTab = () => (
    <View style={styles.tabContent}>
        
        {/* הכרטיסייה האינטראקטיבית החדשה */}
        {renderInteractivePlanLiCard()}

        {/* Action Buttons */}
        {renderActionButtons()}

        <View style={styles.divider} />

        {/* Info Details */}
        <View style={styles.infoSection}>
            <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Ionicons name="location-outline" size={22} color="#666" />
                <Text style={[styles.infoText, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {details.formatted_address || place.search_query}
                </Text>
            </View>
            
            {details.opening_hours && (
                <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row', marginTop: 15 }]}>
                    <Ionicons name="time-outline" size={22} color="#666" />
                    <Text style={[styles.infoText, { textAlign: isRTL ? 'right' : 'left', color: details.opening_hours.open_now ? 'green' : 'red' }]}>
                        {details.opening_hours.open_now ? 'פתוח עכשיו' : 'סגור כרגע'}
                    </Text>
                </View>
            )}
        </View>
    </View>
  );

  // --- TAB CONTENT: REVIEWS (List) ---
  const renderReviewsTab = () => (
     <View style={styles.tabContent}>
        <View style={{marginTop: 50, alignItems: 'center'}}>
             <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
             <Text style={{color: '#999', fontSize: 14, marginTop: 10}}>
                 בקרוב: קראו מה אחרים חשבו על המקום הזה.
             </Text>
        </View>
     </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {renderHeaderImages()}

        <View style={styles.contentContainer}>
            
            {/* Header Info */}
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

            {renderTabs()}

            {activeTab === 'info' ? renderInfoTab() : renderReviewsTab()}

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
      marginTop: -20, 
      backgroundColor: '#fff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      minHeight: 500 
  },
  headerSection: { marginBottom: 15 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  subHeaderRow: { alignItems: 'center' },
  category: { fontSize: 14, color: '#666', fontWeight: '600' },
  rating: { fontSize: 14, color: '#333', fontWeight: 'bold', marginHorizontal: 4 },
  price: { fontSize: 14, color: '#666' },
  dot: { fontSize: 14, color: '#ccc', marginHorizontal: 6 },
  
  // --- TABS ---
  tabContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
  },
  tabButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
  },
  activeTabButton: { borderBottomColor: colors.primary },
  tabText: { fontSize: 16, color: '#999', fontWeight: '600' },
  activeTabText: { color: colors.primary, fontWeight: 'bold' },
  tabContent: { paddingVertical: 5 },

  // --- PLANLI CARD (INTERACTIVE) ---
  planLiCard: {
      backgroundColor: colors.primary, 
      borderRadius: 16,
      padding: 20,
      marginBottom: 25,
      elevation: 4,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
  },
  planLiHeader: {
      alignItems: 'center',
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.2)',
      paddingBottom: 8
  },
  planLiTitle: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
      letterSpacing: 0.5
  },
  planLiText: {
      color: '#fff',
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
      opacity: 0.95
  },
  ratingRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 15
  },
  cardInput: {
      backgroundColor: '#fff', // קופסה לבנה בתוך הכרטיס
      borderRadius: 10,
      padding: 12,
      height: 60,
      textAlignVertical: 'top',
      fontSize: 14,
      color: '#333',
      marginBottom: 12
  },
  cardSubmitBtn: {
      backgroundColor: 'rgba(0,0,0,0.3)', // כפתור כהה מעודן על הרקע האדום
      paddingVertical: 10,
      borderRadius: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.4)'
  },
  cardSubmitText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14
  },

  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 25 },
  
  actionsRow: { justifyContent: 'space-around', marginTop: 10 },
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

  infoSection: {},
  infoRow: { alignItems: 'center' }, 
  infoText: { fontSize: 15, color: '#333', marginHorizontal: 12, flex: 1, lineHeight: 22 },
});