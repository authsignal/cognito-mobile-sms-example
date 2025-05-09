import {API_GATEWAY_ID, AWS_REGION} from '@env';
import {getAccessToken} from './cognito';
import {authsignal} from './authsignal';

const url = `https://${API_GATEWAY_ID}.execute-api.${AWS_REGION}.amazonaws.com`;

interface StartSignInInput {
  phoneNumber?: string;
  googleIdToken?: string;
}

export async function startSignIn(input: StartSignInInput) {
  const response = await fetch(`${url}/start-sign-in`, {
    method: 'POST',
    body: JSON.stringify(input),
  }).then(res => res.json());

  if (response?.error) {
    throw new Error(`Google sign-in error: ${response.error}`);
  }

  return response;
}

export async function startAddingAuthenticator() {
  const accessToken = await getAccessToken();

  const response = await fetch(`${url}/authenticators`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then(res => res.json());

  await authsignal.setToken(response.authsignalToken);
}

export async function finishAddingAuthenticator(token: string) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${url}/authenticators/verify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({token}),
  }).then(res => res.json());

  if (response?.error) {
    throw new Error(`Error verifying authenticator: ${response.error}`);
  }
}
