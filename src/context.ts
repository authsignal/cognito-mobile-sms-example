import React, {useContext} from 'react';
import {CognitoUserAttributes} from './cognito';

export type AppContextType = {
  username?: string;
  email?: string;
  phoneNumber?: string;
  givenName?: string;
  familyName?: string;
  updateUserAttributes: () => Promise<CognitoUserAttributes>;
  clearUserAttributes: () => void;
};

export const AppContext = React.createContext<AppContextType>({
  updateUserAttributes: async () => ({phoneNumberVerified: false, emailVerified: false}),
  clearUserAttributes: () => {},
});

export const useAppContext = () => useContext(AppContext);
