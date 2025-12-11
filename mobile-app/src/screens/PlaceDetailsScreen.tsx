import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Share,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/styles';
import { useIsRTL } from '../hooks/useIsRTL';
import { AiRecommendation, PlaceDetails, PlanLiReview } from '../components/VenueCard';
import { ApiService } from '../services/api';
import { auth } from '../config/firebase';
import HeaderImages from '../components/place-details/HeaderImages';
import InfoTab from '../components/place-details/InfoTab';
import ReviewFormCard from '../components/place-details/ReviewFormCard';
import ReviewsList from '../components/place-details/ReviewsList';

export const PlaceDetailsScreen = ({ route, navigation }: any) => {
  const isRTL = useIsRTL();

  const baseData = route.params.place as AiRecommendation;

  const [serverData, setServerData] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const displayData: AiRecommendation = {
    ...baseData,
    placeDetails: {
      ...baseData.placeDetails,
      ...serverData,
      planLi: serverData?.planLi || baseData.placeDetails?.planLi || baseData.planLi
    }
  };

  const details = displayData.placeDetails || {};
  const planLi = details.planLi;
  const placeId = details.place_id || baseData.place_id || baseData.googlePlaceId || details.googlePlaceId;

  const fetchDetails = useCallback(async () => {
    if (!placeId) {
      console.warn('No Place ID found for details fetch');
      setLoading(false);
      return;
    }

    try {
      const updatedDetails = await ApiService.get<PlaceDetails>(`/places/${placeId}/details`);
      setServerData(updatedDetails);
    } catch (error) {
      console.error('Failed to fetch place details:', error);
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const updatePlanLiReviews = useCallback(
    (updater: (reviews: PlanLiReview[]) => PlanLiReview[] | PlanLiReview[]) => {
      setServerData((prev) => {
        if (!prev) return prev;
        const planLiData = prev.planLi || { rating: 0, reviewCount: 0, reviews: [] as PlanLiReview[] };
        const currentReviews = planLiData.reviews || [];
        return {
          ...prev,
          planLi: { ...planLiData, reviews: updater(currentReviews) }
        };
      });
    },
    []
  );

  const handleOpenMap = () => {
    const query = encodeURIComponent(baseData.search_query || details.name || '');
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
        message: `Check out this place: ${baseData.name}\n${details.formatted_address || ''}`
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('אופס', 'נשמח לדירוג לבבות לפני השליחה ❤️');
      return;
    }

    if (!placeId) {
      Alert.alert('שגיאה', 'מזהה המקום חסר');
      return;
    }

    setSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('שגיאה', 'יש להתחבר כדי לכתוב ביקורת');
        return;
      }

      const payload = {
        googlePlaceId: placeId,
        rating,
        content: reviewText
      };

      await ApiService.post('/reviews', payload);

      setIsSubmitted(true);
      setReviewText('');
      setRating(0);
      await fetchDetails();
    } catch (error) {
      console.error(error);
      Alert.alert('שגיאה', 'לא הצלחנו לשלוח את הביקורת. נסה שוב.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (reviewId: string) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('שגיאה', 'יש להתחבר כדי לעשות לייק');
      return;
    }

    const previousReviews = planLi?.reviews ? [...planLi.reviews] : [];

    updatePlanLiReviews((reviews) =>
      reviews.map((rev) => {
        if ((rev._id || '') === reviewId) {
          const likes = rev.likes || [];
          const hasLiked = likes.includes(user.uid);
          return { ...rev, likes: hasLiked ? likes.filter((id) => id !== user.uid) : [...likes, user.uid] };
        }
        return rev;
      })
    );

    try {
      const response = await ApiService.post<{ review: PlanLiReview }>(`/reviews/${reviewId}/toggle-like`, {});
      const updatedReview = response.review;
      updatePlanLiReviews((reviews) =>
        reviews.map((rev) => ((rev._id || '') === (updatedReview._id || '') ? updatedReview : rev))
      );
    } catch (error) {
      console.error(error);
      Alert.alert('שגיאה', 'לא הצלחנו לעדכן את הלייק.');
      updatePlanLiReviews(() => previousReviews);
    }
  };

  const handleReply = async (reviewId: string, content: string) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('שגיאה', 'יש להתחבר כדי להשיב');
      return;
    }

    try {
      const updatedReview = await ApiService.post<PlanLiReview>(`/reviews/${reviewId}/reply`, { content });
      updatePlanLiReviews((reviews) =>
        reviews.map((rev) => ((rev._id || '') === (updatedReview._id || '') ? updatedReview : rev))
      );
    } catch (error) {
      console.error(error);
      Alert.alert('שגיאה', 'לא הצלחנו לשלוח את התגובה. נסה שוב.');
    }
  };

  const headerImages = useMemo(() => baseData.imageUrls || [], [baseData.imageUrls]);

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
        <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
          תגובות ({planLi?.reviewCount || 0})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderReviewForm = () => (
    <ReviewFormCard
      rating={rating}
      onRatingChange={setRating}
      reviewText={reviewText}
      onReviewTextChange={setReviewText}
      onSubmit={handleSubmitReview}
      submitting={submitting}
      isSubmitted={isSubmitted}
      isRTL={isRTL}
    />
  );

  const renderInfoTab = () => (
    <InfoTab
      isRTL={isRTL}
      details={details}
      baseAddress={baseData.search_query}
      priceLevel={details.price_level}
      reviewFormCard={renderReviewForm()}
      onOpenMap={handleOpenMap}
      onCall={handleCall}
      onWebsite={handleWebsite}
      onShare={handleShare}
    />
  );

  const renderReviewsTab = () => (
    <View style={styles.reviewTabContent}>
      <ReviewFormCard
        rating={rating}
        onRatingChange={setRating}
        reviewText={reviewText}
        onReviewTextChange={setReviewText}
        onSubmit={handleSubmitReview}
        submitting={submitting}
        isSubmitted={isSubmitted}
        isRTL={isRTL}
        variant="minimal"
      />

      <ReviewsList
        reviews={planLi?.reviews || []}
        onReply={handleReply}
        onToggleLike={handleToggleLike}
        currentUserId={auth.currentUser?.uid}
        isRTL={isRTL}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <HeaderImages images={headerImages} onBack={() => navigation.goBack()} isRTL={isRTL} />

        <View style={styles.contentContainer}>
          <View style={[styles.headerSection, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <Text style={styles.title}>{baseData.name}</Text>
            <View style={[styles.subHeaderRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={styles.category}>{baseData.category}</Text>
              <Text style={styles.dot}>•</Text>

              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.rating}>
                {planLi?.rating ? `${planLi.rating.toFixed(1)}` : details.rating || 'New'}
              </Text>

              <Text style={styles.dot}>•</Text>
              <Text style={styles.price}>{details.price_level ? '💰'.repeat(details.price_level) : ''}</Text>
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTabButton: { borderBottomColor: colors.primary },
  tabText: { fontSize: 16, color: '#999', fontWeight: '600' },
  activeTabText: { color: colors.primary, fontWeight: 'bold' },
  reviewTabContent: { paddingVertical: 5 }
});

export default PlaceDetailsScreen;
