import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/styles';

const BUDGETS = ['$', '$$', '$$$'];
const VIBES = ['Romantic', 'Casual', 'Cocktail Bar', 'Restaurant', 'Movie', 'Coffee', 'Picnic', 'Rooftop'];
const CUISINES = ['Italian', 'Asian', 'Sushi', 'Burger', 'Pizza', 'Meat', 'Mexican', 'Vegan', 'Seafood'];

interface Props {
  budget: string; setBudget: (s: string) => void;
  vibes: string[]; setVibes: (s: string[]) => void;
  cuisines: string[]; setCuisines: (s: string[]) => void;
}

export const StepVibe = ({ budget, setBudget, vibes, setVibes, cuisines, setCuisines }: Props) => {
  const toggle = (item: string, list: string[], setList: Function) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const renderSection = (title: string, items: string[], selected: string | string[], onSelect: Function, multi = false) => (
    <View style={styles.section}>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.row}>
        {items.map(item => {
          const isSelected = multi ? (selected as string[]).includes(item) : selected === item;
          return (
            <TouchableOpacity key={item} style={[styles.chip, isSelected && styles.active]} onPress={() => multi ? onSelect(item) : onSelect(item)}>
              <Text style={[styles.text, isSelected && styles.textActive]}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View>
      <Text style={styles.title}>Set the Mood ✨</Text>
      {renderSection('Budget', BUDGETS, budget, setBudget)}
      {renderSection('Vibe', VIBES, vibes, (v: string) => toggle(v, vibes, setVibes), true)}
      {renderSection('Cuisine', CUISINES, cuisines, (c: string) => toggle(c, cuisines, setCuisines), true)}
    </View>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: colors.text },
  section: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { padding: 10, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8, marginBottom: 8 },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 13, color: '#555' },
  textActive: { color: '#fff' }
});