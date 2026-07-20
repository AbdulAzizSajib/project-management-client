import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

/*
==================================================================
  PROJECT SLICE
==================================================================

  Projects অনেক জায়গায় লাগে — Dashboard stats, Projects পেজ,
  Sidebar। আর create করলে সব জায়গায় update দেখা দরকার।
  তাই Redux এ রাখছি (তোমার auth/workspace pattern এর মতোই)।

  ⚠️ backend এর my-workspaces এ projects আসে না — সেগুলো এই
  আলাদা endpoint (/projects) থেকে আনি।

  Flow: workspace select হলে → fetchProjects(workspaceId) →
        list পাই → Dashboard/Projects পেজ ভরে
==================================================================
*/

const initialState = {
    projects: [],       // current workspace এর সব project
    loading: false,
    error: null,
};

// --- current workspace এর projects আনা ---
// backend GET /projects সব workspace এর project দেয় (যেগুলোর member),
// তাই workspaceId দিয়ে ছেঁকে নিই।
export const fetchProjects = createAsyncThunk(
    "project/fetchProjects",
    async (workspaceId, thunkAPI) => {
        try {
            const res = await api.get("/projects");
            const all = res.data?.data || res.data || [];
            // শুধু এই workspace এর project রাখি
            return workspaceId
                ? all.filter((p) => p.workspaceId === workspaceId)
                : all;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to load projects";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// --- নতুন project বানানো ---
export const createProject = createAsyncThunk(
    "project/createProject",
    async (payload, thunkAPI) => {
        try {
            // payload = { name, description, status, priority, startDate,
            //             endDate, workspaceId, teamLeadId }
            const res = await api.post("/projects", payload);
            return res.data?.data || res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to create project";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const projectSlice = createSlice({
    name: "project",
    initialState,
    reducers: {
        // workspace switch করলে পুরনো list মুছে ফেলি (নতুনটা fetch হবে)
        clearProjects: (state) => {
            state.projects = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // ---- fetch ----
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ---- create ----
            .addCase(createProject.fulfilled, (state, action) => {
                state.projects.push(action.payload);
            });
    },
});

export const { clearProjects } = projectSlice.actions;
export default projectSlice.reducer;
