import React, { useEffect, useState, useMemo } from 'react';
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
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/styles';
import { PostsService } from '../services/posts.service';
import { Comment, Post } from '../types';

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

  useEffect(() => {
    if (!visible) {
      setCommentText('');
      setReplyingTo(null);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!post || !commentText.trim()) return;
    if (submitting) return;

    try {
      setSubmitting(true);
      await PostsService.addComment(post._id, commentText.trim(), replyingTo?._id);
      setCommentText('');
      setReplyingTo(null);
      Keyboard.dismiss();
      await onRefresh();
    } catch (error) {
      console.error('Failed to add comment', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderLocation = () => {
    if (!post?.location) return null;
    return post.location.name ? <Text style={styles.postLocation}>📍 {post.location.name}</Text> : null;
  };

  /**
   * Recursively renders a comment thread up to the defined depth limit, preserving
   * indentation and reply controls for nested conversations.
   */
  const renderComment = (comment: Comment, depth = 1) => {
    const indent = depth > 1 ? (depth - 1) * 12 : 0;
    const canReply = depth < MAX_DEPTH;
    
    const authorName = typeof comment.authorId === 'object' && comment.authorId?.displayName
      ? comment.authorId.displayName
      : 'אורח';
    const initial = authorName.slice(0, 1).toUpperCase();

    const contentText = comment.content;

    return (
      <View key={comment._id} style={[styles.commentContainer, { marginRight: indent }]}> 
        <View style={styles.commentHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.commentMeta}>
            <Text style={styles.commentAuthor}>{authorName}</Text>
            {comment.createdAt && (
              <Text style={styles.commentTime}>{new Date(comment.createdAt).toLocaleString('he-IL')}</Text>
            )}
          </View>
        </View>
        
        {/* התיקון כאן: הצגת התוכן הנכון */}
        <Text style={styles.commentText}>{contentText}</Text>
        
        <View style={styles.commentActions}>
          {canReply && (
            <TouchableOpacity onPress={() => setReplyingTo(comment)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.replyButton}>השב</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {comment.replies?.map((child) => renderComment(child, depth + 1))}
      </View>
    );
  };

  const postContent = post?.content || '';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        // תיקון: הרמה נוספת של המקלדת באייפון
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
                    {/* התיקון כאן: הצגת התוכן הנכון */}
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

        {/* אזור הקלדה */}
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
                    placeholder={replyingTo ? "כתוב תגובה..." : "הוסף תגובה לפוסט..."}
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
  
  // אזור הקלדה
  inputArea: {
    padding: 16,
    // תיקון: הרמת האזור כלפי מעלה
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