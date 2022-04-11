import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { FlatList, } from 'react-native-gesture-handler';
import { searchStore } from '../../../services/StoreService';
import styles from '../styles';
import Loader from '../../../Components/Loader';
import { getUserId } from '../../../services/AuthService';
import { getUserOrders, userUpdateOrder } from '../../../services/OrderService';
import { useIsFocused } from "@react-navigation/native";
import ConfirmModal from '../../../Components/ConfirmModal';
import OrderDetails from './Components/OrderDetails';

const OrdersScreen = () => {
  const initialFormState = {
    loading: false,
    onEnd: false,
    total: 0,
    page: 1,
  }
  const PER_PAGE = 20;
  const [orders, setOrders] = useState([]);
  const [formState, setFormState] = useState(initialFormState);
  const [showModal, setShowModal] = useState(false);
  const [payOrder, setPayOrder] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const isFocused = useIsFocused();

  const loadOnEndReached = async () => {
    if (PER_PAGE * formState.page >= formState.total) {
      return;
    }
    setFormState({
      ...formState,
      loading: true,
      onEnd: true,
    })
    const newPage = formState.page + 1;
    const payload = {
      name: storeName,
      page: newPage,
      perPage: PER_PAGE,
    };

    try {
      const { data } = await searchStore(payload);
      const _stores = data.data;
      setFormState({
        ...formState,
        page: data.page,
        total: data.total,
        loading: false
      });
      const newStores = stores.concat(_stores);
      setStores(newStores);
    } catch (error) {
      console.log(error)
      setFormState({
        loading: false
      });
    }
  }

  const loadOrders = async () => {
    const userId = await getUserId();
    setFormState({
      ...formState,
      onEnd: false,
      loading: true
    });
    try {
      const payload = {
        page: 1,
        perPage: PER_PAGE,
      };
      const { data } = await getUserOrders(userId, payload);
      const orders = data.data
      setOrders(orders)
      setFormState({
        ...formState,
        page: data.page,
        total: data.total,
        loading: false
      });
    } catch (error) {
      console.log(error)
      setFormState({
        ...formState,
        total: 0,
        page: 1,
        loading: false
      });
    }
  }

  useEffect(() => {
    if (isFocused) {
      loadOrders();
    }
  }, [isFocused]);

  const onConfirmPayment = (orderId) => {
    setPayOrder(orderId);
    setShowModal(true);
  }

  const showOrderDetails = (orderId) => {
    const order = orders.find(({ _id }) => _id === orderId);
    setPayOrder(order);
    setShowModal(true);
  }

  const onClose = () => {
    setShowModal(false);
    setPayOrder("");
    setErrorMessage("");
  }

  const modalHandler = () => {
    if (payOrder.length) {
      const onConfirm = async () => {
        try {
          const payload = {
            userConfirmedPayment: true
          }
          await userUpdateOrder(payOrder, payload);
          const orderIdx = orders.findIndex(({ _id }) => _id === payOrder);
          const newOrders = [...orders];
          newOrders[orderIdx].userConfirmedPayment = true;
          setOrders(newOrders);
          onClose();
        } catch (error) {
          console.log(error);
          setErrorMessage(error.response.data)
        }
      }
      const message = "Deseja pagar esse pedido como pago?"
      return <ConfirmModal message={message}
        errorMessage={errorMessage} onClose={onClose} onConfirm={onConfirm} />
    }
    const setCanceledOrder = (orderId) => {
      const orderIdx = orders.findIndex(({ _id }) => _id === orderId);
      const newOrders = [...orders];
      newOrders[orderIdx].isCanceled = true;
      setOrders(newOrders);
    }
    return <OrderDetails order={payOrder}
      onClose={onClose} setCanceledOrder={setCanceledOrder} />
  }

  const renderOrder = ({ item }) => (
    <>
      <TouchableOpacity activeOpacity={0.8} onPress={() => showOrderDetails(item._id)}>
        <View style={styles.listItem}>
          <View style={{ width: 80 }}>
            <Text style={{ fontSize: 12 }}>{item.store.name}</Text>
          </View>
          <View style={{ width: 80 }}>
            <Text style={{ fontSize: 12 }}>
              {item.deliveryAddress ?
                `Entrega em\n${item.deliveryAddress.street}, ${item.deliveryAddress.number}` :
                'Buscar na loja'}
            </Text>
          </View>
          <View style={{ width: 80 }}>
            <Text style={{ fontSize: 12, textAlign: 'center' }}>
              Status:
            </Text>
            <Text style={{ fontSize: 12 }}>
              {item.status.value}
            </Text>
          </View>
          <View style={{ width: 76, justifyContent: 'center' }}>
            {item.isPaid ?
              <Text style={{ fontSize: 12 }}>
                Pago
              </Text> :
              item.userConfirmedPayment ?
                <Text style={{ fontSize: 12 }}>
                  Confirmando pagamento...
                </Text> :
                item.isCanceled ?
                  <Text style={{ fontSize: 12 }}>
                    Pedido cancelado
                  </Text> :
                  <TouchableOpacity activeOpacity={0.8} onPress={() => onConfirmPayment(item._id)}>
                    <Text style={styles.PaymentBtn}>
                      Confirmar Pagamento
                    </Text>
                  </TouchableOpacity>
            }
          </View>
          <View>
          </View>
        </View>
      </TouchableOpacity>
    </>
  );

  const renderFooter = () => {
    if (!formState.onEnd && !formState.loading) return null;
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Loader loading={!formState.onEnd && formState.loading} />
      {showModal && modalHandler()}
      {orders.length ?
        <FlatList
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.list}
          onEndReached={loadOnEndReached}
          onEndReachedThreshold={0.1}
          data={orders}
          renderItem={renderOrder}
          keyExtractor={order => order._id}
          ListFooterComponent={renderFooter}
        /> :
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: 20,
              textAlign: 'center',
              marginBottom: 16,
            }}>
            Nenhum Pedido Encontrado
          </Text>
        </View>}
    </SafeAreaView>
  );
};

export default OrdersScreen;
