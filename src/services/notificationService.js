import api from "./api";

/*
==================================================================
  NOTIFICATION SERVICES (Redux ছাড়া — শুধু Navbar এর bell এ লাগে)
==================================================================
  NotificationBell এ useState দিয়ে রাখা হয়।

  ⚠️ backend contract:
    - GET /notifications → data = { notifications: [], unreadCount: n }
      (flat array নয়!)
    - প্রতিটা notification এ: id, title, message, type, isRead,
      entityId (nullable), createdAt
    - read flag = isRead (read নয়)
==================================================================
*/

// সব notification + unread count
export const getNotifications = () =>
    api.get("/notifications").then((r) => r.data?.data || { notifications: [], unreadCount: 0 });

// একটা read
export const markAsRead = (id) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data);

// সব read
export const markAllAsRead = () =>
    api.patch("/notifications/read-all").then((r) => r.data);

// একটা মুছা
export const deleteNotification = (id) =>
    api.delete(`/notifications/${id}`).then((r) => r.data);
