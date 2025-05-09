import React, {useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput} from 'react-native';

import {Button} from './Button';
import {startAddingAuthenticator} from './api';

export function SmsScreen({navigation}: any) {
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>What's your phone number?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        onChangeText={setPhoneNumber}
        value={phoneNumber}
        autoFocus={true}
        textContentType={'telephoneNumber'}
        autoCapitalize={'none'}
      />
      <Button
        disabled={phoneNumber.length === 0}
        onPress={async () => {
          try {
            await startAddingAuthenticator();

            navigation.navigate('VerifySms', {phoneNumber});
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
