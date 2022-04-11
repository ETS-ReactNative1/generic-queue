import GenericService from "./GenericService";

export const getItens = async (storeId, params) => {
    return await GenericService(`/store/${storeId}/item`, "GET", params);
}

export const getImages = async (body) => {
    return await GenericService('/item/images', "POST", body)
}

export const createItem = async (storeId, body) => {
    return await GenericService(`/store/${storeId}/item`, "POST", body);
}

export const updateItem = async (id, body) => {
    return await GenericService(`/item/${id}`, "PUT", body);
}

export const deleteItem = async (id) => {
    return await GenericService(`/item/${id}`, "DELETE");
}