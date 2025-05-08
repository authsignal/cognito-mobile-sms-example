import {authorize} from 'react-native-app-auth';

const GOOGLE_OAUTH_APP_GUID = '216916146829-7sh24igudsprauvu1ad3lhfrpjpj16bp';

const config = {
  issuer: 'https://accounts.google.com',
  clientId: `${GOOGLE_OAUTH_APP_GUID}.apps.googleusercontent.com`,
  redirectUrl: `com.googleusercontent.apps.${GOOGLE_OAUTH_APP_GUID}:/oauth2redirect/google`,
  scopes: ['openid', 'profile', 'email'],
};

export const signInWithGoogle = async () => {
  const authState = await authorize(config);

  return authState;
};
