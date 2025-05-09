import React, {useContext} from 'react';

export type AppContextType = {
  username?: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  setUserAttributes: () => Promise<void>;
  clearUserAttributes: () => void;
};

export const AppContext = React.createContext<AppContextType>({
  setUserAttributes: async () => {},
  clearUserAttributes: () => {},
});

export const useAppContext = () => useContext(AppContext);
