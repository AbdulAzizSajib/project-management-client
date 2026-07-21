import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

/*
==================================================================
  REDUX AUTH SLICE — সহজ ব্যাখ্যা
==================================================================

  Redux = পুরো অ্যাপের একটা "global box"। এখানে user login আছে কিনা
  সেই তথ্য রাখব, যাতে যেকোনো component (Navbar, ProtectedRoute...)
  সহজে জানতে পারে।

  এই ফাইলে ৩টা জিনিস:
  1. initialState  → box এর শুরুর অবস্থা
  2. Thunk         → API কল করে এমন function (createAsyncThunk)
  3. Slice         → thunk এর result দিয়ে box আপডেট করার নিয়ম

  Flow:  dispatch(loginUser(...))  →  thunk API কল করে  →
         result দিয়ে state আপডেট  →  useSelector দিয়ে component পড়ে
==================================================================
*/

// ১) box এর শুরুর অবস্থা
const initialState = {
    user: null,        // কে logged in আছে। null = কেউ না।
    loading: false,    // API কল চলছে কিনা (button spinner দেখাতে)
    error: null,       // কোনো ভুল হলে message
    authChecked: false // app শুরুতে "আমি কে?" check শেষ হয়েছে কিনা
};

/*
  createAsyncThunk = এমন একটা function যা API কল (async কাজ) করে।
  প্রতিটা thunk নিজে থেকে ৩টা অবস্থা তৈরি করে:
    - pending   → কল শুরু হয়েছে (loading = true)
    - fulfilled → সফল হয়েছে (data পেয়েছি)
    - rejected  → ভুল হয়েছে (error)
  এই ৩টা নিচের extraReducers এ handle করা হয়।
*/

// --- Register: নতুন account বানায় ---
export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async (formData, thunkAPI) => {
        try {
            // formData = { name, email, password, contactNumber }
            const res = await api.post("/auth/register", formData);
            return res.data; // সফল হলে এটা fulfilled এ যায়
        } catch (err) {
            // ভুল হলে backend এর message টা তুলে নিই
            const message = err.response?.data?.message || "Registration failed";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// --- Verify Email: OTP দিয়ে email verify ---
export const verifyEmail = createAsyncThunk(
    "auth/verifyEmail",
    async (formData, thunkAPI) => {
        try {
            // formData = { email, otp }
            const res = await api.post("/auth/verify-email", formData);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Verification failed";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// --- Login: email + password দিয়ে ঢোকা ---
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (formData, thunkAPI) => {
        try {
            // formData = { email, password }
            const res = await api.post("/auth/login", formData);
            // backend এর response এর ভেতরে user থাকে: data.user
            return res.data?.data?.user || res.data?.data || res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Login failed";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// --- fetchMe: "আমি এখন কে?" — page refresh এর পর দরকার ---
// cookie browser এ আছেই, তাই এই কল সফল হলে বুঝি user এখনো logged in।
export const fetchMe = createAsyncThunk(
    "auth/fetchMe",
    async (_, thunkAPI) => {
        try {
            const res = await api.get("/auth/me");
            return res.data?.data?.user || res.data?.data || res.data;
        } catch (err) {
            // 401 মানে logged in না — এটা কোনো "ভুল" না, স্বাভাবিক।
            return thunkAPI.rejectWithValue(null);
        }
    }
);

// --- Logout: বেরিয়ে যাওয়া ---
export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async (_, thunkAPI) => {
        try {
            await api.post("/auth/logout");
            return true;
        } catch (err) {
            const message = err.response?.data?.message || "Logout failed";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// ৩) Slice = state আপডেট করার নিয়মের সেট
const authSlice = createSlice({
    name: "auth",
    initialState,
    // সাধারণ (non-API) আপডেট এখানে:
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        // profile update howar por Redux er user ke ejate refresh kori
        // (Navbar / onno jaygay notun name/image sathe sathe dekhabe)।
        setUser: (state, action) => {
            state.user = action.payload;
        },
        // refresh-token o fail korle interceptor eta dispatch kore —
        // API call na kore just local user state clear kore (session already dead)।
        forceLogout: (state) => {
            state.user = null;
            state.error = null;
        }
    },
    // API thunk গুলোর result এখানে handle হয়:
    extraReducers: (builder) => {
        builder
            // ---- Register ----
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
                // register এর পর এখনো login হয় না (আগে OTP verify লাগবে),
                // তাই user সেট করি না।
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ---- Verify Email ----
            .addCase(verifyEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyEmail.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(verifyEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ---- Login ----
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload; // ⭐ box এ user বসল = logged in
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ---- fetchMe (app শুরুতে) ----
            .addCase(fetchMe.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload; // cookie valid → user ফিরে পেলাম
                state.authChecked = true;
            })
            .addCase(fetchMe.rejected, (state) => {
                state.loading = false;
                state.user = null;           // logged in না
                state.authChecked = true;
            })

            // ---- Logout ----
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;           // box খালি = logged out
            });
    }
});

export const { clearError, forceLogout, setUser } = authSlice.actions;
export default authSlice.reducer;
