import GenericService from "./GenericService";

export const getItens = async (id, params) => {
    return await GenericService(`/store/${id}/item`, "GET", params);
}

