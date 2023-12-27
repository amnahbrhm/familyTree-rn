import AsyncStorage from '@react-native-async-storage/async-storage';

import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext({
  token: '',
  user: '',
  isAuthenticated: false,
  authenticate: (token, user) => {},
  logout: () => {},
});

function AuthContextProvider({ children }) {
  const [authToken, setAuthToken] = useState('');
  const [authUser, setAuthUser] = useState('');

  function authenticate(token, user) {
    console.log('start authCx');
    console.log(typeof(user));
    console.log(user);
    console.log('end authCx');

    setAuthToken(token);
    setAuthUser(JSON.stringify(user));
    AsyncStorage.setItem('token', token);
    AsyncStorage.setItem('user', JSON.stringify(user));
  }

  function logout() {
    setAuthToken(null);
    setAuthUser(null);
    AsyncStorage.removeItem('user');
    AsyncStorage.removeItem('token');
  }

  const value = {
    token: authToken,
    user: authUser,
    isAuthenticated: !!authToken,
    authenticate: authenticate,
    logout: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
