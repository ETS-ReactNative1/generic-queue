import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  ActivityIndicator,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { getItens } from '../../services/ItemService';
import storeImgOrDefault from '../../utils/storeImgOrDefault';
import Loader from '../../Components/Loader';
import ConfirmModal from './Components/ConfirmModal';
import ItemModal from './Components/ItemModal';

const StoreScreen = ({ navigation, route }) => {
  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  const store = route.params;
  const [itens, setItens] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedItem, setSelectedItemOnCart] = useState();
  const [showModal, setShowModal] = useState(false);
  const PER_PAGE = 10;

  const initialFormState = {
    loading: true,
    onEnd: false,
    total: 0,
    page: 1,
  }
  const [formState, setFormState] = useState(initialFormState);

  const loadItens = async () => {
    try {
      const payload = {
        perPage: PER_PAGE,
        page: formState.page
      };
      const { data } = await getItens(store._id, payload);
      setFormState({
        ...formState,
        page: data.page,
        total: data.total,
        loading: false,
        onEnd: false,
      });
      setItens(data.data);

    } catch (error) {
      console.log(error)
      setFormState({
        ...formState,
        page: 1,
        total: 0,
        loading: false,
        onEnd: false,
      });
      setItens([]);
    }
  }

  useEffect(() => {
    navigation.setOptions({ title: store.name })
    loadItens();
  }, []);

  const renderFooter = () => {
    if (!formState.onEnd && !formState.loading) return null;
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }

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
      page: newPage,
      perPage: PER_PAGE,
    };

    try {
      const { data } = await getItens(store._id, payload);
      const _itens = data.data;
      setFormState({
        ...formState,
        page: data.page,
        total: data.total,
        loading: false,
        onEnd: false,
      });
      const newItens = itens.concat(_itens);
      setItens(newItens);
    } catch (error) {
      console.log(error)
      setFormState({
        loading: false
      });
    }
  }

  const showCart = () => {
    setSelectedItemOnCart(null);
    setShowModal(true);
  }

  const showItem = (item) => {
    let itemOnCart = {
      item: item,
      options: []
    };
    if (cart.length) {
      const itensOnCart = cart.filter(c => c.item._id === item._id);
      if (itensOnCart.length) {
        itemOnCart = itensOnCart;
      }
    }
    setSelectedItemOnCart(itemOnCart);
    setShowModal(true);
  }

  const renderItem = ({ item }) => {
    const itemCount = cart.filter(c => c.item._id === item._id).length
    const hasItem = cart.length && itemCount;
    return (<>
      <TouchableOpacity onPress={() => showItem(item)}>
        <View style={styles.listItem}>
          <Image style={styles.itemImage} source={storeImgOrDefault(item.photoUri)} />
          <View style={{ marginLeft: 20 }}>
            <Text style={{ fontWeight: '600', fontSize: 14 }}>
              {item.name} - {currencyFormatter.format(item.price)}
            </Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </View>
          {hasItem ?
            <View style={styles.itemCount}>
              <Text style={{ marginRight: 10 }}>
                {itemCount}
              </Text>
            </View>
            : <></>
          }
        </View>
      </TouchableOpacity>
    </>)
  };

  const modalHandler = () =>
    selectedItem ?
      <ItemModal
        cf={currencyFormatter}
        cart={cart}
        setCart={setCart}
        setShowModal={setShowModal}
        setSelectedItem={setSelectedItemOnCart}
        selectedItem={selectedItem}
      /> :
      <ConfirmModal
        setShowModal={setShowModal}
        cf={currencyFormatter} cart={cart}
        storeId={store._id} navigation={navigation} />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Loader loading={formState.loading && !formState.onEnd} />
      {showModal && modalHandler()}
      <View style={styles.headerModal}>
        <Image style={styles.itemImage}
          source={storeImgOrDefault(store.photoUri)} />
        <View>
          <View>
            <Text>Telefone: {store.phoneNumber}{"\n"}</Text>
            <Text style={{ width: 200 }}>Endereço:{"\n"}
              {store.address.street},
              {store.address.number}{"\n"}
              {store.address.neighborhood}, {store.address.city}, {store.address.state}{"\n"}
              {store.address.complement}
            </Text>
            {store.distance && <Text>Distância: {store.distance} Km</Text>}
          </View>
        </View>
      </View>
      {(!formState.loading && !formState.onEnd && !itens.length) ?
        <View style={{ alignSelf: 'center', marginTop: 35 }}>
          <Text>Nenhum Item Cadastrado Ainda</Text>
        </View> :
        <View style={styles.list}>
          <FlatList
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            onEndReached={loadOnEndReached}
            onEndReachedThreshold={0.1}
            data={itens}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            ListFooterComponent={renderFooter}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
            <TouchableOpacity onPress={() => setCart([])}>
              <Text style={{ textDecorationLine: "underline", color: '#C29200' }}>
                Limpar Carinho
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={showCart}>
              <Text style={{ textDecorationLine: "underline", color: 'green' }}>
                Fechar Pedido
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerModal: {
    paddingTop: 20,
    justifyContent: 'space-evenly',
    flexDirection: 'row'
  },
  separator: {
    height: 1,
    width: "95%",
    alignSelf: 'center',
    borderRadius: 100,
    backgroundColor: "#C8C8C8",
  },

  modalBackground: {
    zIndex: 99,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040',
  },

  textModal: {
    textAlign: 'center',
    marginTop: 30
  },
  footerBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  list: {
    margin: 5,
    backgroundColor: '#EEE',
    height: '70%',
    borderRadius: 20
  },

  listItem: {
    flexDirection: "row",
    marginTop: 5,
    marginBottom: 5,
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 20,
  },

  itemImage: {
    borderRadius: 100,
    width: 120,
    height: 120,
  },

  separator: {
    height: 1,
    width: "95%",
    alignSelf: 'center',
    borderRadius: 100,
    backgroundColor: "#C8C8C8",
  },

  itemCount: {
    alignSelf: 'center',
    marginLeft: 40,
    flexDirection: 'row'
  },

  addItem: {
    backgroundColor: '#307ECC',
    width: 20,
    height: 20,
    borderRadius: 5
  },
  itemDescription: {
    color: 'grey',
    fontSize: 12,
    maxWidth: 200
  }
});

export default StoreScreen;