import React, { useMemo, useState } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
      imageUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2',
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
    // Placeholder action until backend wiring is ready
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>קהילה והשראה</Text>
        <Text style={styles.subtitle}>פיד השראות לדייטים בסגנון אינסטגרם</Text>
      </View>

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
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.card },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textLight, marginTop: 4 },
  listContent: { padding: 16, paddingBottom: 120 },
  card: { ...globalStyles.card },
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