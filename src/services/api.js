import axios from "axios";

// পুরো অ্যাপের জন্য একটাই axios instance।
// এখানে base URL আর cookie সেটিং একবার দিলে,
// সব জায়গায় শুধু api.post("/auth/login") এভাবে ছোট করে লেখা যায়।
const api = axios.create({
    // .env থেকে আসছে: http://localhost:5000 + /api/v1
    baseURL: import.meta.env.VITE_API_URL + "/api/v1",

    // ⭐ সবচেয়ে গুরুত্বপূর্ণ লাইন:
    // withCredentials: true দিলে প্রতিটা request এর সাথে
    // browser এর cookie (login token) নিজে থেকে চলে যায়।
    // এটাই cookie দিয়ে auth করার মূল চাবি।
    withCredentials: true,
});

/*
==================================================================
  REFRESH TOKEN INTERCEPTOR — session hothat break howa atkay
==================================================================
  Access token er meyad furale server 401 dey. Sei muhurte:
    1) ekbar /auth/refresh-token call kori (refreshToken cookie theke
       server notun accessToken cookie boshiye dey — body pathate hoy na)।
    2) refresh success hole je request 401 kheyeche seta abar chalai।
    3) refresh o fail korle (refresh token o expired) — sotti logged out।
       tokhon logout dispatch kore /login e pathai।

  Ek shathe onek 401 ele barbar refresh na kore, prothom refresh ta
  cholte thakleo baki request gulo sei promise er jonno wait kore
  (isRefreshing + queue)।
==================================================================
*/

let isRefreshing = false;
let pendingQueue = []; // refresh cholakalin je request gulo atke ache

// refresh shesh hole atke thaka request gulo ke chere day (ba fail koray)
const flushQueue = (error) => {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve();
    });
    pendingQueue = [];
};

// store ke lazy import kori — circular import (store -> slice -> api -> store)
// atkate. shudhu dorkar porle load hoy।
let logoutHandler = null;
export const registerAuthFailureHandler = (fn) => {
    logoutHandler = fn;
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        // refresh-token call nijei 401 dile — ar refresh korar chesta korbo na,
        // nahole infinite loop hobe. eta sotti session shesh.
        const isRefreshCall = originalRequest?.url?.includes(
            "/auth/refresh-token",
        );

        if (status !== 401 || originalRequest?._retry || isRefreshCall) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        // onno kono refresh already cholche — sei ta shesh hole retry kori
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingQueue.push({ resolve, reject });
            })
                .then(() => api(originalRequest))
                .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
            await api.post("/auth/refresh-token");
            flushQueue(null); // sob atke thaka request ke chere dilam
            return api(originalRequest); // je request 401 kheyechilo — abar
        } catch (refreshError) {
            flushQueue(refreshError);
            // refresh o fail — sotti logged out. Redux clear + login e pathai.
            if (logoutHandler) logoutHandler();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);

export default api;
