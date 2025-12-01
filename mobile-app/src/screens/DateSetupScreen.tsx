import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  FlatList // <--- הרכיב שיציל אותנו מהשגיאה
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import { LocationSearch, Location } from '../components/LocationSearch';
import { ApiService } from '../services/api';
import { colors, globalStyles } from '../theme/styles';
import { getCenterPoint } from '../utils/geo'; 
import { StepLocation } from '../components/StepLocation';
import { StepRadius } from '../components/StepRadius';
import { StepVibe } from '../components/StepVibe';

const { width } = Dimensions.get('window');

export const DateSetupScreen = ({ navigation }: any) => {
  // --- State ---
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [l1, setL1] = useState<Location | null>(null);
  const [l2, setL2] = useState<Location | null>(null);
  const [strategy, setStrategy] = useState<'MIDPOINT' | 'NEAR_ME' | 'NEAR_THEM'>('MIDPOINT');
  const [radius, setRadius] = useState(2000);
  const [budget, setBudget] = useState('$$');
  const [vibes, setVibes] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]); // חובה להוסיף את זה ל-Vibe
  const [loading, setLoading] = useState(false);

  // --- Handlers ---
  const handleFinish = async () => {
    setLoading(true);
    try {
        const vibeString = vibes.length > 0 ? `Vibe: ${vibes.join(', ')}` : '';
        const cuisineString = cuisines.length > 0 ? `Cuisine: ${cuisines.join(', ')}` : '';
        const preferences = `${budget} budget. ${vibeString}. ${cuisineString}.`;

        const payload = {
            l1,
            l2,
            strategy,
            radius,
            preferences
        };

        const result = await ApiService.post('/dates/calculate', payload);
        navigation.navigate('DateResults', { result: result.data || result });

    } catch (e: any) {
        Alert.alert("Error", e.message);
    } finally {
        setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && (!l1 || !l2)) {
        Alert.alert('חסר מידע', 'אנא בחר את שני המיקומים כדי להמשיך');
        return;
    }
    setStep(step + 1);
  };

  // --- Render Functions ---
  const renderProgressBar = () => {
    const progress = (step / totalSteps) * 100;
    return (
        <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.stepText}>שלב {step} מתוך {totalSteps}</Text>
        </View>
    );
  };

  // זו הפונקציה הראשית שמכילה את כל ה-UI של המסך
  const renderScreenContent = () => (
    <View style={styles.contentContainer}>
        {renderProgressBar()}

        {step === 1 && (
            <StepLocation 
                l1={l1} setL1={setL1} 
                l2={l2} setL2={setL2} 
                strategy={strategy} setStrategy={setStrategy} 
            />
        )}

        {step === 2 && (
            <StepRadius 
                radius={radius} 
                setRadius={setRadius} 
                center={getCenterPoint(l1, l2, strategy)} 
            />
        )}

        {step === 3 && (
            <StepVibe 
                budget={budget} setBudget={setBudget} 
                vibes={vibes} setVibes={setVibes} 
                cuisines={cuisines} setCuisines={setCuisines} 
            />
        )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1, backgroundColor: '#fff' }}
    >
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={renderScreenContent}
        keyboardShouldPersistTaps="handled" // קריטי כדי שהלחיצה על הכתובת תעבוד
        contentContainerStyle={{ paddingBottom: 100 }} // מקום לכפתורים למטה
      />

      {/* Footer (כפתורי ניווט) */}
      <View style={styles.footer}>
        {step > 1 ? (
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
                <Text style={{color: '#666', fontWeight: 'bold'}}>אחורה</Text>
            </TouchableOpacity>
        ) : <View style={{width: 70}} />} 

        <TouchableOpacity 
            style={styles.nextBtn} 
            onPress={() => step < totalSteps ? handleNext() : handleFinish()}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>
                    {step < totalSteps ? 'המשך ➜' : 'מצא לי דייט! 🎉'}
                </Text>
            )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
  },
  progressContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  stepText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  // Footer Styles
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 30, // קצת מרווח לאייפונים חדשים
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  backBtn: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
  },
  nextBtn: {
    flex: 1,
    marginLeft: 15,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});