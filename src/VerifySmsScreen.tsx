import React, {useCallback, useEffect, useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';

import {Button} from './Button';
import {authsignal} from './authsignal';
import {useAppContext} from './context';
import {respondToSmsChallenge} from './cognito';

export function VerifySmsScreen({route}: any) {
  const {setUserAttributes} = useAppContext();

  const [code, setCode] = useState('');

  const {username, phoneNumber, isEnrolled, session} = route.params;

  const sendSms = useCallback(async () => {
    if (isEnrolled) {
      await authsignal.sms.challenge();
    } else {
      await authsignal.sms.enroll({phoneNumber});
    }
  }, [phoneNumber, isEnrolled]);

  useEffect(() => {
    sendSms();
  }, [sendSms]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Confirm your number</Text>
      <Text style={styles.text}>Enter the code sent to {phoneNumber}</Text>
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
          try {
            const {data, error} = await authsignal.sms.verify({code});

            if (error || !data?.token) {
              Alert.alert('Invalid code');
            } else {
              await respondToSmsChallenge({session, username, answer: data.token});

              setUserAttributes();
            }
          } catch (err) {
            if (err instanceof Error) {
              Alert.alert('Error', err.message);
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

            await sendSms();

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
