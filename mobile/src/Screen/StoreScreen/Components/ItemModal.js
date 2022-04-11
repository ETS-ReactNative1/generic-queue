import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Modal, Text, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import BouncyCheckbox from "react-native-bouncy-checkbox";

const ItemModal = ({ cart, setCart, setShowModal, selectedItem, setSelectedItem, cf }) => {
  let initialTotal;
  if (selectedItem.length == undefined) {
    initialTotal = selectedItem.item.price +
      selectedItem.options.reduce((acc, opt) => acc + opt.price, 0);
  }
  else {
    initialTotal = 0;
    selectedItem.forEach((item, i) => {
      item.key = i.toString();
    });
  }
  const [total, setTotal] = useState(initialTotal);
  const [itemState, setItemState] = useState(selectedItem);
  const [isEditing, setIsEditing] = useState(false);

  const closeModal = () => {
    if (isEditing) {
      setCart([...cart, itemState]);
      setIsEditing(false);
    }
    setSelectedItem(null);
    setShowModal(false);
  }

  const onConfirm = () => {
    setCart([...cart, itemState]);
    setSelectedItem(null);
    setShowModal(false);
  }

  const handleOptionPressed = (isChecked, option) => {
    let newTotal;
    let newOptions;
    if (isChecked) {
      newOptions = itemState.options.concat(option);
      newTotal = total + option.price;
    }
    else {
      newOptions = itemState.options.filter(_option => _option._id != option._id);
      newTotal = total - option.price;
    }
    setTotal(newTotal);
    setItemState({
      ...itemState,
      options: newOptions
    });
  }

  const getItemTotal = (item) => item.item.price +
    item.options.reduce((acc, opt) => acc + opt.price, 0);

  const renderOption = ({ item: option }) => (
    <View style={styles.listItem}>
      <View style={{ marginHorizontal: 25, maxWidth: 150 }}>
        <Text style={{ fontWeight: '600', fontSize: 14 }}>
          {option.name}
        </Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <Text>{cf.format(option.price)}   </Text>
        <BouncyCheckbox
          isChecked={itemState.options.find(opt => opt._id === option._id)}
          iconStyle={{ borderColor: "#307ECC" }}
          fillColor="#307ECC"
          onPress={(isChecked) => handleOptionPressed(isChecked, option)}
        />
      </View>
    </View>
  );

  const handleSelectItem = (reserv) => {
    setTotal(getItemTotal(reserv));
    // remove only selected item from cart
    let newCart = cart
      .filter(cart => cart.item._id !== reserv.item._id &&
        cart.item.key !== item.key);
    setCart(newCart);
    setItemState(reserv);
    setIsEditing(true);
  }

  const handleDeleteItem = (reserv) => {
    let newItens = itemState.filter(itm => itm.key != reserv.key);
    let newCart = cart
      .filter(cart => cart.item._id !== reserv.item._id);
    setCart([...newCart, ...newItens]);
    if (!newItens.length) {
      newItens = {
        item: reserv.item,
        options: []
      };
      setTotal(reserv.item.price);
    }
    setItemState(newItens);
  }

  const handleAddNewItem = () => {
    const newItem = {
      item: itemState[0].item,
      options: []
    };
    setTotal(itemState[0].item.price)
    setItemState(newItem);
  }

  const renderItens = ({ item }) => (
    <TouchableOpacity onPress={() => handleSelectItem(item)}>
      <View style={styles.listItem}>
        <View style={{ marginHorizontal: 25 }}>
          <Text style={{ fontWeight: '600', fontSize: 14 }}>
            {item.item.name} - {cf.format(getItemTotal(item))}
          </Text>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => handleDeleteItem(item)} style={styles.delItem}>
            <Text style={{ textAlign: 'center', color: 'white' }}>
              -
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent={true}
      animationType={'none'}
      onRequestClose={closeModal}>
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          {itemState.length == undefined ?
            <>
              <View style={styles.headerItem}>
                <Text style={{ fontWeight: '600', fontSize: 14 }}>
                  {itemState.item.name}
                </Text>
                <Text style={{ color: 'grey', fontSize: 12 }}>
                  {itemState.item.description}
                </Text>
              </View>
              <View style={styles.list}>
                <FlatList
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                  onEndReachedThreshold={0.1}
                  data={itemState.item.options}
                  renderItem={renderOption}
                  keyExtractor={option => option._id}
                />
              </View>

              <View style={styles.footer}>
                <View style={styles.totalView}>
                  <Text style={{ fontWeight: 'bold' }}>Total:</Text>
                  <Text> {cf.format(total)}</Text>
                </View>
                <View style={styles.footerBtns}>
                  <TouchableOpacity onPress={closeModal}>
                    <Text style={styles.cancelBtn}>Voltar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onConfirm}>
                    <Text style={styles.confirmBtn}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </> :

            <>
              <View>
                <FlatList
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                  onEndReachedThreshold={0.1}
                  data={itemState}
                  renderItem={renderItens}
                  keyExtractor={(item) => item.key}
                />
              </View>
              <View style={styles.footer}>
                <View style={styles.footerBtns}>
                  <TouchableOpacity onPress={closeModal}>
                    <Text style={styles.cancelBtn}>Voltar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleAddNewItem}>
                    <Text style={styles.confirmBtn}>Adicionar Novo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>}
        </View>
      </View>
    </Modal>
  );
};

export default ItemModal;

const styles = StyleSheet.create({
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
  headerItem: {
    alignItems: 'center'
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
    color: 'red'
  },
  confirmBtn: {
    textDecorationLine: 'underline',
    color: 'green'
  },
  listItem: {
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
    margin: 5,
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
