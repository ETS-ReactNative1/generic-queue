import axios from 'axios';
import React, { createRef } from 'react';
import { TextInput, View, Keyboard} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import authStyle from '../../../../assets/styles/auth.style';
import { cepMask } from '../../../utils/mask';

const AddressInfoScreen = ({ addressState, setAddressState, formState, setFormState, ...related }) => {
  const numberInputRef = createRef();
  const cepInputRef = createRef();
  const stateInputRef = createRef();
  const cityInputRef = createRef();
  const streetInputRef = createRef();
  const neighborhoodInputRef = createRef();
  const complementInputRef = createRef();
  
  const handleCepInput = cep => {
    const value = cepMask(cep);
    setAddressState(
      {
        ...addressState,
        cep: value
      });
  };

  const searchCep = async () => {
    setFormState({
      ...formState,
      isSubmitting: true,
      errorMessage: ""
    });
    if (addressState.cep.length < 9) {
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
    const _cep = addressState.cep.replace("-", "");
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
          ...addressState,
          neighborhood: bairro,
          city: localidade,
          state: uf,
          street: logradouro,
        };
        setAddressState(newData);
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
      <View style={[authStyle.SectionStyle, authStyle.alignCenter]}>
        <TextInput
          style={authStyle.inputStyle}
          value={addressState.cep}
          onChangeText={handleCepInput}
          underlineColorAndroid="#f000"
          placeholder="Digite seu cep..."
          placeholderTextColor="#8b9cb5"
          autoCapitalize="sentences"
          ref={cepInputRef}
          onSubmitEditing={searchCep}
          onBlur={searchCep}
          returnKeyType="next"
          blurOnSubmit={false}
        />
        <Icon style={authStyle.textInputIcon}
            size={20}
            onPress={searchCep}
            name={"search"} color="#8b9cb5"/>
      </View>
      <View style={authStyle.SectionStyle}>
        <TextInput
          style={authStyle.inputStyle}
          value={addressState.state}
          onChangeText={(state) => setAddressState({...addressState, state: state})}
          underlineColorAndroid="#f000"
          placeholder="Digite seu estado..."
          placeholderTextColor="#8b9cb5"
          autoCapitalize="sentences"
          ref={stateInputRef}
          returnKeyType="next"
          onSubmitEditing={() =>
            cityInputRef.current && cityInputRef.current.focus()
          }
          blurOnSubmit={false}
        />
      </View>
      <View style={authStyle.SectionStyle}>
        <TextInput
          style={authStyle.inputStyle}
          value={addressState.city}
          onChangeText={(city) => setAddressState({...addressState, city: city})}
          underlineColorAndroid="#f000"
          placeholder="Digite sua cidade..."
          placeholderTextColor="#8b9cb5"
          autoCapitalize="sentences"
          ref={cityInputRef}
          returnKeyType="next"
          onSubmitEditing={() =>
            neighborhoodInputRef.current && neighborhoodInputRef.current.focus()
          }
          onSubmitEditing={Keyboard.dismiss}
          blurOnSubmit={false}
        />
      </View>
      <View style={authStyle.SectionStyle}>
        <TextInput
          style={authStyle.inputStyle}
          value={addressState.neighborhood}
          onChangeText={(neighborhood) => setAddressState({...addressState, neighborhood: neighborhood})}
          underlineColorAndroid="#f000"
          placeholder="Digite seu bairro..."
          placeholderTextColor="#8b9cb5"
          autoCapitalize="sentences"
          ref={neighborhoodInputRef}
          returnKeyType="next"
          onSubmitEditing={() =>
            streetInputRef.current && streetInputRef.current.focus()
          }
          blurOnSubmit={false}
        />
      </View>
      <View style={authStyle.SectionStyle}>
        <TextInput
          style={authStyle.inputStyle}
          value={addressState.street}
          onChangeText={(street) => setAddressState({...addressState, street: street})}
          underlineColorAndroid="#f000"
          placeholder="Digite sua rua..."
          placeholderTextColor="#8b9cb5"
          autoCapitalize="sentences"
          ref={streetInputRef}
          returnKeyType="next"
          onSubmitEditing={() =>
            numberInputRef.current && numberInputRef.current.focus()
          }
          blurOnSubmit={false}
        />
      </View>
      <View style={authStyle.SectionStyle}>
        <TextInput
          style={authStyle.inputStyle}
          value={addressState.number}
          onChangeText={(number) => setAddressState({...addressState, number: number})}
          underlineColorAndroid="#f000"
          placeholder="Digite o número..."
          placeholderTextColor="#8b9cb5"
          autoCapitalize="sentences"
          ref={numberInputRef}
          returnKeyType="next"
          onSubmitEditing={() =>
            complementInputRef.current && complementInputRef.current.focus()
          }
          blurOnSubmit={false}
        />
      </View>
      <View style={authStyle.SectionStyle}>
        <TextInput
          style={authStyle.inputStyle}
          value={addressState.complement}
          onChangeText={(complement) => setAddressState({...addressState, complement: complement})}
          underlineColorAndroid="#f000"
          placeholder="Digite um complemento..."
          placeholderTextColor="#8b9cb5"
          autoCapitalize="sentences"
          ref={complementInputRef}
          returnKeyType="next"
          onSubmitEditing={Keyboard.dismiss}
          blurOnSubmit={false}
        />
      </View>
    </>
  )
}

export default AddressInfoScreen;