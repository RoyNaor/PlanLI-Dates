import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthService } from '../services/auth';

export const HomeScreen = ({ navigation }: any) => {
  const handleLogout = async () => {
    await AuthService.logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to PlanLI!</Text>
      <Button title="Plan a Date" onPress={() => navigation.navigate('CreateDate')} />
      <View style={{ marginTop: 20 }}>
        <Button title="Logout" onPress={handleLogout} color="#888" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  }
});
