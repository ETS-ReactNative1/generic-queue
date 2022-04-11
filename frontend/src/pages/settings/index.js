import React, { useState, useEffect } from 'react';
import { useTitle } from 'hookrouter';
import Modal from '../../components/modal';
import { getStoreId, logout } from '../../hooks/auth';

import { deleteStore, getStore, updateStore } from '../../services/StoreService';
import Loader from 'react-loader-spinner';
import ManagerForm from './components/ManagerForm';
import StoreForm from './components/StoreForm';

import './index.css';

const Settings = () => {
  useTitle('Configurações');

  const initalFormState = {
    isSearchingCep: false,
    cepErrorMessage: false,
    showStore: true,
    imgChanged: false,
    loading: false,
    isDeleting: false,
    errorMessage: '',
  };

  const [showModal, setShowModal] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formState, setFormState] = useState(initalFormState);
  const [storeState, setStoreState] = useState({});
  const [managerState, setManagerState] = useState({});
  const [initialStoreState, setInitialStoreState] = useState({});
  const [initialManagerState, setInitialManagerState] = useState({});

  const toString = obj => Object.entries(obj).toString()
  const objtIsNotEmpty = (obj) => Object.keys(obj).length;

  const loadStore = async () => {
    try {
      const storeId = getStoreId();
      const response = await getStore(storeId);
      const { manager, ...store } = response.data;
      store.status.forEach(sts => sts.label = sts.value);
      const status = store.status.map(sts => { return { ...sts } });
      manager.birthday = new Date(manager.birthday);


      setInitialStoreState({ ...store, status: status });
      setStoreState(store);

      setInitialManagerState(manager);
      setManagerState(manager);
      setIsFetching(false);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadStore();
  }, []);

  const submitStore = async () => {
    setFormState({
      ...formState,
      loading: true,
      errorMessage: '',
    });
    if (formState.isDeleting) {
      try {
        const response = await deleteStore(storeState._id);
        if (response.status === 200) {
          logout();
        }
        else {
          setFormState({
            ...formState,
            errorMessage: "Não foi possível deletar a loja, verifique se existem algum pedido em andamento",
            loading: false
          });
        }
      } catch (error) {
        console.log(error);
        setFormState({
          ...formState,
          errorMessage: `Erro: ${error.response.data}`,
          loading: false
        });
      }
    }
    // PUT
    else {
      let store = {};
      const isSameAddressStore = toString(storeState.address) === toString(initialStoreState.address);
      const isSameStore = toString(initialStoreState) === toString(storeState);

      const newStatus = storeState.status;
      const oldStatus = initialStoreState.status;
      const isSameStatus = newStatus.length === oldStatus.length &&
        newStatus.every((o, idx) => toString(o) === toString(oldStatus[idx]));

      if (!isSameStore) {
        store = {
          ...storeState,
          photoUri: formState.imgChanged ? storeState.photoUri : '',
        }
        if (isSameAddressStore) {
          delete store.address;
        }
        if (isSameStatus) {
          delete store.status;
        }
      }
      else if (!isSameAddressStore) {
        store.address = storeState.address;
      }
      else if (!isSameStatus) {
        store.status = newStatus;
      }
      let manager = {};
      const isSameAddressManager = toString(managerState.address) === toString(initialManagerState.address);
      const isSameManager = toString(initialManagerState) === toString(managerState);
      if (!isSameManager) {
        manager = { ...managerState };
        if (isSameAddressManager) {
          delete manager.address;
        }
      }
      else if (!isSameAddressManager) {
        manager.address = managerState.address;
        manager._id = managerState._id;
      }
      if (!objtIsNotEmpty(store) && !objtIsNotEmpty(manager)) {
        closeModal();
        return
      }
      if (store.status) {
        store.status.forEach(sts => { delete sts.label; });
      }
      const dataDto = { store, manager };
      try {
        const response = await updateStore(storeState._id, dataDto);
        const { manager, ..._store } = response.data;
        _store.status.forEach(sts => sts.label = sts.value)
        manager.birthday = new Date(manager.birthday);
        setInitialManagerState(manager)
        setManagerState(manager);
        setInitialStoreState(_store);
        setStoreState(_store);
        setFormState({
          ...formState,
          imgChanged: false,
          loading: false
        })
        setShowModal(false)
      } catch (error) {
        console.log(error)
        setFormState({
          ...formState,
          errorMessage: `Erro: ${error.response.data}`,
          loading: false
        });
      }
    }
  }

  const closeModal = () => {
    setFormState({
      ...formState,
      loading: false,
      isDeleting: false
    });
    setShowModal(false);
  }

  const modalHandler = () =>
    <Modal
      onCancel={closeModal}
      onConfirm={submitStore}
    >
      <h2>
        {formState.isDeleting ?
          'Deseja realmente deletar sua loja?' :
          'Deseja alterar os dados da loja e/ou gerente?'}
      </h2>
    </Modal>
    ;

  const deleteStoreModal = () => {
    setFormState({
      ...formState,
      isDeleting: true
    });
    setShowModal(true);
  }

  return (
    <>
      <div>
        <Loader
          type="Puff"
          color="#00BFFF"
          className="loader"
          height={100}
          width={100}
          visible={formState.loading || isFetching}
        />
      </div>
      <div className="container-manage" >
        <div className="btn-group">
          <button onClick={() => setFormState({ ...formState, showStore: true })}>Loja</button>
          <button onClick={() => setFormState({ ...formState, showStore: false })}>Gerente</button>
        </div>
        <div className="settings-panel">
          {!isFetching && (formState.showStore ?
            <StoreForm storeState={storeState} setStoreState={setStoreState}
              formState={formState} setFormState={setFormState} /> :
            <ManagerForm managerState={managerState} setManagerState={setManagerState}
              formState={formState} setFormState={setFormState} />)
          }
        </div>
        <div className="settings-btns">
          <h4 className="delete-store" onClick={deleteStoreModal}>Deletar Loja</h4>
          <div className="align-end-btns">
            <button style={{ marginRight: '10px' }}
              className="btn reset-btn"
              onClick={() => {
                setStoreState(initialStoreState);
                setManagerState(initialManagerState);
                setFormState(initalFormState)
              }}>
              Resetar
            </button>
            <button className="btn edit-item-btn"
              onClick={() => setShowModal(true)}>
              Salvar
            </button>

          </div>
        </div>
        {showModal && modalHandler()}
      </div>
    </>
  );
};

export default Settings;