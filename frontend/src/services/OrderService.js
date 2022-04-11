import GenericService from "./GenericService";

export const getOrder = async (orderId) => {
    return GenericService(`/order/${orderId}`, "GET");
}

export const createOrder = async (body) => {
    return GenericService("/order", "POST", body);
}

export const storeUpdateOrder = async (orderId, body) => {
    return await GenericService(`/store/order/${orderId}`, "PUT", body);
}

export const getStoreOrders = async (storeId, params) => {
    return await GenericService(`/store/${storeId}/order`, "GET", params);
}