import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/styles';

interface ReviewFormCardProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  reviewText: string;
  onReviewTextChange: (text: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  isSubmitted: boolean;
  isRTL: boolean;
}

export const ReviewFormCard: React.FC<ReviewFormCardProps> = ({
  rating,
  onRatingChange,
  reviewText,
  onReviewTextChange,
  onSubmit,
  submitting,
  isSubmitted,
  isRTL
}) => {
  if (isSubmitted) {
    return (
      <View style={styles.planLiCard}>
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Ionicons name="checkmark-circle" size={50} color="#fff" />
          <Text style={[styles.planLiTitle, { marginTop: 10 }]}>תודה רבה!</Text>
          <Text style={[styles.planLiText, { textAlign: 'center' }]}>הקהילה מודה לך ❤️</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.planLiCard}>
      <View style={[styles.planLiHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Ionicons name="people-circle-outline" size={24} color="#fff" />
        <Text style={[styles.planLiTitle, isRTL ? { marginRight: 8 } : { marginLeft: 8 }]}>עזרו לקהילה! הייתם פה?</Text>
      </View>

      <Text style={[styles.planLiText, { textAlign: isRTL ? 'right' : 'left', marginBottom: 15 }]}>
        שתפו אותנו כדי שהאלגוריתם ימצא דייטים מושלמים לאחרים.
      </Text>

      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onRatingChange(star)} activeOpacity={0.7}>
            <Ionicons
              name={star <= rating ? 'heart' : 'heart-outline'}
              size={36}
              color="#fff"
              style={{ marginHorizontal: 6 }}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[styles.cardInput, { textAlign: isRTL ? 'right' : 'left' }]}
        placeholder="איך הייתה האווירה? ספרו לנו..."
        placeholderTextColor="#999"
        multiline
        numberOfLines={2}
        value={reviewText}
        onChangeText={onReviewTextChange}
      />

      <TouchableOpacity style={[styles.cardSubmitBtn, submitting && { opacity: 0.7 }]} onPress={onSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.cardSubmitText}>שלח המלצה</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  planLiCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5
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
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    height: 60,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333',
    marginBottom: 12
  },
  cardSubmitBtn: {
    backgroundColor: 'rgba(0,0,0,0.3)',
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
  }
});

export default ReviewFormCard;
