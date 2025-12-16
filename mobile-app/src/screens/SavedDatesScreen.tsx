import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { colors } from '../theme/styles';
import { SavedDatesService } from '../services/savedDates';
import { SavedDateEntry } from '../utils/places';

export const SavedDatesScreen = () => {
  const navigation = useNavigation<any>();
  const [savedDates, setSavedDates] = useState<SavedDateEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSavedDates = useCallback(async () => {
    setLoading(true);
    const dates = await SavedDatesService.getSavedDates();
    setSavedDates(dates);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavedDates();
    }, [loadSavedDates])
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="bookmark-outline" size={48} color={colors.primary} />
      <Text style={styles.emptyTitle}>עוד לא שמרת דייטים</Text>
      <Text style={styles.emptySubtitle}>
        פתח מקום אהוב ושמור אותו כדי למצוא אותו כאן במהירות.
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: SavedDateEntry }) => {
    const savedDate = item.savedAt ? new Date(item.savedAt) : null;
    const savedLabel = savedDate
      ? savedDate.toLocaleDateString('he-IL')
      : '';

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.card}
        onPress={() =>
          navigation.navigate('PlaceDetails', { place: item.place })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.place.name}
          </Text>

          <View style={styles.savedBadge}>
            <Ionicons name="bookmark" size={14} color={colors.primary} />
            <Text style={styles.savedBadgeText}>נשמר</Text>
          </View>
        </View>

        <Text style={styles.cardMeta}>{item.place.category}</Text>

        {savedLabel && (
          <Text style={styles.cardDate}>נשמר ב־ {savedLabel}</Text>
        )}

        {/* <Text style={styles.cardDescription} numberOfLines={2}>
          {item.place.description}
        </Text> */}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>הדייטים השמורים שלי</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : savedDates.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={savedDates}
          renderItem={renderItem}
          keyExtractor={(item) => item.placeId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16
  },

  /* ===== Header ===== */
  header: {
    borderRadius: 18,
    paddingVertical: 20,
    marginBottom: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.4
  },

  /* ===== Loader ===== */
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  listContent: {
    paddingBottom: 80
  },

  /* ===== Empty State ===== */
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 10
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center'
  },

  /* ===== Card ===== */
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1
  },
  cardMeta: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 4
  },
  cardDate: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8
  },
  cardDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20
  },

  /* ===== Saved Badge ===== */
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  savedBadgeText: {
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 12
  }
});
