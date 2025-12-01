import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  FlatList // <--- החלפנו את ScrollView בזה
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { LocationSearch, Location } from '../components/LocationSearch';
import { ApiService } from '../services/api';
import { colors, globalStyles } from '../theme/styles';

export const CreateDateScreen = ({ navigation }: any) => {
  const [l1, setL1] = useState<Location | null>(null);
  const [l2, setL2] = useState<Location | null>(null);
  const [strategy, setStrategy] = useState('MIDPOINT');
  const [loading, setLoading] = useState(false);
  
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (l1 && l2 && mapRef.current) {
      mapRef.current.fitToCoordinates([
        { latitude: l1.lat, longitude: l1.lng },
        { latitude: l2.lat, longitude: l2.lng }
      ], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    } else if (l1 && mapRef.current) {
        mapRef.current.animateToRegion({
            latitude: l1.lat,
            longitude: l1.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        });
    }
  }, [l1, l2]);

  const handleCalculate = async () => {
    if (!l1 || !l2) {
      Alert.alert('חסרים נתונים', 'אנא בחר את שני המיקומים');
      return;
    }
    
    setLoading(true);
    try {
        const payload = {
            l1,
            l2,
            strategy,
            preferences: "Romantic, quiet"
        };
        
        const response = await ApiService.post('/dates/calculate', payload);
        if(response.success) {
            Alert.alert("Success", "Date calculated!");
            console.log(response.data);
        }

    } catch (error: any) {
        Alert.alert("Error", error.message);
    } finally {
        setLoading(false);
    }
  };

  // --- הפונקציה שמרנדרת את כל התוכן של המסך ---
  const renderContent = () => (
    <View style={styles.contentContainer}>
        
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Plan Your Date ❤️</Text>
            <Text style={styles.headerSubtitle}>Find the perfect meeting point</Text>
        </View>

        {/* Card: Locations */}
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>📍 Locations</Text>
            
            <View style={{ zIndex: 2000 }}>
                <Text style={styles.label}>Where are you? (L1)</Text>
                <LocationSearch
                    placeholder="חפש כתובת או עיר..."
                    onLocationSelected={setL1}
                    zIndex={2000}
                    value={l1?.address} // <--- הוספנו את זה!
                />
            </View>

            <View style={{ zIndex: 1000 }}>
                <Text style={styles.label}>Where are they? (L2)</Text>
                <LocationSearch
                    placeholder="חפש כתובת או עיר..."
                    onLocationSelected={setL2}
                    zIndex={1000}
                    value={l2?.address} // <--- הוספנו את זה!
                />
            </View>
        </View>

        {/* Card: Strategy */}
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>🎯 Meeting Strategy</Text>
            <View style={styles.strategyContainer}>
                {['NEAR_ME', 'MIDPOINT', 'NEAR_THEM'].map((opt) => (
                    <TouchableOpacity 
                    key={opt}
                    style={[styles.strategyBtn, strategy === opt && styles.strategyBtnActive]}
                    onPress={() => setStrategy(opt)}
                    >
                    <Text style={[styles.strategyText, strategy === opt && styles.strategyTextActive]}>
                        {opt === 'NEAR_ME' ? 'Near Me' : opt === 'MIDPOINT' ? 'Midpoint' : 'Near Them'}
                    </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        {/* Map View */}
        <View style={styles.mapContainer}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                    latitude: 32.0853,
                    longitude: 34.7818,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
            >
                {l1 && <Marker coordinate={{ latitude: l1.lat, longitude: l1.lng }} title="You" pinColor="blue" />}
                {l2 && <Marker coordinate={{ latitude: l2.lat, longitude: l2.lng }} title="Them" pinColor="red" />}
            </MapView>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.mainButton} onPress={handleCalculate}>
            <Text style={styles.mainButtonText}>Find Perfect Spot 🚀</Text>
        </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <LinearGradient colors={[colors.primary, '#FF80AB']} style={styles.background} />
      
      {/* השינוי הגדול: FlatList במקום ScrollView 
          אנחנו מעבירים רשימה ריקה, ושמים את כל התוכן ב-ListHeaderComponent.
          זה "עובד על המערכת" ומונע את השגיאה של VirtualizedList.
      */}
      <FlatList
        data={[]} 
        renderItem={null}
        ListHeaderComponent={renderContent}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  background: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
  },
  contentContainer: {
    padding: 20,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    ...globalStyles.shadow,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 5,
    fontWeight: '600',
  },
  strategyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
  },
  strategyBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  strategyBtnActive: {
    backgroundColor: colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  strategyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
  },
  strategyTextActive: {
    color: '#fff',
  },
  mapContainer: {
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    ...globalStyles.shadow,
    borderWidth: 2,
    borderColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mainButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  mainButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});