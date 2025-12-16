import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  I18nManager,
  Alert,
  Modal,
  TextInput
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
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingDate, setEditingDate] = useState<SavedDateEntry | null>(null);
  const [modalSelectedPlaylist, setModalSelectedPlaylist] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');

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

  // --- פונקציה חדשה למחיקת פריט ---
  const handleRemoveItem = (placeId: string, placeName: string) => {
    Alert.alert(
      'הסרה מהשמורים',
      `האם אתה בטוח שברצונך להסיר את "${placeName}" מהרשימה?`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'הסר',
          style: 'destructive', // צובע את הכפתור באדום ב-iOS
          onPress: async () => {
            // 1. עדכון אופטימי - מסיר מהמסך מיד
            setSavedDates((prev) => prev.filter((item) => item.placeId !== placeId));
            
            // 2. קריאה לשירות למחיקה בפועל
            // (נניח שיש לך פונקציה כזו, אם אין - צריך להוסיף ב-Service)
            await SavedDatesService.removeDate(placeId);
          }
        }
      ]
    );
  };

  const activePlaylistLabel = useMemo(() => {
    if (!selectedPlaylist) return 'הכל';
    const match = playlists.find((p) => p.id === selectedPlaylist);
    return match?.name || 'הכל';
  }, [playlists, selectedPlaylist]);

  const formatSavedAt = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'הרגע';
    if (diff < 3600) return `לפני ${Math.floor(diff / 60)} דק׳`;
    if (diff < 86400) return `לפני ${Math.floor(diff / 3600)} שעות`;
    if (diff < 604800) return `לפני ${Math.floor(diff / 86400)} ימים`;

    return date.toLocaleDateString('he-IL');
  };

  const resolvePlaylistName = (playlistId?: string) => {
    if (!playlistId) return undefined;
    return playlists.find((p) => p.id === playlistId)?.name;
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingDate(null);
    setNewPlaylistName('');
    setModalSelectedPlaylist(null);
  };

  const openEditModal = (date: SavedDateEntry) => {
    setEditingDate(date);
    setModalSelectedPlaylist(date.playlistId || playlists[0]?.id || null);
    setEditModalVisible(true);
  };

  const handleConfirmPlaylistChange = async () => {
    if (!editingDate || !modalSelectedPlaylist) {
      Alert.alert('שגיאה', 'בחר רשימה לשיוך');
      return;
    }

    await SavedDatesService.updateDatePlaylist(editingDate.placeId, modalSelectedPlaylist);
    closeEditModal();
    await loadSavedDates();
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    const updatedLists = await SavedDatesService.addPlaylist(newPlaylistName);
    setPlaylists(updatedLists);
    const created = updatedLists[updatedLists.length - 1];
    setModalSelectedPlaylist(created.id);
    setNewPlaylistName('');
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
        activeOpacity={0.9} // קצת פחות שקוף בלחיצה כדי שהכפתור הפנימי יבלוט
        style={styles.card}
        onPress={() => navigation.navigate('PlaceDetails', { place: item.place })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>

            {/* שם המקום */}
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.place.name}
            </Text>

            <View style={styles.actionButtons}>
              {/* כפתור מחיקה (במקום ה-Badge הסטטי) */}
              <TouchableOpacity
                  style={styles.deleteButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // מגדיל את שטח הלחיצה
                  onPress={() => handleRemoveItem(item.placeId, item.place.name)}
              >
                  <Ionicons name="trash-outline" size={18} color={colors.error || '#FF4444'} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => openEditModal(item)}
              >
                <Ionicons name="pencil" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>

          </View>
        </View>

        <Text style={styles.cardMeta}>{item.place.category}</Text>

        {playlistName && (
          <Text style={styles.cardMeta}>רשימה: {playlistName}</Text>
        )}

        {savedLabel && (
          <Text style={styles.cardDate}>נשמר {savedLabel}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>הדייטים השמורים שלי</Text>
      </LinearGradient>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <FlatList
            data={[
            { id: 'all', name: 'הכל' } as SavedPlaylist,
            ...playlists
            ]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
                styles.playlistListContent,
                isRTL && { flexDirection: 'row-reverse' } 
            ]}
            renderItem={({ item }) => {
            const isActive =
                (!selectedPlaylist && item.id === 'all') ||
                selectedPlaylist === item.id;

            return (
                <TouchableOpacity
                style={[
                    styles.playlistChip,
                    isActive && styles.playlistChipActive
                ]}
                onPress={() =>
                    item.id === 'all'
                    ? setSelectedPlaylist(null)
                    : setSelectedPlaylist(item.id)
                }
                >
                <Text
                    style={[
                    styles.playlistChipText,
                    isActive && styles.playlistChipTextActive
                    ]}
                >
                    {item.name}
                </Text>
                </TouchableOpacity>
            );
            }}
        />
      </View>

      <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>
        דייטים ב{activePlaylistLabel === 'הכל' ? '' : '־'}
        {activePlaylistLabel}
      </Text>

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

      <Modal transparent visible={editModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>שיוך לרשימה</Text>

            <View style={styles.playlistSection}>
              {playlists.map((playlist) => (
                <TouchableOpacity
                  key={playlist.id}
                  style={[
                    styles.playlistOption,
                    modalSelectedPlaylist === playlist.id && styles.playlistOptionActive
                  ]}
                  onPress={() => setModalSelectedPlaylist(playlist.id)}
                >
                  <Text
                    style={[
                      styles.playlistOptionText,
                      modalSelectedPlaylist === playlist.id && styles.playlistOptionTextActive
                    ]}
                  >
                    {playlist.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.newPlaylistContainer}>
              <Text style={styles.modalSubtitle}>או צור רשימה חדשה</Text>
              <TextInput
                style={styles.textInput}
                placeholder="לדוגמה: תל אביב או לשמור לאחר כך"
                placeholderTextColor={colors.textLight}
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
              />
              <TouchableOpacity style={styles.addPlaylistButton} onPress={handleCreatePlaylist}>
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.addPlaylistButtonText}>הוסף רשימה</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={closeEditModal}>
                <Text style={styles.secondaryButtonText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={handleConfirmPlaylistChange}>
                <Text style={styles.primaryButtonText}>עדכן</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16
  },
  header: {
    borderRadius: 18,
    paddingVertical: 20,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center'
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    paddingBottom: 40
  },
  filtersContainer: {
    marginBottom: 8,
    height: 50,
  },
  playlistListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 8
  },
  playlistChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: 4
  },
  playlistChipActive: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  playlistChipText: {
    color: colors.textLight,
    fontWeight: '500',
    fontSize: 14
  },
  playlistChipTextActive: {
    color: colors.primary,
    fontWeight: '700'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
    alignSelf: 'flex-end'
  },
  sectionTitleSpacing: {
    marginTop: 8,
    marginBottom: 12
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 10,
    marginTop: 40
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
  
  /* ===== Cards Styles Updated ===== */
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3
  },
  cardHeader: {
    marginBottom: 6
  },
  cardTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    flex: 1, // לוקח את כל המקום הפנוי
    textAlign: 'right',
    marginLeft: 10 // מרווח קטן מהאייקון של המחיקה
  },

  actionButtons: {
    alignItems: 'center',
    gap: 8,
    flexDirection: 'column'
  },

  // סגנון חדש לכפתור המחיקה
  deleteButton: {
    padding: 8,
    backgroundColor: '#FFEBEB', // רקע אדמדם עדין מאוד
    borderRadius: 8,
  },

  editButton: {
    padding: 8,
    backgroundColor: `${colors.primary}15`,
    borderRadius: 8,
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
    marginTop: 6,
    textAlign: 'right'
  },

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
    textAlign: 'right'
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 6,
    textAlign: 'right'
  },
  playlistSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 6,
    justifyContent: 'flex-end'
  },
  playlistOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  playlistOptionActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`
  },
  playlistOptionText: {
    color: colors.text,
    fontWeight: '600'
  },
  playlistOptionTextActive: {
    color: colors.primary
  },
  newPlaylistContainer: {
    gap: 8,
    marginTop: 4
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
  addPlaylistButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  addPlaylistButtonText: {
    color: '#fff',
    fontWeight: '700'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8
  },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '600'
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700'
  }
});
