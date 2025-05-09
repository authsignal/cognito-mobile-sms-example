import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert, Image, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import {CreatePasskeyScreen} from './CreatePasskeyScreen';
import {PushChallengeScreen} from './PushChallengeScreen';
import {EmailScreen} from './EmailScreen';
import {HomeScreen} from './HomeScreen';
import {NameScreen} from './NameScreen';
import {SignInScreen} from './SignInScreen';
import {VerifyEmailScreen} from './VerifyEmailScreen';
import {VerifySmsScreen} from './VerifySmsScreen';
import {AppContext} from './context';
import {clearAccessToken, getAccessToken, getUserAttributes} from './cognito';
import {authsignal} from './authsignal';
import {SmsScreen} from './SmsScreen';

const Stack = createStackNavigator();

function App() {
  const [initialized, setInitialized] = useState(false);
  const [username, setUsername] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>();
  const [givenName, setGivenName] = useState<string | undefined>();
  const [familyName, setFamilyName] = useState<string | undefined>();

  const updateUserAttributes = useCallback(async () => {
    const attrs = await getUserAttributes();

    if (attrs.email && attrs.emailVerified) {
      setEmail(attrs.email);
    }

    if (attrs.phoneNumber && attrs.phoneNumberVerified) {
      setPhoneNumber(attrs.phoneNumber);
    }

    if (attrs.givenName && attrs.familyName) {
      setGivenName(attrs.givenName);
      setFamilyName(attrs.familyName);
    }

    setUsername(attrs.username);

    return attrs;
  }, []);

  const clearUserAttributes = useCallback(async () => {
    setEmail(undefined);
    setGivenName(undefined);
    setFamilyName(undefined);
    setUsername(undefined);
  }, []);

  useEffect(() => {
    const initUser = async () => {
      const accessToken = await getAccessToken();

      if (accessToken) {
        await updateUserAttributes();
      }

      setInitialized(true);
    };

    initUser();
  }, [updateUserAttributes]);

  const appContext = useMemo(
    () => ({
      username,
      email,
      phoneNumber,
      givenName,
      familyName,
      updateUserAttributes,
      clearUserAttributes,
    }),
    [username, email, phoneNumber, givenName, familyName, updateUserAttributes, clearUserAttributes],
  );

  const onSignOutPressed = async () => {
    await clearAccessToken();

    await authsignal.push.removeCredential();

    clearUserAttributes();
  };

  if (!initialized) {
    return null;
  }

  const hasAllUserAttributes = !!email && !!phoneNumber && !!givenName && !!familyName;

  return (
    <AppContext.Provider value={appContext}>
      <NavigationContainer>
        {hasAllUserAttributes ? (
          <Stack.Navigator>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                // eslint-disable-next-line react/no-unstable-nested-components
                headerTitle: () => (
                  <Image style={styles.headerTitle} resizeMode={'contain'} source={require('../images/simplify.png')} />
                ),
                // eslint-disable-next-line react/no-unstable-nested-components
                headerRight: () => (
                  <TouchableOpacity
                    style={styles.headerRight}
                    onPress={async () => {
                      Alert.alert('Do you want to sign out?', '', [
                        {
                          text: 'Cancel',
                          style: 'cancel',
                          onPress: () => {},
                        },
                        {text: 'Sign out', onPress: onSignOutPressed},
                      ]);
                    }}>
                    <Icon name="user" size={18} color="#525eea" />
                  </TouchableOpacity>
                ),
              }}
            />
            <Stack.Group
              screenOptions={{
                presentation: 'modal',
                headerShown: false,
              }}>
              <Stack.Screen name="CreatePasskey" component={CreatePasskeyScreen} />
              <Stack.Screen name="PushChallenge" component={PushChallengeScreen} />
            </Stack.Group>
          </Stack.Navigator>
        ) : (
          <Stack.Navigator>
            <Stack.Screen name="SignIn" component={SignInScreen} options={{headerShown: false}} />
            <Stack.Group
              screenOptions={{
                headerShown: true,
                title: '',
                headerBackTitle: 'Back',
              }}>
              <Stack.Screen name="Sms" component={SmsScreen} />
              <Stack.Screen name="VerifySms" component={VerifySmsScreen} />
              <Stack.Screen name="Email" component={EmailScreen} />
              <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
              <Stack.Screen name="Name" component={NameScreen} />
            </Stack.Group>
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </AppContext.Provider>
  );
}

export default App;

const styles = StyleSheet.create({
  headerTitle: {
    width: 250,
  },
  headerRight: {
    marginRight: 20,
  },
});
