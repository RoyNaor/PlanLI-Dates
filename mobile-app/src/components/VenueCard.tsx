import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { colors } from '../theme/styles';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useIsRTL } from '../hooks/useIsRTL';

// הממשק המעודכן
export interface AiRecommendation {
  name: string;
  search_query: string;
  description: string;
  matchScore: number;
  category: 'Food' | 'Drink' | 'Activity' | 'Nature' | 'Culture' | string; // גמישות לסטרינגים
  timeOfDay: 'Day' | 'Night' | 'Any' | string;
  placeDetails?: any;
}

interface Props {
  item: AiRecommendation;
}

// קונפיגורציה לאייקונים וצבעים לפי הקטגוריה
const getCategoryConfig = (category: string) => {
  // נרמול הטקסט (למקרה שה-AI מחזיר אות קטנה)
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

export const VenueCard = ({ item }: Props) => {
  const isRTL = useIsRTL();
  const googleData = item.placeDetails;
  // ברירת מחדל אם ה-AI לא החזיר קטגוריה (ליתר ביטחון)
  const catConfig = getCategoryConfig(item.category || 'General'); 
  const timeOfDay = item.timeOfDay || 'Any';

  const handleOpenMaps = () => {
    // פתיחת גוגל מפות לניווט
    const query = encodeURIComponent(item.search_query);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <TouchableOpacity 
        activeOpacity={0.9} 
        style={[styles.card, { direction: isRTL ? 'rtl' : 'ltr' }]} 
        onPress={handleOpenMaps}
    >
      
      {/* צד שמאל/ימין - האייקון הגדול */}
      <View style={styles.imageContainer}>
         <View style={[styles.categoryIconBadge, { backgroundColor: catConfig.color }]}>
            <MaterialCommunityIcons name={catConfig.icon as any} size={28} color="#fff" />
         </View>
      </View>

      <View style={[styles.content, isRTL ? { paddingRight: 12 } : { paddingLeft: 12 }]}>
        
        {/* כותרת וציון התאמה */}
        <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
                {item.name}
            </Text>
            <View style={styles.scoreBadge}>
                <Text style={styles.scoreText}>{item.matchScore}%</Text>
            </View>
        </View>

        <Text style={[styles.description, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
            {item.description}
        </Text>

        {/* --- שורת התגיות החדשה --- */}
        <View style={[styles.tagsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            
            {/* תגית קטגוריה */}
            <View style={[styles.tag, { backgroundColor: `${catConfig.color}20` }]}> 
                <Text style={[styles.tagText, { color: catConfig.color }]}>{catConfig.label}</Text>
            </View>

            {/* תגית יום/לילה */}
            <View style={[styles.tag, { backgroundColor: '#F5F5F5', marginHorizontal: 6 }]}>
                <MaterialCommunityIcons name={getTimeIcon(timeOfDay)} size={14} color="#666" style={isRTL ? { marginLeft: 4 } : { marginRight: 4 }} />
                <Text style={[styles.tagText, { color: '#666' }]}>{timeOfDay}</Text>
            </View>
            
            {/* דירוג גוגל */}
            {googleData?.rating && (
                <View style={[styles.tag, { backgroundColor: '#FFF8E1' }]}>
                    <Ionicons name="star" size={12} color="#FFA000" style={isRTL ? { marginLeft: 4 } : { marginRight: 4 }} />
                    <Text style={[styles.tagText, { color: '#FFA000' }]}>{googleData.rating}</Text>
                </View>
            )}
        </View>

        {/* פוטר - כתובת וכפתור ניווט */}
        <View style={[styles.footer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.address, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
                {googleData?.formatted_address || item.search_query}
            </Text>
            <Text style={styles.linkText}>Nav -{'>'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 290, // הותאם לרשימה אופקית
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 15, // מרווח בין כרטיסים
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    // Shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    width: 50,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4
  },
  categoryIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  scoreBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4
  },
  scoreText: {
    color: '#2E7D32',
    fontWeight: '700',
    fontSize: 11,
  },
  description: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 10,
  },
  tagsRow: {
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap'
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  footer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto', // דוחף את הפוטר למטה
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f9f9f9',
  },
  address: {
    fontSize: 11,
    color: '#999',
    flex: 1,
    marginHorizontal: 4,
  },
  linkText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: 'bold',
  }
});