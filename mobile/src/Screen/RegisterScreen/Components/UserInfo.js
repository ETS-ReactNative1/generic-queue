import React, { createRef } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';

import {
  TextInput,
  View,
} from 'react-native';
import authStyle from '../../../../assets/styles/auth.style';
import DatePicker from 'react-native-datepicker';
import { phoneNumberMask, cpfMask } from '../../../utils/mask';
import { useState } from 'react';
import cnpjMask from '../../../utils/mask/CnpjMask';

const UserInfoScreen = ({ userState, setUserState, ...related }) => {
  const emailInputRef = createRef();
  const documentInputRef = createRef();
  const phoneNumberInputRef = createRef();
  const passwordInputRef = createRef();
  const birthdayInputRef = createRef();
  const [secure, setSecure] = useState(true);

  const handleDocumentChange = event => {
    const doc = userState.document;
    if (doc.length === 11) {
      setUserState({
        ...userState,
        document: cpfMask(doc),
      });
    } else if (doc.length === 14) {
      setUserState({
        ...userState,
        document: cnpjMask(doc)
      });
    }
  };

  const handlePhoneNumberInput = phoneNumber => {
    const value = phoneNumberMask(phoneNumber);
    setUserState(
      {
        ...userState,
        phoneNumber: value
      });
  };

  return (
    <>
      <View style={authStyle.SectionStyle}>
        <TextInput
          style={authStyle.inputStyle}
          value={userState.name}
          onChangeText={(name) => setUserState({ ...userState, name: name })}
          underlineColorAndroid="#f000"
          placeholder="Insira seu nome..."
          placeholderTextColor="#8b9cb5"
          autoCapitalize="sentences"
          returnKeyType="next"
          onSubmitEditing={() => emailInputRef.current && emailInputRef.current.focus()}
          blurOnSubmit={false} />
      </View><View style={authStyle.SectionStyle}>
        <TextInput
          style={authStyle.inputStyle}
          value={userState.email}
          onChangeText={(email) => setUserState({ ...userState, email: email })}
          underlineColorAndroid="#f000"
          placeholder="Insira seu email..."
          placeholderTextColor="#8b9cb5"
          keyboardType="email-address"
          ref={emailInputRef}
          returnKeyType="next"
          onSubmitEditing={() => birthdayInputRef.current.onPressDate()}
          blurOnSubmit={false} />
      </View><View style={authStyle.SectionStyle}>
        <DatePicker
          ref={birthdayInputRef}
          style={authStyle.inputStyle}
          format="DD/MM/YYYY"
          date={userState.birthday}
          showIcon={false}
          customStyles={{
            placeholderText: {
              color: "#8b9cb5",
            },
            dateText: {
              color: 'white'
            },
            dateInput:{
              borderWidth: 0,
              color: 'white',
              alignItems: "flex-start",
            }
          }}
          underlineColorAndroid="#f000"
          placeholder="Insira sua data de nascimento..."
          onDateChange={date => setUserState({...userState, birthday: date})}
        />
      </View><View style={authStyle.SectionStyle}>
        <TextInput
          style={authStyle.inputStyle}
          value={userState.document}
          onBlur={handleDocumentChange}
          onChangeText={(document) => setUserState({ ...userState, document: document })}
          underlineColorAndroid="#f000"
          placeholder="Insira seu CPF ou CNPJ..."
          placeholderTextColor="#8b9cb5"
          ref={documentInputRef}
          returnKeyType="next"
          onSubmitEditing={() => phoneNumberInputRef.current && phoneNumberInputRef.current.focus()}
          blurOnSubmit={false} />
      </View>
      <View style={authStyle.SectionStyle}>
        <TextInput
          style={authStyle.inputStyle}
          value={userState.phoneNumber}
          maxLength={15}
          onChangeText={handlePhoneNumberInput}
          underlineColorAndroid="#f000"
          placeholder="Insira seu telefone..."
          placeholderTextColor="#8b9cb5"
          ref={phoneNumberInputRef}
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current && passwordInputRef.current.focus()}
          blurOnSubmit={false} />
      </View>
      <View style={[authStyle.SectionStyle, authStyle.alignCenter]}>
        <TextInput
          style={authStyle.inputStyle}
          value={userState.password}
          onChangeText={(password) => setUserState({ ...userState, password: password })}
          underlineColorAndroid="#f000"
          placeholder="Insira sua senha..."
          placeholderTextColor="#8b9cb5"
          ref={passwordInputRef}
          returnKeyType="next"
          secureTextEntry={secure}
          blurOnSubmit={false}
          />
          <Icon style={authStyle.textInputIcon}
            size={20}
            onPress={() => setSecure(!secure)}
            name={secure ? "eye" : "eye-slash"} color="#8b9cb5"/>
      </View>
    </>
  )
}

export default UserInfoScreen;