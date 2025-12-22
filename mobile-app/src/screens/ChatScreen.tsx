import React, { useMemo, useState } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // שים לב לשינוי הזה
import { LinearGradient } from 'expo-linear-gradient'; // הוספת הגרדיאנט
import { Ionicons } from '@expo/vector-icons';
import { colors, globalStyles } from '../theme/styles';

interface PostCard {
  id: string;
  author: string;
  timeAgo: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  location?: string;
}

export const ChatScreen = () => {
  const [posts] = useState<PostCard[]>([
    {
      id: '1',
      author: 'Maya',
      timeAgo: 'לפני שעה',
      content: 'טיול בשקיעה בטיילת וצילום זוגי קטן 📸',
      imageUrl: '',
      likes: 24,
      comments: 6,
      location: 'תל אביב - הטיילת'
    },
    {
      id: '2',
      author: 'Noam',
      timeAgo: 'לפני 3 שעות',
      content: 'המלצה חמה: קפה בוטיק עם מאפים מדהימים ברמת השרון ☕🥐',
      likes: 12,
      comments: 2
    },
    {
      id: '3',
      author: 'Daria',
      timeAgo: 'אתמול',
      content: 'פיקניק ערב בפארק הירקון + מוזיקה חיה של חברים 🎶',
      imageUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1',
      likes: 41,
      comments: 9,
      location: 'פארק הירקון'
    }
  ]);

  const initials = useMemo(() =>
    Object.fromEntries(posts.map((post) => [post.author, post.author.slice(0, 1).toUpperCase()])),
  [posts]);

  const handleAddPost = () => {
    console.log('Navigate to Add Post form');
  };

  const renderPost = ({ item }: { item: PostCard }) => (
    <View style={[styles.card, globalStyles.shadow]}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials[item.author]}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.author}>{item.author}</Text>
          <Text style={styles.timestamp}>{item.timeAgo}</Text>
        </View>
        {item.location && <Text style={styles.location}>{item.location}</Text>}
      </View>

      <Text style={styles.content}>{item.content}</Text>

      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
      )}

      <View style={styles.actions}>
        <View style={styles.actionItem}>
          <Ionicons name="heart-outline" size={20} color={colors.text} />
          <Text style={styles.actionLabel}>{item.likes}</Text>
        </View>
        <View style={styles.actionItem}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
          <Text style={styles.actionLabel}>{item.comments}</Text>
        </View>
      </View>
    </View>
  );

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

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={[styles.fab, globalStyles.shadow]} onPress={handleAddPost}>
        <Ionicons name="add" size={28} color="#fff" />
        <Text style={styles.fabLabel}>הוסף פוסט</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16 
  },
  
  header: {
    borderRadius: 18,
    paddingVertical: 20,
    marginBottom: 12,
    marginTop: 10, 
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center'
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)', 
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500'
  },

  /* List & Card Styles */
  listContent: {
    paddingBottom: 120,
    paddingTop: 4 
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
    justifyContent: 'center'
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  meta: { marginLeft: 12, flex: 1 },
  author: { color: colors.text, fontWeight: '600', fontSize: 16 },
  timestamp: { color: colors.textLight, fontSize: 12, marginTop: 2 },
  location: { color: colors.primary, fontWeight: '600', fontSize: 12 },
  content: { color: colors.text, fontSize: 15, lineHeight: 21 },
  image: { marginTop: 10, borderRadius: 12, width: '100%', height: 220 },
  actions: { flexDirection: 'row', marginTop: 12 },
  actionItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  actionLabel: { marginLeft: 6, color: colors.text },
  
  /* FAB Styles */
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  fabLabel: { color: '#fff', marginLeft: 8, fontWeight: 'bold' }
});