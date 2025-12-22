import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { colors } from '../theme/styles';
import { Comment, Post, PostsService } from '../services/posts.service';
import { auth } from '../config/firebase';

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
  const [localComments, setLocalComments] = useState<Comment[]>(post?.comments || []);

  const sortedComments = useMemo(
    () =>
      [...localComments].sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [localComments]
  );

  useEffect(() => {
    if (!visible) {
      setCommentText('');
      setReplyingTo(null);
    }
  }, [visible]);

  useEffect(() => {
    setLocalComments(post?.comments || []);
  }, [post]);

  const currentUserAuthor = () => {
    const user = auth.currentUser;

    if (!user) return undefined;

    return {
      _id: user.uid,
      displayName: user.displayName || 'אורח',
      photoUrl: user.photoURL || undefined,
    };
  };

  const formatRelativeTime = (timestamp?: string) => {
    if (!timestamp) return '';

    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: he });
    } catch (error) {
      return '';
    }
  };

  const insertComment = (comments: Comment[], newComment: Comment, parentId?: string | null): Comment[] => {
    if (!parentId) {
      return [newComment, ...comments];
    }

    return comments.map((comment) => {
      if (comment._id === parentId) {
        const replies = comment.replies || [];
        return { ...comment, replies: [...replies, newComment] };
      }

      return {
        ...comment,
        replies: insertComment(comment.replies || [], newComment, parentId),
      };
    });
  };

  const replaceComment = (comments: Comment[], tempId: string, savedComment: Comment): Comment[] =>
    comments.map((comment) => {
      if (comment._id === tempId) {
        return savedComment;
      }

      return {
        ...comment,
        replies: replaceComment(comment.replies || [], tempId, savedComment),
      };
    });

  const removeCommentById = (comments: Comment[], targetId: string): Comment[] =>
    comments
      .filter((comment) => comment._id !== targetId)
      .map((comment) => ({
        ...comment,
        replies: removeCommentById(comment.replies || [], targetId),
      }));

  const handleSubmit = async () => {
    if (!post || !commentText.trim() || submitting) return;

    const author = currentUserAuthor();
    const tempId = `temp-comment-${Date.now()}`;
    const parentId = replyingTo?._id;
    const text = commentText.trim();

    const optimisticComment: Comment = {
      _id: tempId,
      text,
      authorId: author,
      createdAt: new Date().toISOString(),
      replies: [],
      parentId,
    };

    setSubmitting(true);
    setLocalComments((comments) => insertComment(comments, optimisticComment, parentId));

    try {
      const saved = await PostsService.addComment(post._id, text, parentId);
      const hydratedComment: Comment = {
        ...saved,
        text: saved.text || text,
        authorId: saved.authorId || author,
        replies: saved.replies || [],
        createdAt: saved.createdAt || new Date().toISOString(),
      };

      setLocalComments((comments) => replaceComment(comments, tempId, hydratedComment));
      setCommentText('');
      setReplyingTo(null);
      Keyboard.dismiss();
      await onRefresh();
    } catch (error) {
      console.error('Failed to add comment', error);
      setLocalComments((comments) => removeCommentById(comments, tempId));
    } finally {
      setSubmitting(false);
    }
  };

  const renderLocation = () => {
    if (!post?.location) return null;
    let locationName = '';
    
    if (typeof post.location === 'object' && (post.location as any).name) {
      locationName = (post.location as any).name;
    } else if (typeof post.location === 'string') {
      locationName = post.location;
    }

    return locationName ? <Text style={styles.postLocation}>📍 {locationName}</Text> : null;
  };

  const renderComment = (comment: Comment, depth = 1) => {
    const indent = depth > 1 ? (depth - 1) * 12 : 0;
    const canReply = depth < MAX_DEPTH;
    
    const authorName = comment.authorId?.displayName || 'אורח';
    const initial = authorName.slice(0, 1).toUpperCase();

    const contentText = (comment as any).content || comment.text;

    return (
      <View key={comment._id} style={[styles.commentContainer, { marginRight: indent }]}>
        <View style={styles.commentHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.commentMeta}>
            <Text style={styles.commentAuthor}>{authorName}</Text>
            {comment.createdAt && <Text style={styles.commentTime}>{formatRelativeTime(comment.createdAt)}</Text>}
          </View>
        </View>

        <Text style={styles.commentText}>{contentText}</Text>
        
        <View style={styles.commentActions}>
          {canReply && (
            <TouchableOpacity
              onPress={() => setReplyingTo(comment)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.replyButton}>השב</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {comment.replies?.map((child) => renderComment(child, depth + 1))}
      </View>
    );
  };

  const postContent = post ? ((post as any).content || post.text) : '';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        style={styles.container}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>תגובות</Text>
          <View style={{ width: 28 }} /> 
        </View>

        <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 20 }}>
          {post && (
            <View style={styles.postPreview}>
              <Text style={styles.postPreviewText}>{postContent}</Text>
              {renderLocation()}
              <View style={styles.divider} />
            </View>
          )}

          <View style={styles.commentsList}>
            {sortedComments.length === 0 ? (
              <Text style={styles.emptyText}>אין תגובות עדיין. היה הראשון להגיב!</Text>
            ) : (
              sortedComments.map((comment) => renderComment(comment))
            )}
          </View>
        </ScrollView>

        <View style={styles.inputArea}>
          {replyingTo && (
            <View style={styles.replyingToBanner}>
              <Text style={styles.replyingToText}>
                מגיב ל: {replyingTo.authorId?.displayName || 'אורח'}
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Ionicons name="close-circle" size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={replyingTo ? 'כתוב תגובה...' : 'הוסף תגובה לפוסט...'}
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
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContainer: {
    flex: 1,
  },
  postPreview: {
    padding: 16,
    backgroundColor: '#fff',
  },
  postPreviewText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  postLocation: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginTop: 8,
  },
  commentsList: {
    padding: 16,
  },
  commentContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentMeta: {
    marginLeft: 10,
  },
  commentAuthor: {
    fontWeight: '600',
    color: colors.text,
    fontSize: 14,
    textAlign: 'left',
  },
  commentTime: {
    color: colors.textLight,
    fontSize: 11,
    textAlign: 'left',
  },
  commentText: {
    color: colors.text,
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'flex-start',
  },
  replyButton: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  
  inputArea: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  replyingToBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingToText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    color: colors.text,
    textAlign: 'right',
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: '#ccc',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: 20,
    fontSize: 16,
  },
});