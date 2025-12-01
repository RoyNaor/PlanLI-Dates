import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LocationSearch, Location } from '../components/LocationSearch';
import { colors } from '../theme/styles';

interface Props {
  l1: Location | null; setL1: (l: Location) => void;
  l2: Location | null; setL2: (l: Location) => void;
  strategy: string; setStrategy: (s: any) => void;
}

export const StepLocation = ({ l1, setL1, l2, setL2, strategy, setStrategy }: Props) => (
  <View>
    <Text style={styles.title}>Let's start with locations 📍</Text>
    
    <View style={{ zIndex: 2000, marginBottom: 15 }}>
      <Text style={styles.label}>Where are you? (L1)</Text>
      <LocationSearch placeholder="Your address..." onLocationSelected={setL1} zIndex={2000} value={l1?.address} />
    </View>

    <View style={{ zIndex: 1000, marginBottom: 20 }}>
      <Text style={styles.label}>Where are they? (L2)</Text>
      <LocationSearch placeholder="Their address..." onLocationSelected={setL2} zIndex={1000} value={l2?.address} />
    </View>

    <Text style={styles.label}>Where should we meet?</Text>
    <View style={styles.row}>
      {['MIDPOINT', 'NEAR_ME', 'NEAR_THEM'].map((s) => (
        <TouchableOpacity key={s} style={[styles.btn, strategy === s && styles.btnActive]} onPress={() => setStrategy(s)}>
          <Text style={[styles.text, strategy === s && styles.textActive]}>
            {s === 'MIDPOINT' ? '⚖️ Midpoint' : s === 'NEAR_ME' ? '📍 Near Me' : '🏠 Near Them'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: colors.text },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#555' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginHorizontal: 3, alignItems: 'center' },
  btnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 12, fontWeight: '600', color: '#555' },
  textActive: { color: '#fff' }
});