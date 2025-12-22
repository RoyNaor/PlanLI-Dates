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
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/styles';
import { PostsService } from '../services/posts.service';
import { LocationSearch } from './location-search.component';
import { Location } from '../types';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export const CreatePostModal = ({ visible, onClose, onPostCreated }: CreatePostModalProps) => {
  const [content, setContent] = useState('');
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
    if (!content.trim()) {
      Alert.alert('שגיאה', 'יש לכתוב תוכן לפוסט');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);

      if (selectedLocation) {
        formData.append('location', JSON.stringify(selectedLocation));
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

      await PostsService.createPost(formData);
      
      handleClose(); // איפוס וסגירה
      onPostCreated();
    } catch (error) {
      console.error('Failed to create post:', error);
      Alert.alert('שגיאה', 'לא ניתן ליצור את הפוסט כרגע');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setContent('');
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
                  value={content}
                  onChangeText={setContent}
                  textAlignVertical="top"
                />

                {/* --- התיקון כאן: שימוש במבנה של StepLocation --- */}
                {/* שימוש ב-inline style ל-zIndex בדיוק כמו ב-StepLocation כדי להבטיח שהרשימה תצוף מעל הכל */}
                <View style={{ zIndex: 2000, marginBottom: 15 }}>
                    <Text style={styles.sectionLabel}>מיקום (אופציונלי):</Text>
                    <LocationSearch
                      placeholder="חפש מיקום..."
                      onLocationSelected={setSelectedLocation}
                      zIndex={2000}
                      value={selectedLocation?.name}
                    />
                </View>
                {/* ------------------------------------------------ */}

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
  // הסרתי את styles.locationContainer כי השתמשנו ב-inline style כמו ב-StepLocation
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
    // הורדתי את zIndex מפה כדי שלא יתחרה עם המיקום
  },
  imageButtonText: {
    marginLeft: 8,
    color: colors.primary,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginTop: 10,
    position: 'relative',
    // הורדתי את zIndex מפה כדי שלא יתחרה עם המיקום
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