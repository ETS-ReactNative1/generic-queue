import GenericService from "./GenericService";

export const getStore = async (id) => {
    return await GenericService(`/store/${id}/details`, "GET");
}

export const updateStore = async (id, body) => {
    return await GenericService(`/store/${id}`, "PUT", body);
}

export const deleteStore = async (id) => {
    return await GenericService(`/store/${id}`, "DELETE");
}

export const getStoreStatus = async (id) => {
    return await GenericService(`/store/${id}/status`, "GET");
}