import React, { useState, useEffect } from 'react';
import { useTitle } from 'hookrouter';
import Modal from '../../components/modal';
import { getStoreId } from '../../hooks/auth';
import Loader from "react-loader-spinner";
import ReactPaginate from "react-paginate";

import './index.css';
import { getStoreOrders, storeUpdateOrder } from '../../services/OrderService';
import { getStoreStatus } from '../../services/StoreService';
import useInterval from '../../utils/useInterval';

const Home = () => {
  useTitle('Gerenciar Pedidos');

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const initalFormState = {
    loading: false,
    isCanceling: false,
    isConfirming: false,
    isChanging: false,
    errorMessage: '',
  };

  const storeId = getStoreId();
  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState(initalFormState);
  const [orderState, setOrderState] = useState([]);
  const [orders, setOrders] = useState([]);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState({});
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  const formatDate = (dateStr) => (new Date(dateStr))
    .toLocaleString('pt-BR').split(" ").reverse().join(" ");

  const getSituacionStr = (order) => order.isCanceled ? "Cancelado" :
    order.isPaid ? "Pago" :
      order.userConfirmedPayment ? "Cliente Confirmou o Pagamento" :
        "Não Pago"

  const formatItens = (order) => order.cart.map(({ item, optionsId, qtd }, idx) => (
    <p key={`option-${idx + 1}`}>
      {qtd}X {item.name} {optionsId.length ?
        `(${optionsId.map(({ name }) => name).join(", ")})` : ""}
    </p>
  ))

  const formatAddress = (address) =>
    `${address.street}, ${address.number}
    ${address.neighborhood}, ${address.city} - ${address.state}`

  const concatEqualItens = (orders) => {
    const checkOptions = (options, nextOptions) => {
      return options.length === nextOptions.length &&
        options.every((optId, idx) => optId._id === nextOptions[idx]._id)
    }
    for (let odrIdx = 0; odrIdx < orders.length; odrIdx++) {
      const order = orders[odrIdx];
      const newCart = [];
      for (let crtIdx = 0; crtIdx < order.cart.length; crtIdx++) {
        const cartItem = order.cart[crtIdx];
        const newCartItem = {
          _id: cartItem._id,
          item: cartItem.item,
          optionsId: cartItem.optionsId,
          qtd: 1,
        }
        for (let i = crtIdx + 1; i < order.cart.length; i++) {
          const nextCartItem = order.cart[i];
          if (newCartItem.item._id === nextCartItem.item._id &&
            checkOptions(newCartItem.optionsId, nextCartItem.optionsId)) {
            order.cart.splice(i, 1);
            newCartItem.qtd += 1;
          }
        }
        newCart.push(newCartItem);
      }
      orders[odrIdx].cart = newCart;
    }
  }

  const loadOrders = async () => {
    setFormState({
      ...formState,
      errorMessage: '',
      loading: true
    });
    try {
      const payload = {
        perPage: perPage,
        page: page,
      };
      const { data: response } = await getStoreOrders(storeId, payload);
      const orders = response.data;
      concatEqualItens(orders);
      setOrders(orders);
      setFormState({
        ...formState,
        errorMessage: '',
        loading: false
      });
      setTotal(response.total);
    } catch (error) {
      console.log(error);
      setFormState({
        ...formState,
        errorMessage: `${error}`,
        loading: false
      });
    }
  }

  const stopInterval = useInterval(loadOrders, 10000);

  const loadStatus = async () => {
    try {
      const response = await getStoreStatus(storeId);
      setStatus(response.data);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    loadStatus();
    loadOrders();
  }, [page, perPage]);

  const handleUpdate = async (payload) => {
    try {
      setFormState({
        ...formState,
        loading: true,
        errorMessage: ''
      });
      await storeUpdateOrder(orderState, payload);
      let idx;
      for (idx = 0; idx < orders.length && orders[idx]._id !== orderState; idx++);
      const newOrders = [...orders];
      const key = Object.keys(payload)[0];
      if (key === "status") {
        const { _id, value, ...sts } = status.find(sts => sts._id === payload.status);
        newOrders[idx]["status"] = { _id, value };
      }
      else {
        newOrders[idx][key] = true;
      }
      setOrders(newOrders);
      setFormState({
        ...formState,
        loading: false,
      });
      setShowModal(false);
    } catch (error) {
      setFormState({
        ...formState,
        loading: false,
        errorMessage: error
      })
      console.log(error);
    }
  }

  const handleChangeStatus = async (status, value) => {
    const order = orders.find(ord => ord._id === orderState);
    if (order.status.value === value) {
      setFormState({
        ...formState,
        errorMessage: 'Não é possível alterar para o estado atual'
      })
      return;
    }
    const payload = { status };
    await handleUpdate(payload);
  }

  const handleCancelOrder = async () => {
    const payload = {
      isCanceled: true
    };
    await handleUpdate(payload);
  }

  const handleConfirmPayment = async () => {
    const payload = {
      isPaid: true
    };
    await handleUpdate(payload);
  }

  const modalHandler = () =>
    formState.isConfirming ?
      <Modal
        onCancel={() => setShowModal(false)}
        onConfirm={handleConfirmPayment}
        errorMessage={formState.errorMessage}
      >
        <h2>Deseja Realmente Confirmar o Pagamento?</h2>
      </Modal>
      :
      formState.isCanceling ?
        <Modal
          onCancel={() => setShowModal(false)}
          onConfirm={handleCancelOrder}
          errorMessage={formState.errorMessage}
        >
          <h2>Deseja Realmente Cancelar o Pedido?</h2>
        </Modal>
        :
        formState.isChanging ?
          <Modal
            onCancel={() => setShowModal(false)}
            errorMessage={formState.errorMessage}
          >
            <h2>Selecione Qual Estado Deseja Mover o Pedido</h2>
            {status.map(({ value, _id }, idx) => (
              <button
                className="btn status-btn"
                style={{ backgroundColor: 'black' }}
                onClick={() => handleChangeStatus(_id, value)}
                key={`status-${idx + 1}`}>
                {value}
              </button>
            ))}
          </Modal>
          :
          <Modal
            style={{ width: 1400, left: 'calc((100% - 82em) /2)' }}
            onCancel={() => setShowModal(false)}>
            <h2>Pedido</h2>
            <div className="break-apart">
              <span className="span-modal">
                <b>Total: </b>{"\n"}
                {currencyFormatter.format(orderState.total)}
              </span>
              <span>
                <b>Data de Pedido: </b>{"\n"}
                {formatDate(orderState.createdAt)}
              </span>
              <span className="span-modal">
                <b>Data Última Atualização: </b>{"\n"}
                {formatDate(orderState.updatedAt)}
              </span>
            </div>
            <div className="break-apart">
              <span className="span-modal">
                <b>Status: </b>{"\n"}
                {orderState.status.value}
              </span>
              <span className="span-modal">
                <b>Situação:</b>{"\n"}
                {getSituacionStr(orderState)}
              </span>
              <span className="span-modal">
                <b>Detalhes: </b>{"\n"}
                {orderState.description}
              </span>
            </div>
            <div>
              <h3>Itens</h3>
              {formatItens(orderState)}
            </div>
            <div
              style={{ marginTop: '2em' }}
              className="break-apart">
              <span className="span-modal">
                <b>Cliente: </b>{"\n"}
                {orderState.costumer.name}
              </span>
              <span>
                <b>Telefone do Cliente: </b>{"\n"}
                {orderState.costumer.phoneNumber}
              </span>
              <span className="span-modal">
                <b>Endereço do Cliente: </b>{"\n"}
                {orderState.deliveryAddress ? formatAddress(orderState.deliveryAddress) :
                  "Sem Endereço: Buscará na Loja"}
              </span>
            </div>

          </Modal>
    ;

  const pageCount = Math.ceil(total / perPage) || 1;

  const handleClick = (newOrderState, newFormState) => {
    setFormState(newFormState);
    setOrderState(newOrderState);
    setShowModal(true);
  }

  const onCancelOrder = (orderId, event) => {
    event.stopPropagation();
    handleClick(orderId, {
      ...formState,
      isCanceling: true,
      isConfirming: false,
      isChanging: false,
      errorMessage: ''
    });
  }

  const onConfirmPayment = (orderId, event) => {
    event.stopPropagation();
    handleClick(orderId, {
      ...formState,
      isCanceling: false,
      isConfirming: true,
      isChanging: false,
      errorMessage: ''
    });
  }

  const onChangeStatus = (orderId, event) => {
    event.stopPropagation();
    handleClick(orderId, {
      ...formState,
      isCanceling: false,
      isConfirming: false,
      isChanging: true,
      errorMessage: ''
    });
  }

  const onShowOrder = (order) => {
    handleClick(order, {
      ...formState,
      isCanceling: false,
      isConfirming: false,
      isChanging: false,
      errorMessage: ''
    });
  }

  const handleStopInterval = () => {
    stopInterval();
    setIsAutoRefresh(false);
  }

  return (
    <>
      {showModal && modalHandler()}
      <div>
        <Loader
          type="Puff"
          color="#00BFFF"
          className="loader"
          height={100}
          width={100}
          visible={formState.loading}
        />
      </div>
      <div className="container-manage" >
        <h1>Pedidos</h1>
        <div className='home-header-btns'>
          <button
            style={{
              backgroundColor: isAutoRefresh ? "#696969" : "grey"
            }}
            disabled={!isAutoRefresh}
            onClick={handleStopInterval}
            className="home-header-btn">
            Parar Recarregamento Automático
          </button>
          <button
            onClick={loadOrders}
            className="home-header-btn">
            Recarregar
          </button>
        </div>
        <table className="table-striped" style={{ textAlign: 'center' }} cellSpacing="0" cellPadding="0">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Data</th>
              <th style={{ width: '15%' }}>Status</th>
              <th style={{ width: '40%' }}>Pedido</th>
              <th style={{ width: '5%' }}>Total</th>
              <th style={{ width: '10%' }}>Cliente</th>
              <th style={{ width: '10%' }}>Situação</th>
              <th style={{ width: '10%' }}>Opções</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.map((order, index) => {
              const cantCacelOrder = !(!order.isCanceled
                && !order.isPaid && !order.userConfirmedPayment)
              const cantConfirmPayment = !(!order.isCanceled
                && !order.isPaid && order.userConfirmedPayment)

              return (
                <tr onClick={() => onShowOrder(order)} className="row-item" key={`order-${index + 1}`}>
                  <td>
                    <p>
                      {formatDate(order.createdAt)}
                    </p>
                  </td>
                  <td>
                    <p>{order.status.value}</p>
                  </td>
                  <td style={{ textAlign: 'left' }}>
                    {formatItens(order)}
                  </td>
                  <td>
                    <p>{currencyFormatter.format(order.total)}</p>
                  </td>
                  <td>
                    <p>{order.costumer.name}</p>
                  </td>
                  <td>
                    <p>{getSituacionStr(order)}
                    </p>
                  </td>
                  <td style={{ whiteSpace: "nowrap", paddingTop: "2.4em" }}>
                    <button
                      style={{
                        marginRight: '8px',
                        verticalAlign: 'top',
                        whiteSpace: 'pre-wrap',
                        width: 100,
                        backgroundColor: cantConfirmPayment ? "#7ec272" : "#35b821"
                      }}
                      disabled={cantConfirmPayment}
                      onClick={(e) => onConfirmPayment(order._id, e)} className="btn item-btn edit-item-btn">
                      Confirmar Pagamento
                    </button>
                    <button
                      style={{
                        marginRight: '8px',
                        verticalAlign: 'top',
                        whiteSpace: 'pre-wrap',
                        width: 60,
                        backgroundColor: order.isCanceled ? "#bda76c" : "#b89021"
                      }}
                      disabled={order.isCanceled}
                      onClick={(e) => onChangeStatus(order._id, e)} className="btn item-btn alt-item-btn">
                      Alterar Status
                    </button>
                    <button
                      style={{
                        marginRight: '8px',
                        verticalAlign: 'top',
                        whiteSpace: 'pre-wrap',
                        width: 80,
                        backgroundColor: cantCacelOrder ? "#ff8080" : "#ff3333"
                      }}
                      disabled={cantCacelOrder}
                      onClick={(e) => onCancelOrder(order._id, e)} className="btn item-btn del-item-btn">
                      Cancelar Pedido
                    </button>
                  </td>
                </tr>)
            }
            )}
            {!orders &&
              <tr>
                <td colSpan="4" className="text-center">
                  <div className="spinner-border spinner-border-lg align-center"></div>
                </td>
              </tr>
            }
            {orders && !orders.length &&
              <tr>
                <td colSpan="4" className="text-center">
                  <div style={{ textAlign: 'center' }}>Nenhum pedido feito até o momento...</div>
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

export default Home;