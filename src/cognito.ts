import {
  AuthFlowType,
  ChallengeNameType,
  CognitoIdentityProviderClient,
  GetUserCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  UpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {AWS_REGION, USER_POOL_CLIENT_ID} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const cognito = new CognitoIdentityProviderClient({region: AWS_REGION});

interface InitiateAuthResponse {
  session: any;
}

interface InitiateSmsAuthResponse extends InitiateAuthResponse {
  token: string;
  isEnrolled: boolean;
}

async function initiateAuth(username: string) {
  const initiateAuthCommand = new InitiateAuthCommand({
    ClientId: USER_POOL_CLIENT_ID,
    AuthFlow: AuthFlowType.CUSTOM_AUTH,
    AuthParameters: {
      USERNAME: username,
    },
  });

  return await cognito.send(initiateAuthCommand);
}

interface RespondToAuthChallengeInput {
  session: any;
  username: string;
  answer: string;
  clientMetadata?: Record<string, string>;
}

export async function respondToAuthChallenge({session, username, answer, clientMetadata}: RespondToAuthChallengeInput) {
  const respondToAuthChallengeCommand = new RespondToAuthChallengeCommand({
    ClientId: USER_POOL_CLIENT_ID,
    ChallengeName: ChallengeNameType.CUSTOM_CHALLENGE,
    Session: session,
    ChallengeResponses: {
      USERNAME: username,
      ANSWER: answer,
    },
    ClientMetadata: clientMetadata,
  });

  return await cognito.send(respondToAuthChallengeCommand);
}

export async function initiateSmsAuth(username: string): Promise<InitiateSmsAuthResponse> {
  const provideAuthParamsOutput = await initiateAuth(username);

  const challengeResponse = await respondToAuthChallenge({
    session: provideAuthParamsOutput.Session,
    username,
    answer: '__dummy__',
    clientMetadata: {signInMethod: 'SMS'},
  });

  const token = challengeResponse.ChallengeParameters?.token;
  const isEnrolled = challengeResponse.ChallengeParameters?.isEnrolled === 'true';
  const session = challengeResponse.Session;

  if (!token) {
    throw new Error('No Authsignal token returned from Cognito');
  }

  return {
    session,
    token,
    isEnrolled,
  };
}

export async function respondToSmsChallenge(input: RespondToAuthChallengeInput): Promise<void> {
  const respondToAuthChallengeOutput = await respondToAuthChallenge({
    ...input,
    clientMetadata: {signInMethod: 'SMS'},
  });

  const accessToken = respondToAuthChallengeOutput.AuthenticationResult?.AccessToken;

  if (!accessToken) {
    throw new Error('Cognito did not return an access token');
  }

  await AsyncStorage.setItem('@access_token', accessToken);
}

interface PasskeyAuthInput {
  username?: string;
  token?: string;
}

export async function handlePasskeyAuth({username, token}: PasskeyAuthInput): Promise<void> {
  if (!username || !token) {
    throw new Error('Username and token are required for passkey auth');
  }

  const provideAuthParamsOutput = await initiateAuth(username);

  const clientMetadata = {signInMethod: 'PASSKEY'};

  // Provide auth params
  const authParamsOutput = await respondToAuthChallenge({
    session: provideAuthParamsOutput.Session,
    username,
    clientMetadata,
    answer: '__dummy__',
  });

  // Verify passkey challenge with token
  const passkeyChallengeOutput = await respondToAuthChallenge({
    session: authParamsOutput.Session,
    username,
    clientMetadata,
    answer: token,
  });

  const accessToken = passkeyChallengeOutput.AuthenticationResult?.AccessToken;

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
