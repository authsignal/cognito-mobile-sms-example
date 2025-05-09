import React, {useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput} from 'react-native';

import {Button} from './Button';
import {startAddingAuthenticator} from './api';

export function EmailScreen({navigation}: any) {
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>What's your email?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        onChangeText={setEmail}
        value={email}
        autoFocus={true}
        textContentType={'emailAddress'}
        autoCapitalize={'none'}
      />
      <Button
        disabled={email.length === 0}
        onPress={async () => {
          try {
            await startAddingAuthenticator();

            navigation.navigate('VerifyEmail', {email});
          } catch (ex) {
            if (ex instanceof Error) {
              return Alert.alert('Error', ex.message);
            }
          }
        }}>
        Continue
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
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  input: {
    alignSelf: 'stretch',
    height: 50,
    borderColor: 'black',
    borderRadius: 6,
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
});
