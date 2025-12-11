import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/styles';
import { PlaceDetails } from '../VenueCard';

interface InfoTabProps {
  isRTL: boolean;
  details: PlaceDetails;
  baseAddress?: string;
  priceLevel?: number;
  reviewFormCard: React.ReactNode;
  onOpenMap: () => void;
  onCall: () => void;
  onWebsite: () => void;
  onShare: () => void;
}

const renderPriceLevel = (level?: number) => {
  if (!level) return '';
  return '💰'.repeat(level);
};

export const InfoTab: React.FC<InfoTabProps> = ({
  isRTL,
  details,
  baseAddress,
  priceLevel,
  reviewFormCard,
  onOpenMap,
  onCall,
  onWebsite,
  onShare
}) => {
  return (
    <View style={styles.tabContent}>
      {reviewFormCard}

      <View style={[styles.actionsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity style={styles.actionBtn} onPress={onOpenMap}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
            <Ionicons name="navigate" size={24} color="#fff" />
          </View>
          <Text style={styles.actionLabel}>נווט</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onCall} disabled={!details.formatted_phone_number}>
          <View style={[styles.iconCircle, { backgroundColor: details.formatted_phone_number ? '#4CAF50' : '#ccc' }]}>
            <Ionicons name="call" size={24} color="#fff" />
          </View>
          <Text style={styles.actionLabel}>חייג</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onWebsite} disabled={!details.website}>
          <View style={[styles.iconCircle, { backgroundColor: details.website ? '#2196F3' : '#ccc' }]}>
            <Ionicons name="globe-outline" size={24} color="#fff" />
          </View>
          <Text style={styles.actionLabel}>אתר</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
          <View style={[styles.iconCircle, { backgroundColor: '#FF9800' }]}>
            <Ionicons name="share-social" size={24} color="#fff" />
          </View>
          <Text style={styles.actionLabel}>שתף</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoSection}>
        <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Ionicons name="location-outline" size={22} color="#666" />
          <Text style={[styles.infoText, { textAlign: isRTL ? 'right' : 'left' }]}>{details.formatted_address || baseAddress}</Text>
        </View>

        {details.opening_hours && (
          <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row', marginTop: 15 }]}>
            <Ionicons name="time-outline" size={22} color="#666" />
            <Text
              style={[
                styles.infoText,
                { textAlign: isRTL ? 'right' : 'left', color: details.opening_hours.open_now ? 'green' : 'red' }
              ]}
            >
              {details.opening_hours.open_now ? 'פתוח עכשיו' : 'סגור כרגע'}
            </Text>
          </View>
        )}

        {details.rating && (
          <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row', marginTop: 15 }]}>
            <Ionicons name="logo-google" size={22} color="#666" />
            <Text style={[styles.infoText, { textAlign: isRTL ? 'right' : 'left' }]}>Google Rating: {details.rating} ({details.user_ratings_total} reviews)</Text>
          </View>
        )}

        {priceLevel ? (
          <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row', marginTop: 15 }]}>
            <Ionicons name="wallet-outline" size={22} color="#666" />
            <Text style={[styles.infoText, { textAlign: isRTL ? 'right' : 'left' }]}>{renderPriceLevel(priceLevel)}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: { paddingVertical: 5 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 25 },
  actionsRow: { justifyContent: 'space-around', marginTop: 10 },
  actionBtn: { alignItems: 'center' },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 }
  },
  actionLabel: { fontSize: 12, color: '#666', fontWeight: '500' },
  infoSection: {},
  infoRow: { alignItems: 'center' },
  infoText: { fontSize: 15, color: '#333', marginHorizontal: 12, flex: 1, lineHeight: 22 }
});

export default InfoTab;
