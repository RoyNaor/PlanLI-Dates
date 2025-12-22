import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { PostsService } from '../services/posts.service';
import { colors, globalStyles } from '../theme/styles';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated: () => Promise<void> | void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ visible, onClose, onPostCreated }) => {
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const imagePreview = useMemo(() => {
    if (!selectedImage) return null;
    const uri = selectedImage.uri;
    const name = selectedImage.fileName || 'photo.jpg';
    const type = selectedImage.mimeType || 'image/jpeg';

    return { uri, name, type };
  }, [selectedImage]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      console.warn('Permission to access media library was denied');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('text', text.trim());
      if (location.trim()) {
        formData.append('location', location.trim());
      }

      if (imagePreview) {
        formData.append('image', {
          uri: imagePreview.uri,
          name: imagePreview.name,
          type: imagePreview.type,
        } as unknown as Blob);
      }

      await PostsService.createPost(formData);
      setText('');
      setLocation('');
      setSelectedImage(null);
      onClose();
      await onPostCreated();
    } catch (error) {
      console.error('Failed to create post', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, globalStyles.shadow]}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>צור פוסט חדש</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>תוכן הפוסט *</Text>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="שתף את הרעיון או החוויה שלך"
            placeholderTextColor={colors.textLight}
            multiline
          />

          <Text style={styles.label}>מיקום (לא חובה)</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="איפה זה קורה?"
            placeholderTextColor={colors.textLight}
          />

          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            <Ionicons name="image-outline" size={20} color={colors.primary} />
            <Text style={styles.imagePickerText}>בחר תמונה (אופציונלי)</Text>
          </TouchableOpacity>

          {selectedImage && (
            <Image source={{ uri: selectedImage.uri }} style={styles.preview} resizeMode="cover" />
          )}

          <TouchableOpacity
            style={[styles.submitButton, !text.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting || !text.trim()}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>פרסם</Text>
            )}
          </TouchableOpacity>
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
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  label: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    minHeight: 48,
    color: colors.text,
    textAlignVertical: 'top',
  },
  imagePicker: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagePickerText: {
    marginLeft: 8,
    color: colors.primary,
    fontWeight: '600',
  },
  preview: {
    height: 160,
    borderRadius: 12,
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

