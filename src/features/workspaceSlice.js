import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

/*
==================================================================
  WORKSPACE SLICE — Hybrid approach
==================================================================

  Redux এ শুধু ২টা জিনিস রাখছি (কারণ এগুলো Sidebar, Dropdown,
  Gate — অনেক জায়গায় লাগে):
    1. workspaces        → user এর সব workspace (list)
    2. currentWorkspace  → এখন কোনটা active

  create/invite এর form গুলো পেজে useState দিয়ে হবে — Redux এ না।

  Flow: login → fetchMyWorkspaces() → list পেলে current সেট হয়
==================================================================
*/

const initialState = {
    workspaces: [],          // GET /workspaces/my-workspaces থেকে
    currentWorkspace: null,  // এখন যেটা খোলা
    loading: false,          // list fetch চলছে কিনা
    fetched: false,          // একবার fetch হয়েছে কিনা (Gate এর জন্য)
    error: null,
};

// localStorage এ আগের active workspace এর id (refresh এর পরও মনে থাকে)
const savedWorkspaceId = localStorage.getItem("currentWorkspaceId");

// --- আমার সব workspace আনা (নিজের বানানো + join করা) ---
export const fetchMyWorkspaces = createAsyncThunk(
    "workspace/fetchMyWorkspaces",
    async (_, thunkAPI) => {
        try {
            const res = await api.get("/workspaces/my-workspaces");
            // backend response shape এ ভিন্নতা হতে পারে, তাই কয়েকভাবে খুঁজি
            return res.data?.data || res.data || [];
        } catch (err) {
            const message = err.response?.data?.message || "Failed to load workspaces";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// --- নতুন workspace বানানো (multipart/form-data — image থাকতে পারে) ---
export const createWorkspace = createAsyncThunk(
    "workspace/createWorkspace",
    async (formData, thunkAPI) => {
        try {
            // formData = FormData instance (name, description, image?)
            const res = await api.post("/workspaces", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data?.data || res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to create workspace";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        // dropdown থেকে workspace switch করা
        setCurrentWorkspace: (state, action) => {
            const ws = state.workspaces.find((w) => w.id === action.payload);
            if (ws) {
                state.currentWorkspace = ws;
                localStorage.setItem("currentWorkspaceId", ws.id);
            }
        },

        // NOTE: নিচের দুটো এখনো ProjectTasks.jsx এর dummy flow ব্যবহার করে।
        // পরে ঐ component backend এর সাথে যুক্ত হলে এগুলো সরিয়ে দেওয়া যাবে।
        // currentWorkspace.projects থাকলে তবেই কাজ করে (defensive)।
        updateTask: (state, action) => {
            const projects = state.currentWorkspace?.projects;
            if (!Array.isArray(projects)) return;
            projects.forEach((p) => {
                if (p.id === action.payload.projectId && Array.isArray(p.tasks)) {
                    p.tasks = p.tasks.map((t) =>
                        t.id === action.payload.id ? action.payload : t
                    );
                }
            });
        },
        deleteTask: (state, action) => {
            const projects = state.currentWorkspace?.projects;
            if (!Array.isArray(projects)) return;
            projects.forEach((p) => {
                if (Array.isArray(p.tasks)) {
                    p.tasks = p.tasks.filter((t) => !action.payload.includes(t.id));
                }
            });
        },
    },
    extraReducers: (builder) => {
        builder
            // ---- fetchMyWorkspaces ----
            .addCase(fetchMyWorkspaces.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyWorkspaces.fulfilled, (state, action) => {
                state.loading = false;
                state.fetched = true;
                state.workspaces = action.payload;

                // current কোনটা হবে ঠিক করি:
                // ১) আগে সেভ করা id থাকলে সেটা, নইলে ২) প্রথমটা
                if (action.payload.length > 0) {
                    const saved = action.payload.find((w) => w.id === savedWorkspaceId);
                    state.currentWorkspace = saved || action.payload[0];
                    localStorage.setItem("currentWorkspaceId", state.currentWorkspace.id);
                } else {
                    state.currentWorkspace = null;
                }
            })
            .addCase(fetchMyWorkspaces.rejected, (state, action) => {
                state.loading = false;
                state.fetched = true;
                state.error = action.payload;
            })

            // ---- createWorkspace ----
            .addCase(createWorkspace.fulfilled, (state, action) => {
                // নতুনটা list এ যোগ করি + সেটাকেই active বানাই
                state.workspaces.push(action.payload);
                state.currentWorkspace = action.payload;
                localStorage.setItem("currentWorkspaceId", action.payload.id);
            });
    },
});

export const { setCurrentWorkspace, updateTask, deleteTask } = workspaceSlice.actions;
export default workspaceSlice.reducer;
