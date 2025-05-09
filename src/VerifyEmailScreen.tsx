import React, {useCallback, useEffect, useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';

import {Button} from './Button';
import {authsignal} from './authsignal';
import {finishAddingAuthenticator} from './api';
import {useAppContext} from './context';

export function VerifyEmailScreen({navigation, route}: any) {
  const {updateUserAttributes} = useAppContext();

  const [code, setCode] = useState('');

  const {email} = route.params;

  const sendEmail = useCallback(async () => {
    await authsignal.email.enroll({email});
  }, [email]);

  useEffect(() => {
    sendEmail();
  }, [sendEmail]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Confirm your email</Text>
      <Text style={styles.text}>Enter the code sent to {email}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter verification code"
        onChangeText={setCode}
        value={code}
        autoFocus={true}
        keyboardType={'number-pad'}
      />
      <Button
        onPress={async () => {
          const {data, error} = await authsignal.email.verify({code});

          if (error || !data?.token) {
            Alert.alert('Invalid code');
          } else {
            try {
              await finishAddingAuthenticator(data.token);

              const updatedAttributes = await updateUserAttributes();

              if (!updatedAttributes.givenName || !updatedAttributes.familyName) {
                navigation.navigate('Name');
              }
            } catch (ex) {
              if (ex instanceof Error) {
                return Alert.alert('Error', ex.message);
              }
            }
          }
        }}>
        Confirm
      </Button>
      <View style={styles.center}>
        <Text>Didn't receive a code?</Text>
        <TouchableOpacity
          onPress={async () => {
            setCode('');

            await sendEmail();

            Alert.alert('Verification code re-sent');
          }}>
          <Text style={styles.link}>Re-send it</Text>
        </TouchableOpacity>
      </View>
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
  input: {
    alignSelf: 'stretch',
    marginVertical: 20,
    height: 50,
    borderColor: 'black',
    borderRadius: 6,
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 20,
  },
  text: {
    marginHorizontal: 20,
  },
  link: {
    color: '#525EEA',
    marginLeft: 5,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    marginHorizontal: 20,
  },
  center: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
});
