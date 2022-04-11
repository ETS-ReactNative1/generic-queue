import GenericService from "./GenericService";

export const searchStore = async (params) => {
    return await GenericService("/store", "GET", params);
}

export const getStore = async (id) => {
    return await GenericService(`/store/${id}`, "GET");
}

