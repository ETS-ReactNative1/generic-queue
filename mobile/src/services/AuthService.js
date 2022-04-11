import AsyncStorage from "@react-native-community/async-storage";
import GenericService from "./GenericService";
import * as RootNavigation from '../utils/rootNavigator';

export const login = async (body) => {
  return await GenericService("/login", "POST", body);
}

export const createUser = async (body) => {
  return await GenericService("/user", "POST", body);
}

export const validateUser = async (body) => {
  return await GenericService("/validate-user", "POST", body);
}

export const getToken = () => AsyncStorage.getItem('token').then(token => token).catch(err => null);
export const getUsername = () => AsyncStorage.getItem('username').then(username => username).catch(err => null);
export const getUserId = () => AsyncStorage.getItem('userId').then(userId => userId).catch(err => null);

export const saveAuthProps = async data => {
  return await Promise.all(Object.keys(data).map(key => {
    AsyncStorage.setItem(key, data[key]);
  }));
};

export const logout = async () => {
  await AsyncStorage.clear()
  RootNavigation.resetStack();
};