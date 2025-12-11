import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/styles';
import { PlanLiReply, PlanLiReview } from '../VenueCard';

interface ReviewsListProps {
  reviews: PlanLiReview[];
  onReply: (reviewId: string, content: string) => Promise<void> | void;
  onToggleLike: (reviewId: string) => Promise<void> | void;
  currentUserId?: string | null;
  isRTL: boolean;
}

const formatTimestamp = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'הרגע';
  if (minutes < 60) return `${minutes} דק'`;
  if (hours < 24) return `${hours} שעות`;  
  if (days < 7) return `${days} ימים`;

  return date.toLocaleDateString();
};

export const ReviewsList: React.FC<ReviewsListProps> = ({ reviews, onReply, onToggleLike, currentUserId, isRTL }) => {
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const textSpacing = isRTL ? { marginRight: 6 } : { marginLeft: 6 };

  const handleReplySubmit = async (reviewId: string) => {
    const text = replyInputs[reviewId]?.trim();
    if (!text) return;
    setSubmittingId(reviewId);
    try {
      await onReply(reviewId, text);
      setReplyInputs((prev) => ({ ...prev, [reviewId]: '' }));
      setOpenReplies((prev) => ({ ...prev, [reviewId]: false }));
    } catch (error) {
      console.error('Failed to submit reply', error);
    } finally {
      setSubmittingId(null);
    }
  };

  const renderLikes = (item: PlanLiReply, onToggle?: () => void) => {
    const likes = item.likes || [];
    const liked = currentUserId ? likes.includes(currentUserId) : false;
    return (
      <TouchableOpacity style={styles.actionRow} onPress={onToggle} disabled={!onToggle}>
        <Ionicons name={liked ? 'heart' : 'heart-outline'} size={16} color={liked ? colors.primary : '#666'} />
        <Text style={[styles.actionText, textSpacing, liked && { color: colors.primary }]}>{likes.length}</Text>
      </TouchableOpacity>
    );
  };

  const renderReply = (reply: PlanLiReply, depth: number) => {
    return (
      <View
        key={reply._id || reply.content}
        style={[styles.replyItem, isRTL ? { marginRight: depth * 12 } : { marginLeft: depth * 12 }]}
      >
        <View style={[styles.replyThreadLine, isRTL ? { marginLeft: 8 } : { marginRight: 8 }]} />
        <View style={{ flex: 1 }}>
          <View style={[styles.reviewHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.reviewAvatar, styles.miniAvatar]}>
              <Text style={styles.reviewAvatarText}>{reply.authorName?.charAt(0) || 'A'}</Text>
            </View>
            <View style={{ flex: 1, marginHorizontal: 10, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
              <Text style={styles.replyAuthor}>{reply.authorName}</Text>
              <Text style={styles.timestamp}>{formatTimestamp(reply.createdAt)}</Text>
            </View>
          </View>
          <Text style={[styles.reviewContent, { textAlign: isRTL ? 'right' : 'left' }]}>{reply.content}</Text>
          {renderLikes(reply)}
          {reply.replies?.map((nested) => renderReply(nested, depth + 1))}
        </View>
      </View>
    );
  };

  const renderReview = (review: PlanLiReview) => {
    const likes = review.likes || [];
    const liked = currentUserId ? likes.includes(currentUserId) : false;
    const reviewId = review._id || '';
    const replyCount = review.replies?.length || 0;
    const repliesExpanded = expandedReplies[reviewId];

    return (
      <View key={reviewId} style={styles.reviewItem}>
        <View style={[styles.reviewHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={styles.reviewAvatar}>
            <Text style={styles.reviewAvatarText}>{review.authorName?.charAt(0) || 'A'}</Text>
          </View>
          <View style={{ flex: 1, marginHorizontal: 10, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
            <Text style={styles.reviewAuthor}>{review.authorName}</Text>
            <View style={[styles.ratingRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {[...Array(5)].map((_, i) => (
                <Ionicons key={i} name={i < review.rating ? 'heart' : 'heart-outline'} size={12} color={colors.primary} />
              ))}
            </View>
            <Text style={styles.timestamp}>{formatTimestamp(review.createdAt)}</Text>
          </View>
          <TouchableOpacity style={styles.inlineLike} onPress={() => onToggleLike(reviewId)}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? colors.primary : '#666'} />
            <Text style={[styles.actionText, liked && { color: colors.primary }]}>{likes.length}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.reviewContent, { textAlign: isRTL ? 'right' : 'left' }]}>{review.content}</Text>

        <View style={[styles.actionsBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.actionRow} onPress={() => setOpenReplies((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }))}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color="#666" />
            <Text style={[styles.actionText, textSpacing]}>השב</Text>
          </TouchableOpacity>
          {replyCount > 0 && (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() =>
                setExpandedReplies((prev) => ({
                  ...prev,
                  [reviewId]: !prev[reviewId]
                }))
              }
            >
              <Ionicons name={repliesExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#666" />
              <Text style={[styles.actionText, textSpacing]}>
                {repliesExpanded ? 'הסתר תגובות' : `צפה ב-${replyCount} תגובות`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {openReplies[reviewId] && (
          <View style={[styles.replyBox, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TextInput
              style={[
                styles.replyInput,
                { textAlign: isRTL ? 'right' : 'left' },
                isRTL ? { marginLeft: 8 } : { marginRight: 8 }
              ]} 
              placeholder="כתוב תגובה" 
              value={replyInputs[reviewId] || ''} 
              onChangeText={(text) => setReplyInputs((prev) => ({ ...prev, [reviewId]: text }))} 
            /> 
            <TouchableOpacity
              style={[styles.replySend, submittingId === reviewId && { opacity: 0.7 }]}
              onPress={() => handleReplySubmit(reviewId)}
              disabled={submittingId === reviewId}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {repliesExpanded && review.replies?.map((reply) => renderReply(reply, 1))}
      </View>
    );
  };

  if (!reviews || reviews.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
        <Text style={{ color: '#999', fontSize: 14, marginTop: 10 }}>היו הראשונים לכתוב ביקורת!</Text>
      </View>
    );
  }

  const orderedReviews = useMemo(
    () => [...reviews].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')),
    [reviews]
  );

  return <View style={styles.tabContent}>{orderedReviews.map((review) => renderReview(review))}</View>;
};

const styles = StyleSheet.create({
  tabContent: { paddingVertical: 5 },
  emptyState: { marginTop: 50, alignItems: 'center' },
  reviewItem: {
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  reviewHeader: {
    alignItems: 'center',
    marginBottom: 6
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fbe9f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0c6d8'
  },
  miniAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f3f3',
    borderColor: '#e6e6e6'
  },
  reviewAvatarText: { fontWeight: 'bold', color: '#666' },
  reviewAuthor: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  replyAuthor: { fontWeight: '600', fontSize: 13, color: '#444' },
  reviewContent: { fontSize: 14, color: '#555', lineHeight: 20 },
  ratingRow: { marginTop: 4 },
  timestamp: { fontSize: 12, color: '#999', marginTop: 4 },
  actionsBar: { marginTop: 10, justifyContent: 'space-between' },
  inlineLike: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#fdf2f6'
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  actionText: { color: '#666', fontSize: 13 },
  replyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10
  },
  replyThreadLine: {
    width: 2,
    borderRadius: 2,
    backgroundColor: '#f0c6d8'
  },
  replyBox: {
    marginTop: 10,
    alignItems: 'center'
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14
  },
  replySend: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8
  }
});

export default ReviewsList;
