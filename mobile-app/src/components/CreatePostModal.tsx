import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/styles';
import { Post, PostsService } from '../services/posts.service';
import { LocationSearch, Location } from '../components/LocationSearch';
import { auth } from '../config/firebase';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated: (post: Post, tempId?: string) => void;
  onPostCreationFailed?: (tempId: string) => void;
}

export const CreatePostModal = ({ visible, onClose, onPostCreated, onPostCreationFailed }: CreatePostModalProps) => {
  const [text, setText] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!text.trim()) {
      Alert.alert('שגיאה', 'יש לכתוב תוכן לפוסט');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('שגיאה', 'יש להתחבר לפני יצירת פוסט');
      return;
    }
    const authorDetails = {
      _id: currentUser.uid,
      displayName: currentUser.displayName || 'אורח',
      photoUrl: currentUser.photoURL || undefined,
    };

    setLoading(true);
    const tempId = `temp-post-${Date.now()}`;

    try {
      const formData = new FormData();
      formData.append('text', text);

      if (selectedLocation) {
        const locationData = {
          name: selectedLocation.address,
          lat: selectedLocation.lat,
          long: selectedLocation.lng,
        };
        formData.append('location', JSON.stringify(locationData));
      }

      if (image) {
        const filename = image.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('image', {
          uri: image,
          name: filename,
          type,
        } as any);
      }

      const optimisticPost: Post = {
        _id: tempId,
        text: text.trim(),
        authorId: authorDetails,
        createdAt: new Date().toISOString(),
        imageUrl: image || undefined,
        location: selectedLocation
          ? { name: selectedLocation.address, lat: selectedLocation.lat, long: selectedLocation.lng }
          : undefined,
        comments: [],
        likes: [],
        likesCount: 0,
      };

      onPostCreated(optimisticPost, tempId);

      const savedPost = await PostsService.createPost(formData);

      onPostCreated({ ...savedPost, authorId: savedPost.authorId || authorDetails }, tempId);

      handleClose();
    } catch (error) {
      console.error('Failed to create post:', error);
      Alert.alert('שגיאה', 'לא ניתן ליצור את הפוסט כרגע');
      onPostCreationFailed?.(tempId);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setText('');
    setImage(null);
    setSelectedLocation(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>פוסט חדש</Text>
                <View style={{ width: 24 }} />
              </View>

              <View style={styles.formContent}>
                <TextInput
                  style={styles.input}
                  placeholder="שתף את הרעיון לדייט שלך..."
                  placeholderTextColor={colors.textLight}
                  multiline
                  value={text}
                  onChangeText={setText}
                  textAlignVertical="top"
                />

                <View style={{ zIndex: 2000, marginBottom: 15 }}>
                  <Text style={styles.sectionLabel}>מיקום (אופציונלי):</Text>
                  <LocationSearch
                    placeholder="חפש מיקום..."
                    onLocationSelected={setSelectedLocation}
                    zIndex={2000}
                    value={selectedLocation?.address}
                  />
                </View>

                {image ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: image }} style={styles.imagePreview} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => setImage(null)}>
                      <Ionicons name="close-circle" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                    <Ionicons name="image-outline" size={24} color={colors.primary} />
                    <Text style={styles.imageButtonText}>הוסף תמונה</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, loading && styles.disabledButton]} 
                onPress={handleCreatePost}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>פרסם</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
    height: '90%',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  formContent: {
    flex: 1,
  },
  input: {
    minHeight: 100,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
    textAlign: 'right',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
    justifyContent: 'center',
    marginTop: 10,
  },
  imageButtonText: {
    marginLeft: 8,
    color: colors.primary,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginTop: 10,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});