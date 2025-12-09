import React, { useState } from 'react';
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
  FlatList 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // <--- 1. הייבוא החדש
import { LocationSearch, Location } from '../components/LocationSearch';
import { ApiService } from '../services/api';
import { colors } from '../theme/styles';
import { getCenterPoint } from '../utils/geo'; 
import { StepLocation } from '../components/StepLocation';
import { StepRadius } from '../components/StepRadius';
import { StepVibe } from '../components/StepVibe';
import { useTranslation } from 'react-i18next';
import { useIsRTL } from '../hooks/useIsRTL';

const { width } = Dimensions.get('window');

export const DateSetupScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const isRTL = useIsRTL();
  
  // --- State ---
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [l1, setL1] = useState<Location | null>(null);
  const [l2, setL2] = useState<Location | null>(null);
  const [strategy, setStrategy] = useState<'MIDPOINT' | 'NEAR_ME' | 'NEAR_THEM'>('MIDPOINT');
  const [radius, setRadius] = useState(2000);
  const [budget, setBudget] = useState('$$');
  const [vibes, setVibes] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]); 
  const [loading, setLoading] = useState(false);

  // --- Handlers ---
  const handleFinish = () => { // כבר לא צריך async כאן
 // הכנת הנתונים (Payload)
    const vibeString = vibes.length > 0 ? `Vibe: ${vibes.join(', ')}` : '';
    const cuisineString = cuisines.length > 0 ? `Cuisine: ${cuisines.join(', ')}` : '';
    const langContext = i18n.language === 'he' ? "Output language: Hebrew. " : "";
    const preferences = `${langContext}${budget} budget. ${vibeString}. ${cuisineString}.`;

    const payload = {
        l1,
        l2,
        strategy,
        radius,
        preferences
  };

    // ניווט למסך הטעינה החדש עם הנתונים
    // שים לב: אנחנו לא קוראים לשרת פה!
    navigation.navigate('DateGeneration', { payload });
  };

  const handleNext = () => {
    if (step === 1 && (!l1 || !l2)) {
        Alert.alert(t('dateSetup.missingInfoTitle'), t('dateSetup.missingInfoMsg'));
        return;
    }
    setStep(step + 1);
  };

  // --- Render Functions ---
  const renderProgressBar = () => {
    const progress = (step / totalSteps) * 100;
    return (
        <View style={styles.progressContainer}>
            <View style={[styles.progressBarBackground, { transform: [{ scaleX: isRTL ? -1 : 1 }] }]}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.stepText}>{t('dateSetup.step', { step, total: totalSteps })}</Text>
        </View>
    );
  };

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
    // <--- 2. העטיפה החדשה ששומרת מלמעלה
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      
      <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={{ flex: 1 }}
      >
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={renderScreenContent}
          keyboardShouldPersistTaps="handled" 
          contentContainerStyle={{ paddingBottom: 100 }} 
        />

        {/* Footer */}
        <View style={[styles.footer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {step > 1 ? (
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
                  <Text style={{color: '#666', fontWeight: 'bold'}}>{t('dateSetup.back')}</Text>
              </TouchableOpacity>
          ) : <View style={{width: 70}} />} 

          <TouchableOpacity 
              style={[styles.nextBtn, { marginLeft: isRTL ? 0 : 15, marginRight: isRTL ? 15 : 0 }]}
              onPress={() => step < totalSteps ? handleNext() : handleFinish()}
          >
              {loading ? (
                  <ActivityIndicator color="#fff" />
              ) : (
                  <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>
                      {step < totalSteps ? t('dateSetup.next') : t('dateSetup.findDate')}
                  </Text>
              )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingTop: 10,
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 30, 
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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