import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Modal, Text, TouchableOpacity, Image } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import ConfirmModal from '../../../../Components/ConfirmModal';
import Loader from '../../../../Components/Loader';
import { getOrderDetails, userUpdateOrder } from '../../../../services/OrderService';

const OrderDetails = ({ order, onClose, setCanceledOrder }) => {
  const cf = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const loadOrderDetails = async () => {
    if (order.cart.find(({ item }) => item.photoUri.startsWith("data:image"))) return;
    try {
      const payload = order.cart.map(({ item, optionsId }) => {
        return {
          itemId: item._id,
          photoUri: item.photoUri,
          optionsId
        }
      });
      const { data } = await getOrderDetails(payload);
      for (let idx = 0; idx < order.cart.length; idx++) {
        order.cart[idx].item.photoUri = data[idx].photoUri;
        order.cart[idx].optionsId = data[idx].optionsId
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  useEffect(loadOrderDetails, []);

  const modalHandler = () => {
    const onClose = () => {
      setShowModal(false);
      setErrorMessage("");
    }
    const onConfirm = async () => {
      try {
        const payload = {
          isCanceled: true
        }
        await userUpdateOrder(order._id, payload);
        setCanceledOrder(order._id);
        onClose();
      } catch (error) {
        console.log(error);
        setErrorMessage(error.response.data)
      }
    }
    const message = "Deseja cancelar esse pedido?"
    return <ConfirmModal message={message}
      errorMessage={errorMessage} onClose={onClose} onConfirm={onConfirm} />
  }

  const renderCart = ({ item }) => (
    <View style={styles.listItem}>
      {item.item.photoUri &&
        <Image
          source={{ uri: item.item.photoUri }}
          style={styles.itemImage}
        />
      }
      <View style={{ width: 50 }}>
        <Text style={{ fontWeight: '600', fontSize: 14 }}>
          {item.item.name}
        </Text>
      </View>
      <View style={{ width: 70 }}>
        <Text style={styles.itemOptions}>
          {item.optionsId.map(({ name }) => name).join(", ")}

        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      transparent={true}
      animationType={'none'}
      onRequestClose={onClose}>
      <Loader loading={isLoading} />
      {showModal && modalHandler()}
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <View>
            <Text style={{ fontSize: 12, marginBottom: 3 }}>
              Loja: {order.store.name}
            </Text>
            <Text style={{ fontSize: 12, marginBottom: 3 }}>
              Status: {order.status.value}
            </Text>
            <Text style={{ fontSize: 12, marginBottom: 3 }}>
              Data do pedido: {new Date(order.createdAt)
                .toLocaleString('pt-BR').split(" ").reverse().join(" ")}
            </Text>
          </View>
          <View style={styles.list}>
            {!isLoading &&
              <FlatList
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                onEndReachedThreshold={0.1}
                data={order.cart}
                renderItem={renderCart}
                keyExtractor={cart => cart._id}
              />}
          </View>
          <View>
            <View>
              <Text style={{ fontSize: 12, marginBottom: 3 }}>
                Total: {cf.format(order.total)}
              </Text>
              <Text style={{ fontSize: 12, marginBottom: 3 }}>
                Descrição: {order.description}
              </Text>
            </View>
            <TouchableOpacity
              disabled={order.userConfirmedPayment}
              onPress={() => setShowModal(true)}>
              <Text style={[styles.cancelBtn, order.userConfirmedPayment &&
                { color: '#FF9B9B' }, { paddingTop: 6 }]}>
                Cancelar Pedido
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <View style={styles.footerBtns}>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.cancelBtn}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default OrderDetails;

const styles = StyleSheet.create({
  itemOptions: {
    color: 'grey',
    fontSize: 12,
  },
  itemImage: {
    borderRadius: 100,
    width: 60,
    height: 60,
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
    height: 650,
    width: 380,
    borderRadius: 10,
    padding: 30,
    display: 'flex',
  },
  textModal: {
    textAlign: 'center',
    marginTop: 30
  },
  footerBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    textDecorationLine: 'underline',
    color: 'red',
    textAlign: 'center'
  },
  confirmBtn: {
    textDecorationLine: 'underline',
    color: 'green'
  },
  listItem: {
    marginHorizontal: 25,
    flexDirection: "row",
    marginTop: 5,
    marginBottom: 5,
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 20,

  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  list: {
    marginTop: 10,
    marginBottom: 14,
    backgroundColor: '#EEE',
    height: '70%',
    borderRadius: 20
  },
  separator: {
    height: 1,
    width: "95%",
    alignSelf: 'center',
    borderRadius: 100,
    backgroundColor: "#C8C8C8",
  },
  delItem: {
    backgroundColor: 'red',
    width: 20,
    height: 20,
    borderRadius: 5
  }
});
