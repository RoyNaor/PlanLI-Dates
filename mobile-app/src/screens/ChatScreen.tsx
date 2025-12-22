import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  ActivityIndicator, 
  FlatList, 
  RefreshControl, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  Animated 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image'; 
import { Ionicons, Feather } from '@expo/vector-icons'; 
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

import { colors, globalStyles } from '../theme/styles';
import { CommentsModal } from '../components/CommentsModal';
import { CreatePostModal } from '../components/CreatePostModal';
import { Post, PostsService } from '../services/posts.service';
import { auth } from '../config/firebase';

const Toast = ({ message, visible }: { message: string, visible: boolean }) => {
  if (!visible) return null;
  return (
    <View style={styles.toastContainer}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
};


const buildCurrentUserAuthor = () => {
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

const normalizePost = (post: Post): Post => {
  let author = post.authorId;

  if (typeof post.authorId === 'string') {
    const isCurrentUser = auth.currentUser?.uid === post.authorId;
    author = isCurrentUser
      ? buildCurrentUserAuthor()
      : { _id: post.authorId, displayName: 'אורח' };
  }

  return {
    ...post,
    authorId: author,
    comments: post.comments || [],
    likes: post.likes || [],
    likesCount: post.likesCount ?? post.likes?.length ?? 0,
  };
};

// --- המסך הראשי ---

export const ChatScreen = () => {
  // State
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // לפגינציה
  const [refreshing, setRefreshing] = useState(false);
  
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [commentsModalPost, setCommentsModalPost] = useState<Post | null>(null);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  // פונקציית טעינה
  const fetchPosts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setLoading(true);
      
      // כאן בעתיד תשלח פרמטר של עמוד: (page, limit)
      const data = await PostsService.getAllPosts(); 
      
      // נורמליזציה של המידע כדי למנוע קריסות
      const normalizedData = data.map(normalizePost);
      
      if (isRefresh) {
        setPosts(normalizedData);
      } else {
        // במקרה של פגינציה אמיתית היינו עושים append
        setPosts(normalizedData);
      }
    } catch (error) {
      console.error('Failed to load posts', error);
      showToast('שגיאה בטעינת הפוסטים');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  // סנכרון לייב למודל התגובות
  useEffect(() => {
    if (!commentsModalPost) return;
    const updated = posts.find((post) => post._id === commentsModalPost._id);
    if (updated && updated !== commentsModalPost) {
      setCommentsModalPost(updated);
    }
  }, [posts, commentsModalPost]);

  const initials = useMemo(
    () =>
      Object.fromEntries(
        posts.map((post) => {
          // טיפול בטוח באובייקט מחבר
          const name = typeof post.authorId === 'object' && post.authorId?.displayName 
            ? post.authorId.displayName 
            : 'אורח';
          return [name, name.slice(0, 1).toUpperCase()];
        })
      ),
    [posts]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts(true);
  }, [fetchPosts]);

  // לוגיקה לפגינציה (כשמגיעים לסוף הרשימה)
  const handleLoadMore = () => {
    if (loading || loadingMore) return;
    setLoadingMore(true);
    // כרגע רק קורא לפונקציה, בעתיד כאן תקדם את page + 1
    fetchPosts(false); 
  };

  const handleLike = async (post: Post) => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) {
        showToast('יש להתחבר כדי לעשות לייק');
        return;
    }

    const isLiked = post.likes?.includes(currentUserId);
    // שימוש בפונקציית העזר כדי לוודא שאין באג "אורח" בלייק
    const author = typeof post.authorId === 'object' ? post.authorId : buildCurrentUserAuthor();

    // עדכון אופטימי (Optimistic Update)
    setPosts((currentPosts) =>
      currentPosts.map((p) => {
        if (p._id === post._id) {
          const newLikes = isLiked
            ? p.likes?.filter((id) => id !== currentUserId)
            : [...(p.likes || []), currentUserId];

          return {
            ...p,
            authorId: author, // שמירה על פרטי המחבר
            likes: newLikes,
            likesCount: newLikes?.length || 0,
          };
        }
        return p;
      })
    );

    try {
      await PostsService.togglePostLike(post._id);
    } catch (error) {
      console.error('Failed to like post', error);
      showToast('הלייק נכשל');
      fetchPosts(false); // שחזור מצב במקרה שגיאה
    }
  };

  // עדכון מקומי בעת יצירת פוסט (למנוע באג אורח)
  const handlePostCreated = (post: Post, tempId?: string) => {
    const normalized = normalizePost({ 
        ...post, 
        authorId: post.authorId || buildCurrentUserAuthor() 
    });

    setPosts((currentPosts) => {
      const targetId = tempId || post._id;
      const existingIndex = currentPosts.findIndex((p) => p._id === targetId);

      if (existingIndex !== -1) {
        const updatedPosts = [...currentPosts];
        updatedPosts[existingIndex] = { ...normalized, _id: post._id };
        return updatedPosts;
      }
      return [normalized, ...currentPosts];
    });
  };

  const handlePostCreationFailed = (tempId: string) => {
    setPosts((currentPosts) => currentPosts.filter((post) => post._id !== tempId));
    showToast('נכשל בהעלאת הפוסט');
  };

  // --- הרינדור של כל כרטיס ---
  const renderPost = ({ item }: { item: Post }) => {
    const authorName = typeof item.authorId === 'object' && item.authorId?.displayName
        ? item.authorId.displayName
        : 'אורח';
    
    const hasImage = Boolean(item.imageUrl);
    const commentsCount = item.comments?.length ?? 0;
    const isLiked = item.likes?.includes(auth.currentUser?.uid || '');
    const contentText = (item as any).content || item.text;

    // חילוץ שם המיקום בצורה בטוחה
    let locationName = '';
    if (item.location) {
        if (typeof item.location === 'object' && (item.location as any).name) {
            locationName = (item.location as any).name;
        } else if (typeof item.location === 'string') {
            locationName = item.location;
        }
    }

    return (
      <View style={[styles.card, globalStyles.shadow]}>
        {/* Header: Author & Time Only */}
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
                {initials[authorName] || authorName.slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.author}>{authorName}</Text>
            <Text style={styles.timestamp}>{formatRelativeTime(item.createdAt)}</Text>
          </View>
        </View>

        {/* Content with Truncation */}
        <Text 
            style={[styles.content, !hasImage && styles.contentWithoutImage]}
            numberOfLines={4} // הגבלת שורות
            ellipsizeMode="tail" // שלוש נקודות בסוף
        >
            {contentText}
        </Text>

        {/* Improved Image Component */}
        {hasImage && (
          <Image 
            source={{ uri: item.imageUrl as string }} 
            style={styles.image} 
            contentFit="cover"
            transition={300} // אפקט פייד-אין נעים
            cachePolicy="memory-disk" // שמירה בזיכרון למניעת הבהובים
          />
        )}

        {/* Footer: Actions & Location */}
        <View style={[styles.cardFooter, !hasImage && styles.footerTight]}>
          
          {/* צד שמאל: פעולות (לייקים ותגובות) */}
          <View style={styles.actions}>
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

            <TouchableOpacity style={styles.actionItem} onPress={() => setCommentsModalPost(item)}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
              <Text style={styles.actionLabel}>{commentsCount}</Text>
            </TouchableOpacity>
          </View>

          {/* צד ימין: מיקום - תיקון מיקום וריווח */}
          {locationName ? (
              <View style={styles.locationContainer}>
                  <Feather name="map-pin" size={14} color={colors.primary} />
                  <Text style={styles.locationText} numberOfLines={1}>
                      {locationName}
                  </Text>
              </View>
          ) : null}
          
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header נקי ולבן */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PlanLI Dates</Text>
        <Text style={styles.headerSubtitle}>שתפו רעיונות, צרו חוויות</Text>
      </View>

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
          
          // פגינציה ו-Empty State
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={colors.primary} /> : null}
          ListEmptyComponent={
             <View style={{ alignItems: 'center', marginTop: 50 }}>
                 <Ionicons name="images-outline" size={50} color={colors.textLight} />
                 <Text style={styles.emptyText}>עדיין אין פוסטים. היה הראשון לשתף!</Text>
             </View>
          }
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
        onPostCreated={handlePostCreated}
        onPostCreationFailed={handlePostCreationFailed}
      />

      {commentsModalPost && (
         <CommentsModal
           visible={Boolean(commentsModalPost)}
           post={commentsModalPost}
           onClose={() => setCommentsModalPost(null)}
           onRefresh={() => fetchPosts(false)}
         />
      )}
      
      <Toast message={toastMessage} visible={toastVisible} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7', // רקע בהיר ונקי
  },
  // עיצוב הדר נקי (בלי גרדיאנט)
  header: {
    paddingVertical: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 120,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    // צל עדין יותר
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontWeight: 'bold', fontSize: 16 },
  meta: { marginLeft: 12, flex: 1 },
  author: { color: colors.text, fontWeight: '700', fontSize: 15 },
  timestamp: { color: colors.textLight, fontSize: 12, marginTop: 2 },
  
  content: { color: colors.text, fontSize: 15, lineHeight: 22 },
  contentWithoutImage: { marginBottom: 8 },
  
  image: { 
      marginTop: 12, 
      borderRadius: 12, 
      width: '100%', 
      height: 220,
      backgroundColor: '#EEE' // צבע רקע בזמן טעינה
  },
  
  // Footer משודרג
  cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between', // מפריד צדדים
      alignItems: 'center',
      marginTop: 14,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: '#F9F9F9'
  },
  footerTight: { marginTop: 10 },
  
  actions: { flexDirection: 'row' },
  actionItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  actionLabel: { marginLeft: 6, color: colors.text },

  // עיצוב מיקום
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '50%',
  },
  locationText: { 
      color: colors.primary, 
      fontWeight: '600', 
      fontSize: 12,
      marginRight: 2 // רווח קטן מהאייקון
  },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  fabLabel: { color: '#fff', marginLeft: 8, fontWeight: 'bold' },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 10,
    color: colors.textLight,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 1000,
  },
  toastText: { color: '#fff', fontWeight: 'bold' }
});