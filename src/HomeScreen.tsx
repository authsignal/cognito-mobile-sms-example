import React, {useEffect} from 'react';
import {Alert, ScrollView, StyleSheet, Text} from 'react-native';

import {authsignal} from './authsignal';
import {startAddingAuthenticator} from './api';

export function HomeScreen({navigation}: any) {
  // Prompt to create passkey
  useEffect(() => {
    (async () => {
      const isPasskeyAvailable = await authsignal.passkey.isAvailableOnDevice();

      if (!isPasskeyAvailable) {
        navigation.navigate('CreatePasskey');
      }
    })();
  }, [navigation]);

  // Push auth
  useEffect(() => {
    async function checkForPendingChallenge() {
      console.log('Checking for pending push challenge...');

      const {data, error} = await authsignal.push.getChallenge();

      if (error) {
        Alert.alert('Error getting push challenge', error);
      } else if (data?.challengeId) {
        navigation.navigate('PushChallenge', {challengeId: data.challengeId});
      }
    }

    async function registerDevice() {
      await startAddingAuthenticator();

      const {error} = await authsignal.push.addCredential();

      if (error) {
        Alert.alert('Error adding push credential', error);
      } else {
        console.log('Push credential added.');
      }
    }

    (async () => {
      const {data: existingCredential} = await authsignal.push.getCredential();

      if (existingCredential) {
        await checkForPendingChallenge();
      } else {
        await registerDevice();
      }
    })();
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Home</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 18,
  },
});
