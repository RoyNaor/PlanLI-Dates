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
  const [newCommentText, setNewCommentText] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [submittingTarget, setSubmittingTarget] = useState<string | null>(null);
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
      setNewCommentText('');
      setReplyInputs({});
      setActiveReplyId(null);
      setExpandedComments({});
      setSubmittingTarget(null);
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

  const handleSubmit = async (text: string, parentId?: string | null) => {
    if (!post || !text.trim() || submittingTarget) return;

    const author = currentUserAuthor();
    const tempId = `temp-comment-${Date.now()}`;
    const trimmedText = text.trim();
    const targetKey = parentId || 'root';

    const optimisticComment: Comment = {
      _id: tempId,
      text: trimmedText,
      authorId: author,
      createdAt: new Date().toISOString(),
      replies: [],
      parentId,
    };

    setSubmittingTarget(targetKey);
    setLocalComments((comments) => insertComment(comments, optimisticComment, parentId));

    try {
      const saved = await PostsService.addComment(post._id, trimmedText, parentId || undefined);
      const hydratedComment: Comment = {
        ...saved,
        text: saved.text || trimmedText,
        authorId: saved.authorId || author,
        replies: saved.replies || [],
        createdAt: saved.createdAt || new Date().toISOString(),
      };

      setLocalComments((comments) => replaceComment(comments, tempId, hydratedComment));
      if (parentId) {
        setReplyInputs((inputs) => ({ ...inputs, [parentId]: '' }));
        setActiveReplyId((current) => (current === parentId ? null : current));
      } else {
        setNewCommentText('');
      }
      Keyboard.dismiss();
      await onRefresh();
    } catch (error) {
      console.error('Failed to add comment', error);
      setLocalComments((comments) => removeCommentById(comments, tempId));
    } finally {
      setSubmittingTarget(null);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedComments((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const renderComment = (comment: Comment, depth = 1) => {
    const canReply = depth < MAX_DEPTH;
    const authorName = comment.authorId?.displayName || 'אורח';
    const initial = authorName.slice(0, 1).toUpperCase();
    const contentText = (comment as any).content || comment.text;
    const replyCount = comment.replies?.length || 0;
    const repliesExpanded = expandedComments[comment._id];
    const isReplyingHere = activeReplyId === comment._id;

    return (
      <View
        key={comment._id}
        style={[styles.commentContainer, depth > 1 && styles.replyItem]}
      >
        {depth > 1 && <View style={styles.replyThreadLine} />}
        <View style={{ flex: 1 }}>
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
                onPress={() =>
                  setActiveReplyId((current) => (current === comment._id ? null : comment._id))
                }
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.actionRow}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#666" />
                <Text style={styles.replyButton}>השב</Text>
              </TouchableOpacity>
            )}

            {replyCount > 0 && (
              <TouchableOpacity style={styles.actionRow} onPress={() => toggleReplies(comment._id)}>
                <Ionicons name={repliesExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#666" />
                <Text style={styles.replyToggleText}>
                  {repliesExpanded ? 'הסתר תגובות' : `צפה ב-${replyCount} תגובות`}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {isReplyingHere && (
            <View style={styles.replyBox}>
              <TextInput
                style={styles.replyInput}
                placeholder="כתוב תגובה"
                placeholderTextColor={colors.textLight}
                value={replyInputs[comment._id] || ''}
                onChangeText={(text) =>
                  setReplyInputs((prev) => ({
                    ...prev,
                    [comment._id]: text,
                  }))
                }
                multiline
              />
              <TouchableOpacity
                style={[styles.replySend, (!replyInputs[comment._id]?.trim() || submittingTarget !== null) && styles.disabled]}
                onPress={() => handleSubmit(replyInputs[comment._id] || '', comment._id)}
                disabled={!replyInputs[comment._id]?.trim() || submittingTarget !== null}
              >
                {submittingTarget === comment._id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={18} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          )}

          {repliesExpanded && comment.replies?.map((child) => renderComment(child, depth + 1))}
        </View>
      </View>
    );
  };

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
          <View style={styles.commentsList}>
            {sortedComments.length === 0 ? (
              <Text style={styles.emptyText}>אין תגובות עדיין. היה הראשון להגיב!</Text>
            ) : (
              sortedComments.map((comment) => renderComment(comment))
            )}
          </View>
        </ScrollView>

        <View style={styles.inputArea}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="הוסף תגובה לפוסט..."
              placeholderTextColor={colors.textLight}
              value={newCommentText}
              onChangeText={setNewCommentText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, (!newCommentText.trim() || submittingTarget !== null) && styles.disabled]}
              onPress={() => handleSubmit(newCommentText)}
              disabled={!newCommentText.trim() || submittingTarget !== null}
            >
              {submittingTarget === 'root' ? (
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
  commentsList: {
    padding: 16,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  replyItem: {
    marginLeft: 12,
  },
  replyThreadLine: {
    width: 2,
    backgroundColor: '#f0c6d8',
    borderRadius: 2,
    marginRight: 8,
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
    backgroundColor: '#fbe9f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0c6d8',
  },
  avatarText: {
    color: '#666',
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  replyButton: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
  replyToggleText: {
    color: '#666',
    fontSize: 13,
    marginLeft: 6,
  },
  replyBox: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    textAlign: 'right',
  },
  replySend: {
    marginLeft: 8,
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputArea: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
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
