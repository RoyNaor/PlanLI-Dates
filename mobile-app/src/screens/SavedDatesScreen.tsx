import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { colors } from '../theme/styles';
import { SavedDatesService } from '../services/savedDates';
import { SavedDateEntry } from '../utils/places';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

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
      <Text style={styles.emptySubtitle}>פתח מקום אהוב ושמור אותו כדי למצוא אותו כאן במהירות.</Text>
    </View>
  );

  const renderItem = ({ item }: { item: SavedDateEntry }) => {
    const savedDate = item.savedAt ? new Date(item.savedAt) : null;
    const savedLabel = savedDate ? savedDate.toLocaleDateString('he-IL') : '';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PlaceDetails', { place: item.place })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.place.name}</Text>
          <View style={styles.savedBadge}>
            <Ionicons name="bookmark" size={16} color="#fff" />
            <Text style={styles.savedBadgeText}>נשמר</Text>
          </View>
        </View>
        <Text style={styles.cardMeta}>{item.place.category}</Text>
        {savedLabel ? <Text style={styles.cardDate}>נשמר ב- {savedLabel}</Text> : null}
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.place.description}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>הדייטים השמורים שלי</Text>

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
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 20 },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 20 },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 10
  },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  cardMeta: { fontSize: 14, color: '#777', marginBottom: 4 },
  cardDate: { fontSize: 12, color: '#999', marginBottom: 8 },
  cardDescription: { fontSize: 14, color: '#555' },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  savedBadgeText: { color: '#fff', marginLeft: 4, fontWeight: '600', fontSize: 12 }
});