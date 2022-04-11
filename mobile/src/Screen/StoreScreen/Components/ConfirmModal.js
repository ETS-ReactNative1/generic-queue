import React, { useState } from 'react';
import { StyleSheet, View, Modal, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import { getUserId } from '../../../services/AuthService';
import { createOrder } from '../../../services/OrderService';
import getLocation from '../../../utils/getLocation';
import Loader from '../../../Components/Loader';

const ConfirmModal = ({ setShowModal, cf, cart, storeId, navigation }) => {
  let itens = [];
  let total = 0;
  const cartCopy = JSON.parse(JSON.stringify(cart));

  const checkOptions = (options, nextOptions) => {
    return options.length === nextOptions.length &&
      options.every((optId, idx) => optId._id === nextOptions[idx]._id)
  }
  for (let crtIdx = 0; crtIdx < cartCopy.length; crtIdx++) {
    const cartItem = cartCopy[crtIdx];
    const totalItem = cartItem.item.price +
      cartItem.options.reduce((acc, opt) => acc + opt.price, 0);
    const newCartItem = {
      _id: cartItem._id,
      item: cartItem.item,
      options: cartItem.options,
      qtd: 1,
      total: totalItem
    }
    total += totalItem;
    for (let i = crtIdx + 1; i < cartCopy.length; i++) {
      const nextCartItem = cartCopy[i];
      if (newCartItem.item._id === nextCartItem.item._id &&
        checkOptions(newCartItem.options, nextCartItem.options)) {
        cartCopy.splice(i, 1);
        newCartItem.qtd += 1;
        const totalItem = nextCartItem.item.price +
          nextCartItem.options.reduce((acc, opt) => acc + opt.price, 0);
        newCartItem.total += totalItem;
        total += totalItem;
      }
    }
    itens.push(newCartItem);
  }

  const radioProps = [
    { label: 'Buscar na loja', value: 'NO_DELIVERY' },
    { label: 'Entregar em casa', value: 'DELIVER_AT_HOME' },
    { label: 'Entregar onde estou', value: 'DELIVER_AT_LOCATION' }
  ];

  const [description, setDescription] = useState("");
  const [devileryState, setDevileryState] = useState(radioProps[0].value);
  const [isLoading, setIsLoading] = useState(false);

  const onConfirm = async () => {
    setIsLoading(true);
    try {
      const userId = await getUserId();
      const deliveryAddress = devileryState === radioProps[2].value ?
        await getLocation() : devileryState === radioProps[1].value ?
          'DELIVER_AT_HOME' : null;
      const _cart = cart.map(({ item, options }) => {
        return {
          item: item._id,
          optionsId: options.map(opt => opt._id)
        }
      });
      const payload = {
        cart: _cart,
        deliveryAddress,
        userId,
        description
      }
      await createOrder(storeId, payload);
      setIsLoading(false);
      setShowModal(false);
      navigation.navigate('OrdersScreenStack');

    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  return (
    <Modal
      transparent={true}
      animationType={'none'}
      onRequestClose={() => setShowModal(false)}>
      <Loader loading={isLoading} />
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: 10 }}>
              {itens.map((item, idx) => (
                <View style={styles.itemDetail} key={idx}>
                  <View>
                    <Text>{item.qtd} X {item.item.name}
                      {item.options.length ? ` (${item.options.map(({ name }) => name).join(", ")})` : ""}</Text>
                  </View>
                  <View>
                    <Text>{cf.format(item.total)}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.totalView}>
              <Text style={{ fontWeight: 'bold' }}>Total:</Text>
              <Text> {cf.format(total)}</Text>
            </View>
            <View>
              <View style={{ marginVertical: 20 }}>
                <TextInput
                  style={{ borderRadius: 20, backgroundColor: '#D3D3D3' }}
                  multiline={true}
                  numberOfLines={5}
                  placeholder="Adicionar uma descrição..."
                  onChangeText={(desc) => setDescription(desc)}
                  value={description} />
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ marginBottom: 12 }}>
                  Como deseja pegar o pedido?
                </Text>
                <RadioForm
                  formHorizontal={true}
                  animation={true}
                >
                  {radioProps.map((obj, i) => (
                    <RadioButton labelHorizontal={false} key={i} >
                      <RadioButtonInput
                        obj={obj}
                        index={i}
                        isSelected={devileryState === obj.value}
                        onPress={(value) => setDevileryState(value)}
                        borderWidth={1}
                        buttonOuterColor={devileryState === obj.value ? '#2196f3' : '#000'}
                        buttonSize={14}
                        buttonOuterSize={14}
                        buttonStyle={{}}
                        buttonWrapStyle={{ marginLeft: 10 }}
                      />
                      <RadioButtonLabel
                        obj={obj}
                        index={i}
                        labelHorizontal={true}
                        onPress={(value) => setDevileryState(value)}
                        labelStyle={{ fontSize: 10 }}
                        labelWrapStyle={{}}
                      />
                    </RadioButton>
                  ))
                  }
                </RadioForm>
              </View>
            </View>
            <View style={styles.footer}>
              <View style={styles.footerBtns}>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelBtn}>Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onConfirm}>
                  <Text style={styles.confirmBtn}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;

const styles = StyleSheet.create({
  itemDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  footerBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    textDecorationLine: 'underline',
    color: 'red'
  },
  confirmBtn: {
    textDecorationLine: 'underline',
    color: 'green'
  },
  totalView: {
    flexDirection: 'row',
    marginBottom: 15,
    justifyContent: 'space-between'
  },
  modalBackground: {
    zIndex: 99,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040',
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 450,
    width: 350,
    borderRadius: 10,
    padding: 30,
    display: 'flex',
  },
});
