import React, { createRef } from 'react';
import { useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Text, TextInput, View } from 'react-native';
import authStyle from '../../../../../assets/styles/auth.style';
import DatePicker from 'react-native-datepicker';
import { phoneNumberMask, cpfMask } from '../../../../utils/mask';
import cnpjMask from '../../../../utils/mask/CnpjMask';

import styles from '../../styles';

const UserInfoScreen = ({ userInfo, setUserInfo }) => {
  const [oldPassSecure, setOldPassSecure] = useState(true);
  const [newPassSecure, setNewPassSecure] = useState(true);

  const handleDocumentChange = event => {
    const doc = userInfo.document;
    if (doc.length === 11) {
      setUserInfo({
        ...userInfo,
        document: cpfMask(doc),
      });
    } else if (doc.length === 14) {
      setUserInfo({
        ...userInfo,
        document: cnpjMask(doc)
      });
    }
  };

  const handlePhoneNumberInput = phoneNumber => {
    const value = phoneNumberMask(phoneNumber);
    setUserInfo(
      {
        ...userInfo,
        phoneNumber: value
      });
  };

  return (
    <>
      <View style={styles.inputContainer}>
        <Text style={{ textAlign: 'center' }}>Nome</Text>
        <TextInput
          value={userInfo.name}
          onChangeText={(name) => setUserInfo({ ...userInfo, name: name })}
          underlineColorAndroid="#307ECC"
          placeholder="Insira seu nome..."
          placeholderTextColor="#8b9cb5"
          autoCapitalize="sentences"
          returnKeyType="next"
          blurOnSubmit={false} />
      </View>

      <View style={styles.inputContainer}>
        <Text style={{ textAlign: 'center' }}>Email</Text>
        <TextInput
          value={userInfo.email}
          onChangeText={(email) => setUserInfo({ ...userInfo, email: email })}
          underlineColorAndroid="#307ECC"
          placeholder="Insira seu email..."
          placeholderTextColor="#8b9cb5"
          keyboardType="email-address"
          returnKeyType="next"
          blurOnSubmit={false} />
      </View>

      <View style={styles.inputContainer}>
        <Text style={{ textAlign: 'center' }}>Data de Nascimento</Text>
        <DatePicker
          format="DD/MM/YYYY"
          date={userInfo.birthday}
          showIcon={false}
          customStyles={{
            placeholderText: {
              color: "#8b9cb5",
            },
            dateInput: {
              borderWidth: 0,
              borderBottomWidth: 1,
              borderColor: "#307ECC",
              color: 'white',
              alignItems: "flex-start",
            },
            dateTouchBody: {
              width: 330
            }
          }}
          underlineColorAndroid="#307ECC"
          placeholder="Insira sua data de nascimento..."
          onDateChange={date => setUserInfo({ ...userInfo, birthday: date })}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={{ textAlign: 'center' }}>Documento</Text>
        <TextInput
          value={userInfo.document}
          onBlur={handleDocumentChange}
          onChangeText={(document) => setUserInfo({ ...userInfo, document: document })}
          underlineColorAndroid="#307ECC"
          placeholder="Insira seu CPF ou CNPJ..."
          placeholderTextColor="#8b9cb5"
          returnKeyType="next"
          blurOnSubmit={false} />
      </View>

      <View style={styles.inputContainer}>
        <Text style={{ textAlign: 'center' }}>Telefone</Text>
        <TextInput
          value={userInfo.phoneNumber}
          maxLength={15}
          onChangeText={handlePhoneNumberInput}
          underlineColorAndroid="#307ECC"
          placeholder="Insira seu telefone..."
          placeholderTextColor="#8b9cb5"
          returnKeyType="next"
          blurOnSubmit={false} />
      </View>

      <View style={styles.passwordContainer}>
      <Text style={{ textAlign: 'center' }}>Informe Abaixo Somente Se For Trocar de Senha</Text>
      <View style={[styles.passwordInput, styles.inputContainer]}>
        <TextInput
          style={{width: '88%'}}
          value={userInfo.oldPassword}
          onChangeText={(password) => setUserInfo({ ...userInfo, oldPassword: password })}
          underlineColorAndroid="#307ECC"
          placeholder="Insira sua senha..."
          placeholderTextColor="#8b9cb5"
          returnKeyType="next"
          secureTextEntry={oldPassSecure}
          blurOnSubmit={false}
        />
        <Icon style={styles.textInputIcon}
          size={20}
          onPress={() => setOldPassSecure(!oldPassSecure)}
          name={oldPassSecure ? "eye" : "eye-slash"} color="#8b9cb5" />
      </View>
      <View style={[styles.passwordInput, styles.inputContainer]}>
        <TextInput
          style={{width: '88%'}}
          value={userInfo.newPassword}
          onChangeText={(password) => setUserInfo({ ...userInfo, newPassword: password })}
          underlineColorAndroid="#307ECC"
          placeholder="Insira uma nova senha..."
          placeholderTextColor="#8b9cb5"
          returnKeyType="next"
          secureTextEntry={newPassSecure}
          blurOnSubmit={false}
        />
        <Icon style={styles.textInputIcon}
          size={20}
          onPress={() => setNewPassSecure(!newPassSecure)}
          name={newPassSecure ? "eye" : "eye-slash"} color="#8b9cb5" />
      </View>
      </View>
    </>
  )
}

export default UserInfoScreen;