import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, globalStyles } from '../theme/styles';
import { CommentsModal } from '../components/CommentsModal';
import { CreatePostModal } from '../components/CreatePostModal';
import { Post, PostsService } from '../services/posts.service';
import { auth } from '../config/firebase';

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return '';
  try {
    return new Date(timestamp).toLocaleString('he-IL');
  } catch (error) {
    return '';
  }
};

export const ChatScreen = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [commentsModalPost, setCommentsModalPost] = useState<Post | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await PostsService.getAllPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (!commentsModalPost) return;
    const updated = posts.find((post) => post._id === commentsModalPost._id);
    if (updated && updated !== commentsModalPost) {
      setCommentsModalPost(updated);
    }
  }, [posts, commentsModalPost]);

  const initials = useMemo(
    () => Object.fromEntries(posts.map((post) => {
        const name = post.authorId?.displayName || 'אורח';
        return [name, name.slice(0, 1).toUpperCase()];
    })),
    [posts]
  );

  const handleOpenComments = (post: Post) => {
    setCommentsModalPost(post);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
  }, [fetchPosts]);

  const handleLike = async (post: Post) => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    const isLiked = post.likes?.includes(currentUserId);
    
    setPosts(currentPosts => currentPosts.map(p => {
        if (p._id === post._id) {
            const newLikes = isLiked 
                ? p.likes?.filter(id => id !== currentUserId)
                : [...(p.likes || []), currentUserId];
            
            return {
                ...p,
                likes: newLikes,
                likesCount: newLikes?.length || 0
            };
        }
        return p;
    }));

    try {
        await PostsService.togglePostLike(post._id); 
    } catch (error) {
        console.error('Failed to like post', error);
        fetchPosts(); 
    }
  };

  const renderPost = ({ item }: { item: Post }) => {
    const author = item.authorId?.displayName || 'אורח';
    
    const hasImage = Boolean(item.imageUrl);
    const commentsCount = item.comments?.length ?? 0;
    
    const isLiked = item.likes?.includes(auth.currentUser?.uid || '');

    // שליפת התוכן הנכון (תיקון הבאג)
    const contentText = (item as any).content || item.text;

    const renderLocation = () => {
      if (!item.location) return null;
      let locationName = '';
      if (typeof item.location === 'object' && (item.location as any).name) {
        locationName = (item.location as any).name;
      } else if (typeof item.location === 'string') {
        locationName = item.location;
      }
      return locationName ? <Text style={styles.location}>{locationName}</Text> : null;
    };

    return (
      <View style={[styles.card, globalStyles.shadow]}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials[author] || author.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.author}>{author}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.createdAt)}</Text>
          </View>
          {renderLocation()}
        </View>

        {/* הצגת התוכן המתוקן */}
        <Text style={[styles.content, !hasImage && styles.contentWithoutImage]}>{contentText}</Text>

        {hasImage && (
          <Image source={{ uri: item.imageUrl as string }} style={styles.image} resizeMode="cover" />
        )}

        <View style={[styles.actions, !hasImage && styles.actionsTight]}>
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => handleLike(item)}
            activeOpacity={0.7}
          >
            <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={22} 
                color={isLiked ? "#FF4444" : colors.text}
            />
            <Text style={[
                styles.actionLabel, 
                isLiked && { color: "#FF4444", fontWeight: 'bold' }
            ]}>
                {item.likesCount ?? item.likes?.length ?? 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => handleOpenComments(item)}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
            <Text style={styles.actionLabel}>{commentsCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
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
        <Text style={styles.headerTitle}> PlanLI Dates </Text>
      </LinearGradient>

      {loading && !refreshing ? (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={renderPost}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />}
          ListEmptyComponent={<Text style={styles.emptyText}>אין פוסטים להצגה כרגע.</Text>}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, globalStyles.shadow]}
        onPress={() => setCreateModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
        <Text style={styles.fabLabel}>הוסף פוסט</Text>
      </TouchableOpacity>

      <CreatePostModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onPostCreated={fetchPosts}
      />

      {commentsModalPost && (
         <CommentsModal
           visible={Boolean(commentsModalPost)}
           post={commentsModalPost}
           onClose={() => setCommentsModalPost(null)}
           onRefresh={fetchPosts}
         />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  header: {
    borderRadius: 18,
    paddingVertical: 20,
    marginBottom: 12,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 120,
    paddingTop: 4,
  },
  card: {
    ...globalStyles.card,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  meta: { marginLeft: 12, flex: 1 },
  author: { color: colors.text, fontWeight: '600', fontSize: 16 },
  timestamp: { color: colors.textLight, fontSize: 12, marginTop: 2 },
  location: { color: colors.primary, fontWeight: '600', fontSize: 12 },
  content: { color: colors.text, fontSize: 15, lineHeight: 21 },
  contentWithoutImage: { marginTop: 4 },
  image: { marginTop: 10, borderRadius: 12, width: '100%', height: 220 },
  actions: { flexDirection: 'row', marginTop: 12 },
  actionsTight: { marginTop: 8 },
  actionItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  actionLabel: { marginLeft: 6, color: colors.text },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabLabel: { color: '#fff', marginLeft: 8, fontWeight: 'bold' },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textLight,
  },
});