import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useIsRTL } from '../hooks/useIsRTL';

// --- Type Definitions matching Backend ---

export interface PlanLiReview {
  _id?: string;
  googlePlaceId: string;
  userId: string;
  authorName: string;
  rating: number;
  content: string;
  createdAt?: string;
}

export interface PlanLiStats {
  rating: number;
  reviewCount: number;
  reviews: PlanLiReview[];
}

// Mimics the "GooglePlace" interface from backend + our extensions
export interface PlaceDetails {
  place_id?: string;
  googlePlaceId?: string; // Internal DB often uses this
  name?: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  price_level?: number;
  opening_hours?: {
    open_now: boolean;
    periods?: any[];
    weekday_text?: string[];
  };
  rating?: number; // Google Rating
  user_ratings_total?: number;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: { photo_reference: string }[];
  planLi?: PlanLiStats; // The new UGC object
}

export interface AiRecommendation {
  name: string;
  search_query: string;
  description: string;
  matchScore: number;
  category: string;
  timeOfDay: string;
  imageUrls: string[];

  // ID references (Flat or inside placeDetails)
  place_id?: string;
  googlePlaceId?: string;

  // Detailed Data
  placeDetails?: PlaceDetails;

  // Fallback for flat structure if needed
  planLi?: PlanLiStats;
}

interface Props {
  item: AiRecommendation;
  onPress: () => void;
}

// --- הגדרות צבעים ואייקונים ---
const getCategoryConfig = (category: string) => {
  const cat = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'General';
  switch (cat) {
    case 'Food': return { icon: 'silverware-fork-knife', color: '#FF7043', label: 'Food' };
    case 'Drink': return { icon: 'glass-cocktail', color: '#EC407A', label: 'Drinks' };
    case 'Activity': return { icon: 'party-popper', color: '#42A5F5', label: 'Fun' };
    case 'Nature': return { icon: 'tree', color: '#66BB6A', label: 'Nature' };
    case 'Culture': return { icon: 'palette', color: '#AB47BC', label: 'Culture' };
    default: return { icon: 'star', color: '#FFA726', label: 'General' };
  }
};

const getTimeIcon = (time: string) => {
    if (time === 'Night') return 'moon-waning-crescent';
    return 'weather-sunny';
};

export const VenueCard = ({ item, onPress }: Props) => {
  const isRTL = useIsRTL();

  // Safe Access to Rating: Try PlanLi first, then Google, then item root
  const planLiRating = item.planLi?.rating || item.placeDetails?.planLi?.rating;
  const googleRating = item.placeDetails?.rating;
  const displayRating = planLiRating || googleRating;

  const catConfig = getCategoryConfig(item.category || 'General'); 
  const timeOfDay = item.timeOfDay || 'Any';

  // --- הלוגיקה החדשה: לוקחים תמונה מהמערך שהשרת שלח ---
  const photoUrl = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : null;

  // תוכן הכרטיס (משותף לשני המצבים)
  const CardContent = () => {
      // אם יש תמונה, הטקסט לבן. אם אין, הוא כהה.
      const titleColor = photoUrl ? '#fff' : '#333';

      // רקע כהה לתגיות אם יש תמונה
      const tagBg = photoUrl ? 'rgba(0,0,0,0.6)' : `${catConfig.color}20`; 
      const tagTextColor = photoUrl ? '#fff' : catConfig.color;
      
      return (
        <View style={[styles.contentOverlay, isRTL ? { paddingRight: 12 } : { paddingLeft: 12 }]}>
            
            {/* חלק עליון: אייקון וציון */}
            <View style={[styles.topRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.iconBadge, { backgroundColor: catConfig.color }]}>
                    <MaterialCommunityIcons name={catConfig.icon as any} size={18} color="#fff" />
                </View>

                <View style={styles.matchBadge}>
                    <Text style={styles.matchText}>{item.matchScore}% Match</Text>
                </View>
            </View>

            {/* חלק תחתון: שם, תיאור ותגיות */}
            <View style={styles.bottomContent}>
                <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left', color: titleColor }]} numberOfLines={2}>
                    {item.name}
                </Text>

                <View style={[styles.tagsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    {/* תגית קטגוריה */}
                    <View style={[styles.tag, { backgroundColor: tagBg, borderColor: photoUrl ? 'rgba(255,255,255,0.2)' : 'transparent' }]}> 
                        <Text style={[styles.tagText, { color: tagTextColor }]}>{catConfig.label}</Text>
                    </View>

                    {/* תגית יום/לילה */}
                    <View style={[styles.tag, { backgroundColor: photoUrl ? 'rgba(0,0,0,0.6)' : '#F5F5F5', marginHorizontal: 6 }]}>
                        <MaterialCommunityIcons name={getTimeIcon(timeOfDay) as any} size={12} color={photoUrl ? '#fff' : '#666'} style={isRTL ? { marginLeft: 4 } : { marginRight: 4 }} />
                        <Text style={[styles.tagText, { color: photoUrl ? '#fff' : '#666' }]}>{timeOfDay}</Text>
                    </View>
                    
                    {/* תגית דירוג */}
                    {displayRating && (
                        <View style={[styles.tag, { backgroundColor: photoUrl ? 'rgba(0,0,0,0.6)' : '#FFF8E1' }]}>
                            <Ionicons name="star" size={10} color="#FFA000" style={isRTL ? { marginLeft: 4 } : { marginRight: 4 }} />
                            <Text style={[styles.tagText, { color: photoUrl ? '#fff' : '#FFA000' }]}>{Number(displayRating).toFixed(1)}</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
      );
  };

  return (
    <TouchableOpacity 
        activeOpacity={0.95} 
        onPress={onPress} 
        style={styles.cardWrapper}
    >
      {photoUrl ? (
          // עיצוב עם תמונת רקע מלאה
          <ImageBackground 
            source={{ uri: photoUrl }} 
            style={styles.cardImage} 
            imageStyle={{ borderRadius: 16 }}
          >
            <View style={styles.darkOverlay}>
                <CardContent />
            </View>
          </ImageBackground>
      ) : (
          // עיצוב ללא תמונה
          <View style={styles.cardPlain}>
             <CardContent />
          </View>
      )}
    </TouchableOpacity>
  );
};

// --- הסטיילים (חזרו להיות גדולים ומרשימים) ---
const styles = StyleSheet.create({
  cardWrapper: {
    width: 260, // רוחב רחב ונעים
    height: 220, // גובה מרשים
    borderRadius: 16,
    marginRight: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardPlain: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)', // שכבת כהות כדי שהטקסט יבלוט
    borderRadius: 16
  },
  contentOverlay: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between' // מפריד בין החלק העליון לתחתון
  },
  
  // --- חלק עליון ---
  topRow: {
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginTop: 4
  },
  iconBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 3,
  },
  matchBadge: {
      backgroundColor: '#fff',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 3,
  },
  matchText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#2E7D32'
  },

  // --- חלק תחתון ---
  bottomContent: {
      marginBottom: 8
  },
  title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#fff', // תמיד לבן על תמונה
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
      marginBottom: 4,
  },
  tagsRow: {
      flexWrap: 'wrap',
      alignItems: 'center'
  },
  tag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 6,
      marginBottom: 4,
      borderWidth: 1,
  },
  tagText: {
      fontSize: 11,
      fontWeight: '600'
  }
});
