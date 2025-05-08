import {API_GATEWAY_ID, AWS_REGION} from '@env';
import {getAccessToken} from './cognito';

const url = `https://${API_GATEWAY_ID}.execute-api.${AWS_REGION}.amazonaws.com`;

export async function addAuthenticator(): Promise<string> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${url}/authenticators`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then(res => res.json());

  return response.authsignalToken;
}

interface VerifyEmailInput {
  email: string;
  token: string;
}

export async function verifyEmail(input: VerifyEmailInput) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${url}/authenticators/email/verify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(input),
  }).then(res => res.json());

  if (response?.error) {
    throw new Error(`Error verifying email: ${response.error}`);
  }
}

interface InitAuthInput {
  phoneNumber?: string;
  googleIdToken?: string;
}

export async function initAuth(input: InitAuthInput) {
  const response = await fetch(`${url}/init`, {
    method: 'POST',
    body: JSON.stringify(input),
  }).then(res => res.json());

  if (response?.error) {
    throw new Error(`Google sign-in error: ${response.error}`);
  }

  return response;
}
