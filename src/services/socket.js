import { io } from "socket.io-client";

/*
==================================================================
  SOCKET.IO CLIENT — real-time comment + notification
==================================================================
  axios instance এর মতো — পুরো অ্যাপে একটাই socket connection।

  ⚠️ backend socket base URL = VITE_API_URL (api নয়, /api/v1 ছাড়া)
     কারণ socket express router এর নিচে নয়, http server এ attach করা।

  withCredentials: true → handshake এর সাথে cookie (session) যায়,
  backend সেটা verify করে (checkAuth এর মতোই)।

  autoConnect: false → login না হওয়া পর্যন্ত connect করি না।
  connectSocket() login এ, disconnectSocket() logout এ কল হয়।
==================================================================
*/
const socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    autoConnect: false,
});

// dev এ socket এর অবস্থা console এ দেখাই — connect হচ্ছে কিনা / auth fail
// কিনা সহজে বোঝা যায়। (production build এ import.meta.env.DEV = false)
if (import.meta.env.DEV) {
    socket.on("connect", () => console.log("[socket] connected:", socket.id));
    socket.on("disconnect", (reason) =>
        console.log("[socket] disconnected:", reason)
    );
    socket.on("connect_error", (err) =>
        console.warn("[socket] connect_error:", err.message)
    );
}

// login হওয়ার পর কল করি (cookie তখন set আছে)
export const connectSocket = () => {
    if (!socket.connected) socket.connect();
};

// logout এ কল করি — connection বন্ধ, room ছেড়ে দেয়
export const disconnectSocket = () => {
    if (socket.connected) socket.disconnect();
};

export default socket;
