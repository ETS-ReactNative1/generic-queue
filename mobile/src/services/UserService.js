import GenericService from "./GenericService";

export const getUser = async (id) => {
    return await GenericService(`/user/${id}`, "GET");
}

export const updateUser = async (id, body) => {
    return await GenericService(`/user/${id}`, "PUT", body);
}

export const deleteUser = async (id) => {
    return await GenericService(`/user/${id}`, "DELETE");
}
