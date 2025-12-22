import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Comment, Post, PostsService } from '../services/posts.service';
import { colors, globalStyles } from '../theme/styles';

interface CommentsModalProps {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
  onRefresh: () => Promise<void> | void;
}

const MAX_DEPTH = 3;

export const CommentsModal: React.FC<CommentsModalProps> = ({ visible, post, onClose, onRefresh }) => {
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sortedComments = useMemo(() => post?.comments || [], [post?.comments]);

  const handleSubmit = async () => {
    if (!post || !commentText.trim()) return;

    try {
      setSubmitting(true);
      await PostsService.addComment(post._id, commentText.trim(), replyingTo?._id);
      setCommentText('');
      setReplyingTo(null);
      await onRefresh();
    } catch (error) {
      console.error('Failed to add comment', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (comment: Comment, depth = 1) => {
    const indent = depth > 1 ? (depth - 1) * 12 : 0;
    const canReply = depth < MAX_DEPTH;

    return (
      <View key={comment._id} style={[styles.commentContainer, { marginLeft: indent }]}> 
        <View style={styles.commentHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(comment.authorName || 'אורח').slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={styles.commentMeta}>
            <Text style={styles.commentAuthor}>{comment.authorName || 'אורח'}</Text>
            {comment.createdAt && (
              <Text style={styles.commentTime}>{new Date(comment.createdAt).toLocaleString()}</Text>
            )}
          </View>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
        <View style={styles.commentActions}>
          {canReply && (
            <TouchableOpacity onPress={() => setReplyingTo(comment)}>
              <Text style={styles.replyButton}>השב</Text>
            </TouchableOpacity>
          )}
        </View>
        {comment.replies?.map((child) => renderComment(child, depth + 1))}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, globalStyles.shadow]}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>תגובות</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
            {sortedComments.length === 0 && (
              <Text style={styles.emptyText}>אין תגובות עדיין. היה הראשון להגיב!</Text>
            )}
            {sortedComments.map((comment) => renderComment(comment))}
          </ScrollView>

          {replyingTo && (
            <View style={styles.replyingToBanner}>
              <Text style={styles.replyingToText}>מגיב ל: {replyingTo.authorName || 'אורח'}</Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Ionicons name="close-circle" size={18} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="כתוב תגובה"
              placeholderTextColor={colors.textLight}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, (!commentText.trim() || submitting) && styles.disabled]}
              onPress={handleSubmit}
              disabled={!commentText.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="send" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  commentsList: {
    maxHeight: 360,
    marginVertical: 8,
  },
  commentContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  commentMeta: {
    marginLeft: 8,
  },
  commentAuthor: {
    fontWeight: '600',
    color: colors.text,
  },
  commentTime: {
    color: colors.textLight,
    fontSize: 11,
  },
  commentText: {
    color: colors.text,
    marginTop: 2,
    lineHeight: 18,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 6,
  },
  replyButton: {
    color: colors.primary,
    fontWeight: '700',
  },
  replyingToBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0e5ec',
    padding: 8,
    borderRadius: 10,
  },
  replyingToText: {
    color: colors.text,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxHeight: 90,
    color: colors.text,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: 10,
  },
});

