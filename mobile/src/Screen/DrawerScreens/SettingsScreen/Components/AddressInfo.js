import axios from 'axios';
import React, { createRef } from 'react';
import { TextInput, View, Keyboard, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import authStyle from '../../../../../assets/styles/auth.style';
import { cepMask } from '../../../../utils/mask';

import styles from '../../styles';

const AddressInfoScreen = ({ addressInfo, setAddressInfo }) => {
  
  const handleCepInput = cep => {
    const value = cepMask(cep);
    setAddressInfo(
      {
        ...addressInfo,
        cep: value
      });
  };

  const searchCep = async () => {
    setFormState({
      ...formState,
      isSubmitting: true,
      errorMessage: ""
    });
    if (addressInfo.cep.length < 9) {
      setFormState({
        ...formState,
        errorMessage: "CEP inválido"
      });
      return;
    }
    setFormState({
      ...formState,
      isSubmitting: true
    });
    const _cep = addressInfo.cep.replace("-", "");
    try {
      const res = await axios.get(`https://viacep.com.br/ws/${_cep}/json/`);
      if (res.data.erro) {
        console.log("error get cep", res.data.erro)
        setFormState({
          ...formState,
          isSubmitting: false,
          errorMessage: "CEP inválido"
        });
        return;
      }
      else {
        const { bairro, localidade, logradouro, uf } = res.data;
        const newData = {
          ...addressInfo,
          neighborhood: bairro,
          city: localidade,
          state: uf,
          street: logradouro,
        };
        setAddressInfo(newData);
        setFormState({
          ...formState,
          isSubmitting: false,
          errorMessage: ""
        });
      }
      
    } catch (err) {
      console.log(err);
      setFormState({
        ...formState,
        isSubmitting: false,
        errorMessage: "Erro na API"
      });
    }
  }

  return (
    <>
      <View style={styles.inputContainer}>
        <Text style={{ textAlign: 'center' }}>CEP</Text>
        <View style={styles.passwordInput}>
          <TextInput
            style={{width: '88%'}}
            underlineColorAndroid="#307ECC"
            value={addressInfo.cep}
            onChangeText={handleCepInput}
            placeholder="Digite seu cep..."
            placeholderTextColor="#8b9cb5"
            autoCapitalize="sentences"
            onSubmitEditing={searchCep}
            onBlur={searchCep}
            returnKeyType="next"
            blurOnSubmit={false}
          />
          <Icon style={styles.textInputIcon}
              size={20}
              onPress={searchCep}
              name={"search"} color="#8b9cb5"/>
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Text style={{ textAlign: 'center' }}>Estado</Text>
        <TextInput
          value={addressInfo.state}
          underlineColorAndroid="#307ECC"
          onChangeText={(state) => setAddressInfo({...addressInfo, state: state})}
          placeholder="Digite seu estado..."
          placeholderTextColor="#8b9cb5"
          autoCapitalize="sentences"
          returnKeyType="next"
          blurOnSubmit={false}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={{ textAlign: 'center' }}>Cidade</Text>
        <TextInput
          value={addressInfo.city}
          underlineColorAndroid="#307ECC"
          onChangeText={(city) => setAddressInfo({...addressInfo, city: city})}
          placeholder="Digite sua cidade..."
          placeholderTextColor="#8b9cb5"
          autoCapitalize="sentences"
          returnKeyType="next"
          blurOnSubmit={false}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={{ textAlign: 'center' }}>Estado</Text>
        <TextInput
          value={addressInfo.neighborhood}
          underlineColorAndroid="#307ECC"
          onChangeText={(neighborhood) => setAddressInfo({...addressInfo, neighborhood: neighborhood})}
          placeholder="Digite seu bairro..."
          placeholderTextColor="#8b9cb5"
          autoCapitalize="sentences"
          returnKeyType="next"
          blurOnSubmit={false}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={{ textAlign: 'center' }}>Rua</Text>
        <TextInput
          value={addressInfo.street}
          underlineColorAndroid="#307ECC"
          onChangeText={(street) => setAddressInfo({...addressInfo, street: street})}
          placeholder="Digite sua rua..."
          placeholderTextColor="#8b9cb5"
          autoCapitalize="sentences"
          returnKeyType="next"
          blurOnSubmit={false}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={{ textAlign: 'center' }}>Número</Text>
        <TextInput
          value={addressInfo.number}
          underlineColorAndroid="#307ECC"
          onChangeText={(number) => setAddressInfo({...addressInfo, number: number})}
          placeholder="Digite o número..."
          placeholderTextColor="#8b9cb5"
          autoCapitalize="sentences"
          returnKeyType="next"
          blurOnSubmit={false}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={{ textAlign: 'center' }}>Complemento</Text>
        <TextInput
          value={addressInfo.complement}
          underlineColorAndroid="#307ECC"
          onChangeText={(complement) => setAddressInfo({...addressInfo, complement: complement})}
          placeholder="Digite um complemento..."
          placeholderTextColor="#8b9cb5"
          autoCapitalize="sentences"
          returnKeyType="next"
          blurOnSubmit={false}
        />
      </View>
    </>
  )
}

export default AddressInfoScreen;