import React, { useState } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 300;

interface HeaderImagesProps {
  images: string[];
  onBack: () => void;
  isRTL: boolean;
}

export const HeaderImages: React.FC<HeaderImagesProps> = ({ images, onBack, isRTL }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeImages = images.length > 0 ? images : ['https://via.placeholder.com/400x300.png?text=No+Image'];

  const handleMomentumEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / width);
    setActiveIndex(currentIndex);
  };

  return (
    <View style={styles.imageContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ width, height: IMAGE_HEIGHT }}
        onMomentumScrollEnd={handleMomentumEnd}
      >
        {safeImages.map((img, index) => (
          <Image key={index} source={{ uri: img }} style={{ width, height: IMAGE_HEIGHT }} resizeMode="cover" />
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.backButton, { [isRTL ? 'right' : 'left']: 20 }]}
        onPress={onBack}
      >
        <Ionicons name="arrow-down" size={24} color="#333" />
      </TouchableOpacity>

      {safeImages.length > 1 && (
        <View style={styles.paginationBadge}>
          <Text style={styles.paginationText}>{activeIndex + 1} / {safeImages.length}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: { position: 'relative' },
  backButton: {
    position: 'absolute',
    top: 50,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  paginationBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  paginationText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});

export default HeaderImages;
