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

export default api;
