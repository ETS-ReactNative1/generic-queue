import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import Modal from "react-native-modal";
import Loader from '../../Components/Loader';
import UserInfo from './Components/UserInfo';
import AddressInfo from './Components/AddressInfo';
import authStyle from '../../../assets/styles/auth.style';
import cpfValidator from '../../utils/validator/CpfValidator';
import { createUser, saveAuthProps, validateUser } from '../../services/AuthService';
import cnpjValidator from '../../utils/validator/CnpjValidator';
import getLocation from '../../utils/getLocation';

const RegisterScreen = ({ navigation }) => {
  const initialUserState = {
    name: "",
    email: "",
    birthday: null,
    document: "",
    phoneNumber: "",
    password: "",
  }
  const initialAddressState = {
    cep: "",
    state: "",
    city: "",
    street: "",
    neighborhood: "",
    number: "",
    complement: "",
  }
  const initialFormState = {
    isSubmitting: false,
    errorMessage: "",
    signUpSuccess: false
  }
  const [userState, setUserState] = useState(initialUserState);
  const [addressState, setAddressState] = useState(initialAddressState);
  const [formState, setFormState] = useState(initialFormState);
  const [page, setPage] = useState(1);

  const handleUserInfo = async () => {
    setFormState({
      ...formState,
      isSubmitting: true,
      errorMessage: ""
    });
    setFormState(initialFormState)
    const hasEmpty = !Object.values(userState).some(x => x.trim().length);
    if (hasEmpty) {
      setFormState({
        ...formState,
        isSubmitting: false,
        errorMessage: 'Favor preencher todos os campos'
      });
      return;
    }

    if (userState.password.length <= 6) {
      setFormState({
        ...formState,
        isSubmitting: false,
        errorMessage: "Senha deve ser maior que 6 caracteres"
      });
      return;
    }

    if (userState.phoneNumber.length !== 15) {
      setFormState({
        ...formState,
        isSubmitting: false,
        errorMessage: "Número de telefone inválido"
      });
      return;
    }
    const currentDate = new Date();
    const date = userState.birthday.split("/");
    const birthday = new Date(date[2], date[1] - 1, date[0]);
    let age = currentDate.getFullYear() - birthday.getFullYear();
    const m = currentDate.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && currentDate.getDate() < birthday.getDate())) {
      age--;
    }

    if (age <= 16) {
      setFormState({
        ...formState,
        isSubmitting: false,
        errorMessage: "Apenas usuários maiores de 16 anos podem se cadastrar"
      });
      return;
    }

    const doc = userState.document.replace(/\D/g, '');
    if ((doc.length === 11 && !cpfValidator(doc)) ||
      (doc.length === 14 && !cnpjValidator(doc))) {
      setFormState({
        ...formState,
        isSubmitting: false,
        errorMessage: "CPF inválido"
      });
      return;
    }
    try {
      const response = await validateUser(userState);
      if (response.status === 400) {
        setFormState({
          ...formState,
          isSubmitting: false,
          errorMessage: "Credenciais já utilizadas"
        });
        return;
      }
      setFormState({
        ...formState,
        errorMessage: "",
        isSubmitting: false,
      });
      setPage(2);
    } catch (error) {
      setFormState({
        ...formState,
        isSubmitting: false,
        errorMessage: error.response.data
      });
      return;
    }
  }

  const handleSubmitButton = async () => {
    setFormState({
      ...formState,
      isSubmitting: true,
      errorMessage: ""
    });
    try {
      const payload = {
        ...userState,
        address: {
          ...addressState
        }
      }
      const response = await createUser(payload);
      await saveAuthProps(response.data);
      setFormState({
        ...formState,
        isSubmitting: false,
        signUpSuccess: true
      });
    } catch (error) {
      console.log("ERRO:", error.message);
      setFormState({
        ...formState,
        isSubmitting: false,
        errorMessage: "Erro na API"
      });
    }
  }

  const handleOnConfirmSuccess = () => {
    setFormState({
      ...formState,
      isSubmitting: true,
    });
    getLocation().then((location) => {
      navigation.replace('DrawerNavigationRoutes', { location: location })
    })
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <Loader style={{ flex: 1, position: 'absolute' }} loading={formState.isSubmitting} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          justifyContent: 'center',
          alignContent: 'center',
        }}>
        <Modal isVisible={formState.signUpSuccess}>
          <View
            style={{
              flex: 1,
              height: "100%",
              backgroundColor: '#000000',
              justifyContent: 'center',
            }}>
            <Image
              source={require('../../../assets/images/success.png')}
              style={{ height: 150, resizeMode: 'contain', alignSelf: 'center' }}
            />
            <Text style={authStyle.successTextStyle}>Cadastro Realizado Com Sucesso.</Text>
            <TouchableOpacity
              style={authStyle.buttonStyle}
              activeOpacity={0.5}
              onPress={handleOnConfirmSuccess}>
              <Text style={authStyle.buttonTextStyle}>Ir Para Tela Inicial</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        <View style={{ alignItems: 'center' }}>
          <Image
            source={require('../../../assets/images/login-logo.png')}
            style={{
              width: '50%',
              height: 100,
              resizeMode: 'contain',
              margin: 30,
            }}
          />
        </View>
        <KeyboardAvoidingView enabled>
          {page === 1 &&
            <>
              <UserInfo userState={userState} setUserState={setUserState} />
              {formState.errorMessage != '' ? (
                <Text style={authStyle.errorTextStyle}> {formState.errorMessage} </Text>
              ) : null}
              <TouchableOpacity
                style={authStyle.buttonStyle}
                activeOpacity={0.5}
                onPress={handleUserInfo}>
                <Text style={authStyle.buttonTextStyle}>SEGUINTE</Text>
              </TouchableOpacity>
            </>
          }
          {page === 2 &&
            <>
              <AddressInfo addressState={addressState} setAddressState={setAddressState}
                formState={formState} setFormState={setFormState} />
              {formState.errorMessage != '' ? (
                <Text style={authStyle.errorTextStyle}> {formState.errorMessage} </Text>
              ) : null}
              <TouchableOpacity
                style={authStyle.buttonStyle}
                activeOpacity={0.5}
                onPress={handleSubmitButton}>
                <Text style={authStyle.buttonTextStyle}>REGISTRAR</Text>
              </TouchableOpacity>
              <Text
                style={authStyle.registerTextStyle}
                onPress={() => setPage(1)}>
                &lt; Voltar
              </Text>
            </>
          }
          <Text style={authStyle.registerTextStyle}>
            Já possui uma conta? Clique&nbsp;
            <Text onPress={() => navigation.navigate('LoginScreen')}>
              aqui
            </Text>
          </Text>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};
export default RegisterScreen;

