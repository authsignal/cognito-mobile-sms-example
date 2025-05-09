import React from 'react';
import {Alert, Image, SafeAreaView, StyleSheet, Text} from 'react-native';

import {Button} from './Button';
import {authsignal} from './authsignal';
import {startAddingAuthenticator} from './api';
import {useAppContext} from './context';

export function CreatePasskeyScreen({navigation}: any) {
  const {username, givenName, familyName} = useAppContext();

  return (
    <SafeAreaView style={styles.container}>
      <Image style={styles.image} resizeMode={'contain'} source={require('../images/passkey-icon.png')} />
      <Text style={styles.header}>Create a passkey</Text>
      <Text style={styles.text}>Passkeys are easier and more secure than passwords.</Text>

      <Button
        onPress={async () => {
          await startAddingAuthenticator();

          const {error} = await authsignal.passkey.signUp({
            username,
            displayName: `${givenName} ${familyName}`,
          });

          if (!error) {
            Alert.alert('Passkey created.', 'You can now use your passkey to sign in.', [
              {text: 'OK', onPress: () => navigation.goBack()},
            ]);
          } else {
            Alert.alert('Error creating passkey', error);
          }
        }}>
        Create passkey
      </Button>
      <Button
        theme="secondary"
        onPress={async () => {
          navigation.goBack();
        }}>
        Not now
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#F5FCFF',
  },
  image: {
    width: 100,
    height: 100,
    marginLeft: 10,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  text: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
});
