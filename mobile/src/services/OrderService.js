import GenericService from "./GenericService";

export const createOrder = async (storeId, payload) => {
  return await GenericService(`/store/${storeId}/order`, "POST", payload);
}

export const getUserOrders = async (userId, params) => {
  return await GenericService(`/user/${userId}/order`, "GET", params);
}

export const userUpdateOrder = async (orderId, body) => {
  return await GenericService(`/user/order/${orderId}`, "PUT", body);
}

export const getOrderDetails = async (params) => {
  return await GenericService(`/order/details`, "POST", params);
}