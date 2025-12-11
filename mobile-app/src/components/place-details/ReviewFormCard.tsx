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
  variant?: 'card' | 'minimal';
}

export const ReviewFormCard: React.FC<ReviewFormCardProps> = ({
  rating,
  onRatingChange,
  reviewText,
  onReviewTextChange,
  onSubmit,
  submitting,
  isSubmitted,
  isRTL,
  variant = 'card'
}) => {
  const isMinimal = variant === 'minimal';
  const heartColor = isMinimal ? colors.primary : '#fff';
  const titleColor = isMinimal ? colors.primary : '#fff';
  const textColor = isMinimal ? '#2c2c2c' : '#fff';

  if (isSubmitted) {
    return (
      <View style={[styles.planLiCard, isMinimal && styles.minimalContainer]}>
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Ionicons name="checkmark-circle" size={50} color={heartColor} />
          <Text style={[styles.planLiTitle, { marginTop: 10, color: titleColor }]}>תודה רבה!</Text>
          <Text style={[styles.planLiText, { textAlign: 'center', color: textColor }]}>הקהילה מודה לך ❤️</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.planLiCard, isMinimal && styles.minimalContainer]}>
      <View
        style={[
          styles.planLiHeader,
          { flexDirection: isRTL ? 'row-reverse' : 'row', borderBottomColor: isMinimal ? 'transparent' : 'rgba(255,255,255,0.2)' }
        ]}
      >
        <Ionicons name="chatbox-ellipses-outline" size={22} color={heartColor} />
        <Text
          style={[
            styles.planLiTitle,
            { color: titleColor },
            isRTL ? { marginRight: 8 } : { marginLeft: 8 },
            isMinimal && styles.minimalTitle
          ]}
        >
          הוספת תגובה חדשה
        </Text>
      </View>

      <Text
        style={[
          styles.planLiText,
          { textAlign: isRTL ? 'right' : 'left', marginBottom: 15, color: textColor },
          isMinimal && styles.minimalText
        ]}
      >
        הלבבות והטקסט כאן בלבד — פשוט ושקוף.
      </Text>

      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onRatingChange(star)} activeOpacity={0.7}>
            <Ionicons
              name={star <= rating ? 'heart' : 'heart-outline'}
              size={36}
              color={heartColor}
              style={{ marginHorizontal: 6 }}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[styles.cardInput, isMinimal && styles.minimalInput, { textAlign: isRTL ? 'right' : 'left' }]}
        placeholder="איך הייתה האווירה? ספרו לנו..."
        placeholderTextColor="#999"
        multiline
        numberOfLines={2}
        value={reviewText}
        onChangeText={onReviewTextChange}
      />

      <TouchableOpacity
        style={[styles.cardSubmitBtn, isMinimal && styles.minimalSubmitBtn, submitting && { opacity: 0.7 }]}
        onPress={onSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={isMinimal ? '#fff' : '#fff'} />
        ) : (
          <Text style={[styles.cardSubmitText, isMinimal && styles.minimalSubmitText]}>שליחת תגובה</Text>
        )}
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
  },
  minimalContainer: {
    backgroundColor: '#f9f9f9',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#ececec'
  },
  minimalTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  minimalText: {
    color: '#4a4a4a'
  },
  minimalInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  minimalSubmitBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12
  },
  minimalSubmitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700'
  }
});

export default ReviewFormCard;
