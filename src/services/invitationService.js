import api from "./api";

/*
==================================================================
  INVITATION SERVICES (Redux ছাড়া — Gate + Invitations পেজে লাগে)
==================================================================
  পেজে useState দিয়ে রাখো।

  ⚠️ backend contract (নিশ্চিত):
    - GET /invitations → প্রতিটা invite এ: id, email, token, role,
      status (PENDING|ACCEPTED|REJECTED|EXPIRED), workspace {id,name,slug},
      inviter {id,name,email}
    - accept এ token লাগে (body তে) — invite object এ token আসে
    - reject এ শুধু id
==================================================================
*/

// ---- invitation details by token (PUBLIC — login ছাড়াই কাজ করে) ----
// email এর link এ click করলে account নেই / logged out user ও এটা দিয়ে
// জানতে পারে: কোন workspace, কোন email, account আছে কিনা, expired কিনা।
// ফেরত: { id, email, role, status, expiresAt, isExpired,
//         workspace{id,name,slug}, inviterName, hasAccount }
export const getInvitationByToken = (token) =>
    api
        .get("/invitations/details", { params: { token } })
        .then((r) => r.data?.data);

// ---- আমার সব invitation (পাঠানো + পাওয়া) ----
export const getMyInvitations = () =>
    api.get("/invitations").then((r) => r.data?.data || []);

// ---- accept (token লাগে) ----
export const acceptInvitation = (id, token) =>
    api.post(`/invitations/${id}/accept`, { token }).then((r) => r.data?.data);

// ---- reject (শুধু id) ----
export const rejectInvitation = (id) =>
    api.post(`/invitations/${id}/reject`).then((r) => r.data?.data);

// ---- delete (inviter/admin) ----
export const deleteInvitation = (id) =>
    api.delete(`/invitations/${id}`).then((r) => r.data);
