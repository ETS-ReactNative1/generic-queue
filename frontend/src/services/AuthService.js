import GenericService from "./GenericService";

export const login = async (body) => {
    return await GenericService("/login", "POST", body);
}

export const createStore = async (body) => {
    return await GenericService("/store", "POST", body);
}

export const validateUser = async (body) => {
    return await GenericService("/validate-user", "POST", body);
}