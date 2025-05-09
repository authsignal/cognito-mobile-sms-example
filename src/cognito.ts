import {
  AuthFlowType,
  ChallengeNameType,
  CognitoIdentityProviderClient,
  GetUserCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  SignUpCommand,
  UpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {AWS_REGION, USER_POOL_CLIENT_ID} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const cognito = new CognitoIdentityProviderClient({region: AWS_REGION});

interface SignUpInput {
  username: string;
  phoneNumber: string;
}

export async function signUp({username, phoneNumber}: SignUpInput): Promise<void> {
  const signUpCommand = new SignUpCommand({
    ClientId: USER_POOL_CLIENT_ID,
    Username: username,
    Password: Math.random().toString(36).slice(-16) + 'X', // Dummy value - never used
    UserAttributes: [
      {
        Name: 'phone_number',
        Value: phoneNumber,
      },
    ],
  });

  await cognito.send(signUpCommand);
}

interface InitiateAuthResponse {
  session: any;
  token?: string;
  isEnrolled: boolean;
}

export async function initiateAuth(username: string): Promise<InitiateAuthResponse> {
  const initiateAuthCommand = new InitiateAuthCommand({
    ClientId: USER_POOL_CLIENT_ID,
    AuthFlow: AuthFlowType.CUSTOM_AUTH,
    AuthParameters: {
      USERNAME: username,
    },
  });

  const initiateAuthOutput = await cognito.send(initiateAuthCommand);

  if (!initiateAuthOutput.Session) {
    throw new Error('Cognito could not start custom auth flow');
  }

  return {
    session: initiateAuthOutput.Session,
    token: initiateAuthOutput.ChallengeParameters?.token,
    isEnrolled: initiateAuthOutput.ChallengeParameters?.isEnrolled === 'true',
  };
}

interface CompleteSignInInput {
  session: any;
  username: string;
  answer: string;
}

export async function respondToAuthChallenge({session, username, answer}: CompleteSignInInput): Promise<void> {
  const respondToAuthChallengeCommand = new RespondToAuthChallengeCommand({
    ClientId: USER_POOL_CLIENT_ID,
    ChallengeName: ChallengeNameType.CUSTOM_CHALLENGE,
    Session: session,
    ChallengeResponses: {
      USERNAME: username,
      ANSWER: answer,
    },
  });

  const respondToAuthChallengeOutput = await cognito.send(respondToAuthChallengeCommand);

  const accessToken = respondToAuthChallengeOutput.AuthenticationResult?.AccessToken;

  if (!accessToken) {
    throw new Error('Cognito did not return an access token');
  }

  await AsyncStorage.setItem('@access_token', accessToken);
}

export async function getAccessToken(): Promise<string | null> {
  const accessToken = await AsyncStorage.getItem('@access_token');

  return accessToken;
}

export async function clearAccessToken(): Promise<void> {
  await AsyncStorage.removeItem('@access_token');
}

export async function updateEmail(email: string) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error('No access token found');
  }

  const updateUserAttributesCommand = new UpdateUserAttributesCommand({
    UserAttributes: [
      {
        Name: 'email',
        Value: email,
      },
    ],
    AccessToken: accessToken,
  });

  await cognito.send(updateUserAttributesCommand);
}

export async function updateNames(givenName: string, familyName: string) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error('No access token found');
  }

  const updateUserAttributesCommand = new UpdateUserAttributesCommand({
    UserAttributes: [
      {
        Name: 'given_name',
        Value: givenName,
      },
      {
        Name: 'family_name',
        Value: familyName,
      },
    ],
    AccessToken: accessToken,
  });

  await cognito.send(updateUserAttributesCommand);
}

interface UserAttributes {
  username?: string;
  userId?: string;
  phoneNumber?: string;
  email?: string;
  emailVerified: boolean;
  givenName?: string;
  familyName?: string;
}

export async function getUserAttributes(): Promise<UserAttributes> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error('No access token found');
  }

  const getUserCommand = new GetUserCommand({
    AccessToken: accessToken,
  });

  const getUserOutput = await cognito.send(getUserCommand);

  const username = getUserOutput.Username;

  const userId = getUserOutput.UserAttributes?.find(attr => attr.Name === 'sub')?.Value;
  const phoneNumber = getUserOutput.UserAttributes?.find(attr => attr.Name === 'phone_number')?.Value;
  const email = getUserOutput.UserAttributes?.find(attr => attr.Name === 'email')?.Value;
  const emailVerified = getUserOutput.UserAttributes?.find(attr => attr.Name === 'email_verified')?.Value === 'true';
  const givenName = getUserOutput.UserAttributes?.find(attr => attr.Name === 'given_name')?.Value;
  const familyName = getUserOutput.UserAttributes?.find(attr => attr.Name === 'family_name')?.Value;

  return {
    username,
    userId,
    phoneNumber,
    email,
    emailVerified,
    givenName,
    familyName,
  };
}
