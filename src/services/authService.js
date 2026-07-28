import api from "./api";

/*
==================================================================
  AUTH SERVICE — auth flow er baki API gulo (Redux slice er baire)
==================================================================
  Login / register / verify / me / logout — egulo Redux authSlice e
  ache (karon user state pura app e lage). Ekhane sudhu sei gulo
  jegulo one-off: password change / forgot / reset / OTP resend.
  Convention onujayi: cross-cutting state -> Redux, baki -> services/*
==================================================================
*/

// Logged-in user nijer profile (name / contactNumber / image) update kore.
// payload FormData hole (image thakle) multipart hishebe pathai, na hole plain JSON।
export const updateProfile = async (payload) => {
    const isFormData = payload instanceof FormData;
    const res = await api.patch("/auth/me", payload, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return res.data?.data;
};

// Logged-in user nijer password change kore (currentPassword lage).
// Backend notun token cookie te boshiye dey.
export const changePassword = async ({ currentPassword, newPassword }) => {
    const res = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
    });
    return res.data?.data;
};

// Password bhule gele — email dile OTP pathay.
export const forgetPassword = async (email) => {
    const res = await api.post("/auth/forget-password", { email });
    return res.data;
};

// OTP + notun password diye reset kore.
export const resetPassword = async ({ email, otp, newPassword }) => {
    const res = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
    });
    return res.data;
};

// Email verify er OTP abar pathay (VerifyEmail page e "Resend" button).
export const resendVerificationOtp = async (email) => {
    const res = await api.post("/auth/resend-verification-otp", { email });
    return res.data;
};

// Password reset er OTP abar pathay (Reset page e "Resend" button).
export const resendPasswordResetOtp = async (email) => {
    const res = await api.post("/auth/resend-password-reset-otp", { email });
    return res.data;
};

// Logged-in user nijer account deactivate (soft-delete) kore।
// Backend session muche day + cookie clear kore — er por user logged out।
export const deactivateAccount = async () => {
    const res = await api.post("/auth/deactivate");
    return res.data;
};

// Google login — server-side redirect flow. XHR na, tai full-page navigation.
// redirect param diye login shese kothay firbe seta bola jay.
// VITE_API_BASE_PATH (same-origin, vercel.json rewrite diye backend e proxy hoy) —
// VITE_API_URL (backend er real domain) dile googleLoginSuccess er Set-Cookie
// backend domain e boshe jeto, frontend e na ashay abar /login e fere ashto।
export const googleLoginUrl = (redirect = "/") => {
    const base = import.meta.env.VITE_API_BASE_PATH;
    return `${base}/auth/login/google?redirect=${encodeURIComponent(redirect)}`;
};
