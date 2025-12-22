import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LocationSearch } from './location-search.component';
import { colors } from '../theme/styles';
import { useTranslation } from 'react-i18next';
import { useIsRTL } from '../hooks/useIsRTL';
import { Location } from '../types';

interface Props {
  l1: Location | null; setL1: (l: Location) => void;
  l2: Location | null; setL2: (l: Location) => void;
  strategy: string; setStrategy: (s: any) => void;
}

export const StepLocation = ({ l1, setL1, l2, setL2, strategy, setStrategy }: Props) => {
  const { t } = useTranslation();
  const isRTL = useIsRTL();

  return (
    <View>
      <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{t('stepLocation.title')}</Text>

      <View style={{ zIndex: 2000, marginBottom: 15 }}>
        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{t('stepLocation.whereAreYou')}</Text>
        <LocationSearch placeholder={t('stepLocation.yourAddress')} onLocationSelected={setL1} zIndex={2000} value={l1?.name} />
      </View>

      <View style={{ zIndex: 1000, marginBottom: 20 }}>
        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{t('stepLocation.whereAreThey')}</Text>
        <LocationSearch placeholder={t('stepLocation.theirAddress')} onLocationSelected={setL2} zIndex={1000} value={l2?.name} />
      </View>

      <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{t('stepLocation.whereToMeet')}</Text>
      <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {['MIDPOINT', 'NEAR_ME', 'NEAR_THEM'].map((s) => (
          <TouchableOpacity key={s} style={[styles.btn, strategy === s && styles.btnActive]} onPress={() => setStrategy(s)}>
            <Text style={[styles.text, strategy === s && styles.textActive]}>
              {s === 'MIDPOINT' ? t('stepLocation.midpoint') : s === 'NEAR_ME' ? t('stepLocation.nearMe') : t('stepLocation.nearThem')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: colors.text },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#555' },
  row: { justifyContent: 'space-between' },
  btn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginHorizontal: 3, alignItems: 'center' },
  btnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 12, fontWeight: '600', color: '#555' },
  textActive: { color: '#fff' }
});
