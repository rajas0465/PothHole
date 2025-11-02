import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';

import { BASE_URL } from '@env';

export default function ReportSubmission() {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error('AuthContext must be used within an AuthProvider');
  const { user } = authContext;

  // Animate when component mounts
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Handle image picking
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to take a photo.');
        return;
      }

      Alert.alert('Choose Image Source', 'Select image from:', [
        {
          text: 'Camera',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 1,
            });
            if (!result.canceled) setImage(result.assets[0].uri);
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 1,
            });
            if (!result.canceled) setImage(result.assets[0].uri);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Could not pick the image. Please try again.');
    }
  };

  // Get location
  const handleGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to submit the report.');
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      Alert.alert('Success', 'Location captured successfully!');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not fetch location.');
    }
  };

  // Submit report
  const handleSubmit = async () => {
    if (!description || !image || !location) {
      Alert.alert('Missing Fields', 'Please fill all fields and select an image before submitting.');
      return;
    }

    try {
      setLoading(true);
      const filename = image?.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      const formData = new FormData();
      formData.append('user_id', user?.userId?.toString() || '');
      formData.append('description', description);
      formData.append('latitude', location.coords.latitude.toString());
      formData.append('longitude', location.coords.longitude.toString());
      formData.append('image', { uri: image, name: filename, type } as any);

      const response = await axios.post(`${BASE_URL}/reports`, formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Your report has been submitted successfully!');
      console.log('Response:', response.data);
      setDescription('');
      setImage(null);
      setLocation(null);
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Could not submit the report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <Text style={styles.title}>🛠️ Report a Pothole</Text>
          <Text style={styles.subtitle}>
            Help make roads safer by reporting potholes detected near you.
          </Text>

          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            <Text style={styles.imagePickerText}>
              {image ? 'Change Image' : '📸 Pick or Capture Image'}
            </Text>
          </TouchableOpacity>

          {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

          <TextInput
            style={styles.input}
            placeholder="Describe the pothole or its impact..."
            placeholderTextColor="#aaa"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation}>
            <Text style={styles.locationButtonText}>
              {location ? '📍 Location Captured' : 'Get Current Location'}
            </Text>
          </TouchableOpacity>

          {location && (
            <Text style={styles.locationText}>
              Latitude: {location.coords.latitude.toFixed(4)} | Longitude: {location.coords.longitude.toFixed(4)}
            </Text>
          )}

          {loading ? (
            <ActivityIndicator size="large" color="#00ffcc" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <LinearGradient
                colors={['#00c6ff', '#0072ff']}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.submitText}>🚀 Submit Report</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  container: {
    margin: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
  },
  imagePicker: {
    backgroundColor: '#1f1f2e',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#00e0ff',
    fontWeight: '600',
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1f1f2e',
    color: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  locationButton: {
    backgroundColor: '#2a2a3d',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#00e0ff',
    fontWeight: 'bold',
  },
  locationText: {
    color: '#ccc',
    textAlign: 'center',
    marginVertical: 10,
  },
  submitButton: { marginTop: 10 },
  submitGradient: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});
