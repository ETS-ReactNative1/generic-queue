import React, { useState, useEffect } from 'react';
import { useTitle } from 'hookrouter';
import Modal from '../../components/modal';
import { getStoreId } from '../../hooks/auth';
import defaultPhoto from '../../assets/product.png'
import Loader from "react-loader-spinner";
import useDebounce from '../../utils/useDebouce';
import ReactPaginate from "react-paginate";

import './index.css';
import { createItem, deleteItem, getItens, updateItem } from '../../services/ItemService';

const Manage = () => {
  useTitle('Gerenciar Produtos');

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const initalFormState = {
    imgChanged: false,
    loading: false,
    readOnly: false,
    isDeleting: false,
    itemId: '',
    errorMessage: '',
    total: 0,
  };


  const initialItemState = {
    photoUri: defaultPhoto,
    name: '',
    description: '',
    price: '',
    options: [],
  }

  const storeId = getStoreId();
  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState(initalFormState);
  const [itemState, setItemState] = useState(initialItemState);
  const [itensState, setItensState] = useState([]);
  const [itemName, setItemName] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const debouncedItemName = useDebounce(itemName, 2000);

  const loadItens = async itemName => {
    setFormState({
      ...formState,
      errorMessage: '',
      loading: true
    });
    try {
      const payload = {
        name: itemName,
        perPage: perPage,
        page: page,
      };
      const { data: response } = await getItens(storeId, payload);
      setItensState(response.data);
      setFormState({
        ...formState,
        errorMessage: '',
        total: response.total,
        loading: false
      });
    } catch (error) {
      console.log(error);
      setFormState({
        ...formState,
        errorMessage: '',
        loading: false
      });
    }
  }

  useEffect(() => {
    loadItens(debouncedItemName);
  }, [debouncedItemName, page, perPage]);

  const addOption = () => {
    setItemState({
      ...itemState,
      options: itemState.options.concat({
        name: '',
        price: ''
      })
    })
  }

  const photoUpload = e => {
    e.preventDefault();
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.onloadend = () => {
      setItemState({
        ...itemState,
        photoUri: reader.result
      });
      setFormState({
        ...formState,
        imgChanged: true,
      });
    }
    reader.readAsDataURL(file);
  }

  const handleInputChange = event => {
    setItemState({
      ...itemState,
      [event.target.name]: event.target.value
    });
  };

  const handleOptionName = (event, index) => {
    const newOptions = itemState.options;
    newOptions[index].name = event.target.value;
    setItemState({
      ...itemState,
      options: newOptions
    });
  }

  const handleOptionPrice = (event, index) => {
    const newOptions = itemState.options;
    newOptions[index].price = event.target.value;
    setItemState({
      ...itemState,
      options: newOptions
    });
  }

  const removeCurrency = (value) => value.replace('R$', '').replace('.', ',').replace(',', '.');

  const formatPrice = (event, index) => {
    const price = removeCurrency(event.target.value);
    if (index !== undefined) {
      const newOptions = itemState.options;
      newOptions[index].price = currencyFormatter.format(price);
      setItemState({
        ...itemState,
        options: newOptions
      });
    }
    else {
      const newPrice = currencyFormatter.format(price);
      setItemState({
        ...itemState,
        price: newPrice
      });
    }
  }

  const delOption = index => {
    const newOptions = itemState.options;
    newOptions.splice(index, 1);
    setItemState({
      ...itemState,
      options: newOptions
    });
  }

  const closeModal = () => {
    setFormState(initalFormState);
    setItemState(initialItemState);
    setShowModal(false);
  }

  const submitItem = async () => {
    // DELETE
    if (formState.isDeleting) {
      setFormState({
        ...formState,
        errorMessage: '',
        loading: true
      });
      try {
        await deleteItem(formState.itemId);
        const newItens = [...itensState];
        const index = newItens.findIndex(item => item._id === formState.itemId);
        newItens.splice(index, 1);
        setItensState(newItens);
        closeModal();
      } catch (error) {
        console.log(error);
        setFormState({
          ...formState,
          errorMessage: "Erro na API",
          loading: false
        });
      }
      return;
    }
    const payload = JSON.parse(JSON.stringify(itemState));
    payload.price = Number(removeCurrency(payload.price));
    if (!formState.imgChanged) {
      if (formState.itemId) {
        delete payload.photoUri;
      }
      else {
        payload.photoUri = '';
      }
    }
    payload.options.forEach(option => option.price = Number(removeCurrency(option.price)));
    // PUT
    if (formState.itemId) {
      try {
        const item = await updateItem(formState.itemId, payload);
        const newItens = [...itensState];
        const index = newItens.findIndex(item => item._id === formState.itemId);
        if (!item.data.photoUri) {
          item.data.photoUri = defaultPhoto;
        }
        newItens[index] = item.data;
        setItensState(newItens);
        closeModal();
      } catch (error) {
        console.log(error);
        setFormState({
          ...formState,
          errorMessage: "Erro na API",
          loading: false
        });
      }
    }
    //POST
    else {
      const storeId = getStoreId();
      setFormState({
        ...formState,
        errorMessage: '',
        loading: true
      });
      try {
        const item = await createItem(storeId, payload);
        const newItens = [...itensState];
        setItensState(newItens.concat(item.data));
        closeModal();
      } catch (error) {
        setFormState({
          ...formState,
          errorMessage: "Erro na API",
          loading: false
        });
      }
    }
  }

  const setItemCurrency = (item) => {
    item.price = currencyFormatter.format(item.price);
    item.options = item.options.map(opt => {
      return {
        name: opt.name,
        price: currencyFormatter.format(opt.price)
      }
    });
  }

  const handleViewItem = index => {
    const item = { ...itensState[index] };
    setItemCurrency(item);
    setFormState({
      ...formState,
      itemId: item._id,
      index: index,
      readOnly: true
    });
    setItemState(item);
    setShowModal(true);
  }

  const handleAddItem = () => setShowModal(true);

  const handleEditItem = index => {
    const item = { ...itensState[index] };
    setItemCurrency(item);
    setFormState({
      ...formState,
      index: index,
      itemId: item._id
    });
    setItemState(item);
    setShowModal(true);
  }

  const handleDeleteItem = index => {
    const item = itensState[index];
    setFormState({
      ...formState,
      isDeleting: true,
      index: index,
      itemId: item._id
    });
    setItemState(item);
    setShowModal(true);
  }

  const modalHandler = () =>
    !formState.isDeleting ?
      <Modal
        onCancel={closeModal}
        onConfirm={!formState.readOnly && submitItem}
      >
        <form>
          <h2>{formState.readOnly ? 'Visualizar Item' : formState.itemId ? 'Editar Item' : 'Adicionar Item'}</h2>

          <div className="align-photo">
            <label htmlFor="photoUri">
              <div style={{ marginBottom: '6px' }}>
                Foto
              </div>
              <div className="custom-file-upload">
                <div className={`img-wrap img-upload ${formState.readOnly ? '' : 'img-upload-hover'}`} >
                  <img htmlFor="photoUri" src={showImageOrDefault(itemState.photoUri)} alt="Foto do item" />
                </div>
                <input disabled={formState.readOnly}
                  className="input-manage"
                  id="photoUri"
                  type="file"
                  onChange={photoUpload} />
              </div>
            </label>
          </div>
          <br />
          <label htmlFor="product-name">
            Nome
            <input disabled={formState.readOnly}
              className="input-manage"
              type="text"
              value={itemState.name}
              onChange={handleInputChange}
              name="name"
              id="name"
              placeholder="Insira o nome..."
            />
          </label>
          <br />
          <label htmlFor="price">
            Preço
            <input disabled={formState.readOnly}
              className="input-manage"
              type="text"
              value={itemState.price}
              onBlur={formatPrice}
              onChange={handleInputChange}
              name="price"
              id="price"
              placeholder="Insira o preço..."
            />
          </label>
          <br />
          <label htmlFor="description">
            Descrição
            <input disabled={formState.readOnly}
              className="input-manage"
              type="text"
              value={itemState.description}
              onChange={handleInputChange}
              name="description"
              id="description"
              placeholder="Insira uma descrição..."
            />
          </label>
          <br />
          <label htmlFor="options">
            Opções
            <br /><br />
            {itemState.options && itemState.options.map((option, i) => (
              <div key={i + 1} className="option-div">
                <div className="option-fields">
                  Nome
                  <input disabled={formState.readOnly}
                    className="input-manage"
                    style={{ width: '110%' }}
                    type="text"
                    value={option.name}
                    onChange={(e) => handleOptionName(e, i)}
                    name={`option-name-${i}`}
                    id={`option-name-${i}`}
                    placeholder="Insira a opção..."
                  />
                </div>
                <div className="option-fields">
                  Preço
                  <input disabled={formState.readOnly}
                    className="input-manage"
                    style={{ width: '60%' }}
                    type="text"
                    value={option.price}
                    onBlur={(e) => formatPrice(e, i)}
                    onChange={(e) => handleOptionPrice(e, i)}
                    name={`option-price-${i}`}
                    id={`option-price-${i}`}
                    placeholder="Insira o preço..."
                  />
                </div>
                {!formState.readOnly &&
                  <button
                    type="button"
                    className="circular-button-del"
                    onClick={() => delOption(i)}>
                  </button>}
              </div>
            ))}
            {!formState.readOnly &&
              <button
                type="button"
                className="circular-button-add"
                onClick={addOption}>
              </button>}
          </label>
          {formState.errorMessage && (
            <><br /><span className="form-error">{formState.errorMessage}</span></>
          )}
        </form>

      </Modal> :
      <Modal
        onCancel={closeModal}
        onConfirm={submitItem}
      >
        <h2>Deseja realmente deletar o item:</h2>
        <h2>{itemState.name} ?</h2>
      </Modal>;
  ;

  const showImageOrDefault = (image) => image && image.startsWith("data:image") ? image : defaultPhoto

  const pageCount = Math.ceil(formState.total / perPage) || 1;

  return (
    <>
      <Loader
        type="Puff"
        color="#00BFFF"
        className="loader"
        height={100}
        width={100}
        visible={formState.loading}
      />
      <div className="container-manage" >
        <h1>Produtos</h1>
        <div className="item-menu">
          <div className="search-item">
            <input
              type="text"
              value={itemName}
              onChange={({ target }) => setItemName(target.value)}
              id='item-name'
              placeholder="Procure o item por nome..."
              name='item-name'
            />
          </div>
          <button style={{ margin: 0, height: '44px' }}
            className="btn add-item-btn item-btn"
            onClick={handleAddItem}>Adicionar Item</button>
        </div>
        <table className="table-striped" cellSpacing="0" cellPadding="0">
          <thead>
            <tr>
              <th style={{ width: '15%' }}></th>
              <th style={{ width: '75%' }}></th>
              <th style={{ width: '20%' }}></th>
            </tr>
          </thead>
          <tbody>
            {itensState && itensState.map((item, index) =>
              <tr className="row-item" key={index + 1}>
                <td>
                  <img alt="Foto do item" className="img-preview" src={showImageOrDefault(item.photoUri)} />
                </td>
                <td style={{ cursor: 'pointer' }} onClick={() => handleViewItem(index)}>
                  <h3 style={{ marginTop: '0px' }}>{item.name} - {currencyFormatter.format(item.price)}</h3>
                  <p className="description-item">{item.description}</p>
                </td>
                <td style={{ whiteSpace: "nowrap", paddingTop: "2.4em" }}>
                  <button style={{ marginRight: '8px' }}
                    onClick={() => handleEditItem(index)} className="btn item-btn edit-item-btn" disabled={item.isDeleting}>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteItem(index)} className="btn item-btn del-item-btn" disabled={item.isDeleting}>
                    Deletar
                  </button>
                </td>
              </tr>
            )}
            {!itensState &&
              <tr>
                <td colSpan="4" className="text-center">
                  <div className="spinner-border spinner-border-lg align-center"></div>
                </td>
              </tr>
            }
            {itensState && !itensState.length &&
              <tr>
                <td colSpan="4" className="text-center">
                  <div style={{ textAlign: 'center' }}>Nenhum item cadastrado até o momento...</div>
                </td>
              </tr>
            }
          </tbody>
        </table>
        <div style={{ display: 'inline-flex' }}>
          <div>
            <span>Por página:</span>
            <div style={{ marginTop: '6px', textAlign: '-webkit-right' }}>
              <select id="perPage" style={{ width: '6em' }}
                onChange={({ target }) => setPerPage(target.value)}
                value={perPage}>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>
          </div>
          <ReactPaginate
            previousLabel={"< Voltar"}
            nextLabel={"Seguinte >"}
            pageCount={pageCount}
            onPageChange={({ selected }) => setPage(selected + 1)}
            containerClassName={"pagination"}
            previousLinkClassName={"pagination__link"}
            nextLinkClassName={"pagination__link"}
            disabledClassName={"pagination__link--disabled"}
            activeClassName={"pagination__link--active"}
          />
        </div>
        {showModal && modalHandler()}
      </div>
    </>
  );
};

export default Manage;