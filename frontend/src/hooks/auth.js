import React, { createContext } from 'react';
import { navigate } from 'hookrouter';

export const isAuthenticated = () => localStorage.getItem('token') !== null;
export const getToken = () => localStorage.getItem('token');
export const getUsername = () => localStorage.getItem('username');
export const getStoreId = () => localStorage.getItem('storeId');

export const login = data => {
  for(let prop in data) {
    localStorage.setItem(prop, data[prop]);
  }
};

export const logout = () => {
  localStorage.clear();
  navigate('/login');
};

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  React.useEffect(() => {
    const storeId = localStorage.getItem('storeId');
    const name = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    if (storeId && token && name) {
      
      navigate('/home');
    }
    else
      navigate('/login');
  }, []);

  const [isSigned, setIsSigned] = React.useState(false);
  return (
    <AuthContext.Provider value={{ isSigned, setIsSigned }}>
      {children}
    </AuthContext.Provider>
  );
 };
export default AuthContext;