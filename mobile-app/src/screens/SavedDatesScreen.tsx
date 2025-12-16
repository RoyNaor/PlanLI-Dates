import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  I18nManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { colors } from '../theme/styles';
import { SavedDatesService } from '../services/savedDates';
import { SavedDateEntry, SavedPlaylist } from '../utils/places';

export const SavedDatesScreen = () => {
  const navigation = useNavigation<any>();
  const isRTL = I18nManager.isRTL;
  const [savedDates, setSavedDates] = useState<SavedDateEntry[]>([]);
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [loading, setLoading] = useState(true);

  const loadSavedDates = useCallback(async () => {
    setLoading(true);
    const [dates, lists] = await Promise.all([
      SavedDatesService.getSavedDates(selectedPlaylist || undefined),
      SavedDatesService.getPlaylists()
    ]);
    setSavedDates(dates);
    setPlaylists(lists);
    setLoading(false);
  }, [selectedPlaylist]);

  useFocusEffect(
    useCallback(() => {
      loadSavedDates();
    }, [loadSavedDates])
  );

  const activePlaylistLabel = useMemo(() => {
    if (!selectedPlaylist) return 'הכל';
    const match = playlists.find((playlist) => playlist.id === selectedPlaylist);
    return match?.name || 'הכל';
  }, [playlists, selectedPlaylist]);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      return;
    }

    const updated = await SavedDatesService.addPlaylist(newPlaylistName);
    setPlaylists(updated);
    const created = updated[updated.length - 1];
    setSelectedPlaylist(created.id);
    setNewPlaylistName('');
    setShowPlaylistModal(false);
  };

  const formatSavedAt = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSeconds < 60) return 'לפני רגע';
    if (diffSeconds < 3600) return `לפני ${Math.floor(diffSeconds / 60)} דקות`;
    if (diffSeconds < 86400) return `לפני ${Math.floor(diffSeconds / 3600)} שעות`;
    if (diffSeconds < 604800) return `לפני ${Math.floor(diffSeconds / 86400)} ימים`;
    return date.toLocaleDateString('he-IL');
  };

  const resolvePlaylistName = (playlistId?: string) => {
    if (!playlistId) return playlists[0]?.name;
    return playlists.find((pl) => pl.id === playlistId)?.name;
  };

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
    const savedLabel = formatSavedAt(item.savedAt);
    const playlistName = resolvePlaylistName(item.playlistId);

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

        {playlistName && <Text style={styles.cardMeta}>רשימה: {playlistName}</Text>}

        {savedLabel && (
          <Text style={styles.cardDate}>נשמר {savedLabel}</Text>
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
        <>
          <View style={[styles.playlistHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={styles.sectionTitle}>רשימות</Text>
            {selectedPlaylist && (
              <TouchableOpacity
                style={[styles.backToAll, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                onPress={() => setSelectedPlaylist(null)}
              >
                <Ionicons
                  name={isRTL ? 'chevron-forward' : 'chevron-back'}
                  size={16}
                  color={colors.primary}
                  style={isRTL ? { marginLeft: 6 } : { marginRight: 6 }}
                />
                <Text style={styles.backToAllText}>חזרה לכל הדייטים</Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={[
              { id: 'all', name: 'הכל' } as SavedPlaylist,
              ...playlists,
              { id: 'add', name: 'רשימה חדשה' } as SavedPlaylist
            ]}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.playlistChip,
                  selectedPlaylist === item.id || (!selectedPlaylist && item.id === 'all')
                    ? styles.playlistChipActive
                    : undefined,
                  item.id === 'add' ? styles.addPlaylistChip : undefined
                ]}
                onPress={() => {
                  if (item.id === 'add') {
                    setShowPlaylistModal(true);
                  } else if (item.id === 'all') {
                    setSelectedPlaylist(null);
                  } else {
                    setSelectedPlaylist(item.id);
                  }
                }}
              >
                {item.id === 'add' && (
                  <Ionicons
                    name="add"
                    size={16}
                    color="#fff"
                    style={isRTL ? { marginLeft: 6 } : { marginRight: 6 }}
                  />
                )}
                <Text
                  style={[
                    styles.playlistChipText,
                    selectedPlaylist === item.id || (!selectedPlaylist && item.id === 'all')
                      ? styles.playlistChipTextActive
                      : undefined,
                    item.id === 'add' ? styles.addPlaylistChipText : undefined
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.playlistList,
              isRTL ? { flexDirection: 'row-reverse' } : undefined
            ]}
          />

          <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>
            דייטים ב{activePlaylistLabel === 'הכל' ? '' : '־'}{activePlaylistLabel}
          </Text>

          <FlatList
            data={savedDates}
            renderItem={renderItem}
            keyExtractor={(item) => item.placeId}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <Modal
            visible={showPlaylistModal}
            animationType="slide"
            transparent
            onRequestClose={() => setShowPlaylistModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>רשימה חדשה</Text>
                <TextInput
                  value={newPlaylistName}
                  onChangeText={setNewPlaylistName}
                  placeholder="לדוגמה: תל אביב או שמור לאחר כך"
                  style={styles.textInput}
                  placeholderTextColor={colors.textLight}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPlaylistModal(false)}>
                    <Text style={styles.cancelButtonText}>ביטול</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmButton} onPress={handleCreatePlaylist}>
                    <Text style={styles.confirmButtonText}>צור</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    writingDirection: 'rtl'
  },

  /* ===== Header ===== */
  header: {
    borderRadius: 18,
    paddingVertical: 20,
    marginBottom: 18,
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.4,
    textAlign: 'right',
    writingDirection: 'rtl'
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

  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
    writingDirection: 'rtl'
  },
  sectionTitleSpacing: {
    marginTop: 8
  },
  backToAll: {
    alignItems: 'center'
  },
  backToAllText: {
    color: colors.primary,
    fontWeight: '600'
  },
  playlistList: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 8
  },
  playlistChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 8
  },
  playlistChipActive: {
    backgroundColor: `${colors.primary}20`,
    borderColor: colors.primary
  },
  playlistChipText: {
    color: colors.text,
    fontWeight: '600'
  },
  playlistChipTextActive: {
    color: colors.primary
  },
  addPlaylistChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    flexDirection: 'row'
  },
  addPlaylistChipText: {
    color: '#fff',
    fontWeight: '700'
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
    color: colors.text,
    textAlign: 'center'
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
    flexShrink: 1,
    textAlign: 'right'
  },
  cardMeta: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 4,
    textAlign: 'right'
  },
  cardDate: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
    textAlign: 'right'
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
  },

  /* ===== Modal ===== */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    gap: 12
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
    writingDirection: 'rtl'
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    textAlign: 'right'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600'
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700'
  }
});
