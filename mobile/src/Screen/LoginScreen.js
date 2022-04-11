import React, { useState, createRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  ScrollView,
  Image,
  Keyboard,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import authStyle from '../../assets/styles/auth.style';
import AsyncStorage from '@react-native-community/async-storage';

import Loader from '../Components/Loader';
import { login, saveAuthProps } from '../services/AuthService';
import getLocation from '../utils/getLocation';

const LoginScreen = ({ navigation }) => {
  const initialState = {
    email: "",
    password: "",
    loading: false,
    errortext: ""
  };
  const [formState, setFormState] = useState(initialState);
  const passwordInputRef = createRef();

  const handleSubmitPress = async (e) => {
    if (!formState.email || !formState.password) {
      setFormState({
        ...formState,
        errortext: "Favor preencher email e/ou senha"
      });
      return;
    }
    setFormState({
      ...formState,
      loading: true,
      errortext: ""
    });
    const { email, password, ..._ } = formState;
    try {
      const payload = {
        role: 'COSTUMER',
        email,
        password
      }
      const { data } = await login(payload);
      setFormState({
        ...formState,
        loading: false,
      });
      saveAuthProps(data)
        .then(() => {
          getLocation().then((location) => {
            navigation.replace('DrawerNavigationRoutes', { location: location })
          })
        });
    } catch (error) {
      setFormState({
        ...formState,
        errortext: "Credenciais Inválidas",
        loading: false,
      });
    }
  };

  return (
    <View style={authStyle.mainBody}>
      <Loader loading={formState.loading} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flex: 1,
          justifyContent: 'center',
          alignContent: 'center',
        }}>
        <View>
          <KeyboardAvoidingView enabled>
            <View style={{ alignItems: 'center' }}>
              <Image
                source={require('../../assets/images/login-logo.png')}
                style={{
                  width: '50%',
                  height: 100,
                  resizeMode: 'contain',
                  margin: 30,
                }}
              />
            </View>
            <View style={authStyle.SectionStyle}>
              <TextInput
                style={authStyle.inputStyle}
                onChangeText={(email) => setFormState({ ...formState, email: email })}
                placeholder="Digite seu email"
                placeholderTextColor="#8b9cb5"
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() =>
                  passwordInputRef.current && passwordInputRef.current.focus()
                }
                underlineColorAndroid="#f000"
                blurOnSubmit={false}
              />
            </View>
            <View style={authStyle.SectionStyle}>
              <TextInput
                style={authStyle.inputStyle}
                onChangeText={(password) => setFormState({ ...formState, password: password })}
                placeholder="Digite sua senha"
                placeholderTextColor="#8b9cb5"
                keyboardType="default"
                ref={passwordInputRef}
                onSubmitEditing={Keyboard.dismiss}
                blurOnSubmit={false}
                secureTextEntry={true}
                underlineColorAndroid="#f000"
                returnKeyType="next"
              />
            </View>
            {formState.errortext != '' ? (
              <Text style={authStyle.errorTextStyle}> {formState.errortext} </Text>
            ) : null}
            <TouchableOpacity
              style={authStyle.buttonStyle}
              activeOpacity={0.5}
              onPress={handleSubmitPress}>
              <Text style={authStyle.buttonTextStyle}>LOGIN</Text>
            </TouchableOpacity>
            <Text
              style={authStyle.registerTextStyle}
              onPress={() => navigation.navigate('RegisterScreen')}>
              Cadastre-se
            </Text>
          </KeyboardAvoidingView>
        </View>
      </ScrollView>
    </View>
  );
};
export default LoginScreen;