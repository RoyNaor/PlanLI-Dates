import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <LoginScreen />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
