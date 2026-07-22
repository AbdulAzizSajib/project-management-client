import api from "./api";

// Global search — current user er workspace er moddhe project + task khoje।
// return: { projects: [...], tasks: [...] }
export const globalSearch = async (query) => {
    const res = await api.get("/search", { params: { q: query } });
    return res.data?.data || { projects: [], tasks: [] };
};
