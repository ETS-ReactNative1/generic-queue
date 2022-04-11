import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { getUserId, logout } from '../../../services/AuthService';
import { deleteUser, getUser, updateUser } from '../../../services/UserService';
import Loader from '../../../Components/Loader';
import AddressInfoScreen from './Components/AddressInfo';
import UserInfoScreen from './Components/UserInfo';

import styles from '../styles';
import ConfirmModal from '../../../Components/ConfirmModal';

const SettingsScreen = () => {

  const [showAddress, setShowAddress] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [address, setAddress] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [initialUserInfo, setInitialUserInfo] = useState({});
  const [initialAddress, setInitialAddress] = useState({});

  const toString = obj => Object.entries(obj).toString();
  const objtIsNotEmpty = (obj) => Object.keys(obj).length;

  const loadUser = async () => {
    try {
      const userId = await getUserId();
      const { data } = await getUser(userId);
      const { address, ...user } = data;
      user.birthday = new Date(user.birthday);
      setUserInfo(user);
      setInitialUserInfo(user);
      setAddress(address);
      setInitialAddress(address);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  }

  useEffect(() => {
    loadUser();
  }, [])

  const toggleShowAddress = () => setShowAddress(!showAddress);

  const resetForm = () => {
    setUserInfo(initialUserInfo);
    setAddress(initialAddress);
  }

  const onDeletePress = () => {
    setIsDeleting(true);
    setShowModal(true);
  }

  const onSavePress = () => {
    setIsDeleting(false);
    setShowModal(true);
  }

  const modalHandler = () => {
    let message;
    let handler;
    if (isDeleting) {
      message = "Deseja realmente deletar sua conta?";
      handler = deleteAccount;
    }
    else {
      message = "Deseja realmente salvar as alterações?";
      handler = saveChanges;
    }
    return <ConfirmModal errorMessage={errorMessage}
      message={message} onConfirm={handler}
      onClose={() => { setShowModal(false); setErrorMessage("") }} />;
  }

  const deleteAccount = async () => {
    try {
      await deleteUser(userInfo._id);
      await logout();
    } catch (error) {
      setErrorMessage(error.response.data)
      console.log(error)
    }
  }

  const saveChanges = async () => {
    try {
      if (userInfo.oldPassword && !userInfo.newPassword ||
        !userInfo.oldPassword && userInfo.newPassword) {
        setErrorMessage(`Favor inserir tanto a senha 
          antigo quanto a nova, ou apagar ambas para não alterar`)
        return;
      }
      let user = {};
      const isSameAddress = toString(address) === toString(initialAddress);
      const isSameUser = toString(initialUserInfo) === toString(userInfo);

      if (!isSameUser) {
        user = { ...userInfo };
      }
      if (!isSameAddress) {
        user = { ...user, address: address }
      }
      if (!objtIsNotEmpty(user)) {
        setErrorMessage("Nada para ser alterado");
        return;
      }
      setIsLoading(true);
      await updateUser(userInfo._id, user);
      setIsLoading(false);
      setShowModal(false);
    } catch (error) {
      setErrorMessage(error.response.data)
      console.log(error)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Loader loading={isLoading} />
      {showModal && modalHandler()}
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.headerBtn, styles.headerBtnLeft,
          !showAddress && { backgroundColor: '#124980' }]}
          disabled={!showAddress}
          onPress={toggleShowAddress}
        >
          <Text style={styles.headerBtnText}>Dados</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.headerBtn, styles.headerBtnRight,
          showAddress && { backgroundColor: '#124980' }]}
          disabled={showAddress}
          onPress={toggleShowAddress}
        >
          <Text style={styles.headerBtnText}>Endereço</Text>
        </TouchableOpacity>
      </View>
      <View style={{
        flex: 1,
        paddingTop: 20
      }}>
        <ScrollView>
          {showAddress ?
            <AddressInfoScreen addressInfo={address} setAddressInfo={setAddress} /> :
            <UserInfoScreen userInfo={userInfo} setUserInfo={setUserInfo} />}

          <View style={styles.settingsFooter}>

            <TouchableOpacity onPress={onDeletePress}>
              <Text style={{ textDecorationLine: "underline", color: 'red' }}>Excluir Conta</Text>
            </TouchableOpacity>

            <View style={styles.footerRigthMenu}>

              <TouchableOpacity onPress={resetForm}>
                <Text style={{ textDecorationLine: "underline", color: '#C29200' }}>Resetar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onSavePress}>
                <Text style={{ textDecorationLine: "underline", color: 'green' }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
