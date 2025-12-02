import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/styles';
import { useTranslation } from 'react-i18next';
import { useIsRTL } from '../hooks/useIsRTL';

const BUDGETS = ['$', '$$', '$$$'];

// הוספנו כאן את הדברים החדשים שביקשת
const VIBES = [
  'Romantic', 'Casual', 'Nature', 'Lookout', // טבע, מצפה
  'Coffee Cart', 'Sunset', // עגלת קפה, שקיעה
  'Rooftop', 'Picnic', 'Quiet' // גג, פיקניק, שקט, תוסס
];

const CUISINES = [
  'Italian', 'Asian', 'Sushi', 'Burger', 'Pizza', 
  'Cafe', 'Bakery', // בתי קפה, מאפייה
  'Meat', 'Mexican', 'Vegan', 'Seafood', 'Dessert',
];

interface Props {
  budget: string; setBudget: (s: string) => void;
  vibes: string[]; setVibes: (s: string[]) => void;
  cuisines: string[]; setCuisines: (s: string[]) => void;
}

export const StepVibe = ({ budget, setBudget, vibes, setVibes, cuisines, setCuisines }: Props) => {
  const { t } = useTranslation();
  const isRTL = useIsRTL();

  const toggle = (item: string, list: string[], setList: Function) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const renderSection = (titleKey: string, items: string[], selected: string | string[], onSelect: Function, multi = false, translationKey?: string) => (
    <View style={styles.section}>
      <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{t(titleKey)}</Text>
      <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {items.map(item => {
          const isSelected = multi ? (selected as string[]).includes(item) : selected === item;
          // המפתח לתרגום יהיה למשל: stepVibe.vibes.Lookout
          const display = translationKey ? t(`${translationKey}.${item}`, { defaultValue: item }) : item;
          
          return (
            <TouchableOpacity 
                key={item} 
                style={[
                    styles.chip, 
                    isSelected && styles.active, 
                    isRTL ? { marginLeft: 8, marginRight: 0 } : { marginRight: 8 }
                ]} 
                onPress={() => multi ? onSelect(item) : onSelect(item)}
            >
              <Text style={[styles.text, isSelected && styles.textActive]}>{display}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View>
      <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{t('stepVibe.title')}</Text>
      {renderSection('stepVibe.budget', BUDGETS, budget, setBudget)}
      
      {/* Vibes */}
      {renderSection('stepVibe.vibe', VIBES, vibes, (v: string) => toggle(v, vibes, setVibes), true, 'stepVibe.vibes')}
      
      {/* Cuisines */}
      {renderSection('stepVibe.cuisine', CUISINES, cuisines, (c: string) => toggle(c, cuisines, setCuisines), true, 'stepVibe.cuisines')}
    </View>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: colors.text },
  section: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  row: { flexWrap: 'wrap' },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginBottom: 8 },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 13, color: '#555' },
  textActive: { color: '#fff' }
});