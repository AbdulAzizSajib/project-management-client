import { configureStore } from '@reduxjs/toolkit'
import workspaceReducer from '../features/workspaceSlice'
import themeReducer from '../features/themeSlice'
import authReducer, { forceLogout } from '../features/authSlice'
import projectReducer from '../features/projectSlice'
import { registerAuthFailureHandler } from '../services/api'

// Redux এ শুধু সেই state যা অনেক জায়গায় লাগে:
//   auth      → logged-in user (Navbar, routes সব জায়গায়)
//   workspace → list + current (Sidebar, Dropdown, Gate)
//   project   → list (Sidebar এর ২টা, Dashboard এর ৪টা, Projects পেজ)
//   theme     → dark/light (সব জায়গায়)
// বাকি সব (task, comment, member, invite, notification, dashboard)
//   → useState + services/*
export const store = configureStore({
    reducer: {
        auth: authReducer,
        workspace: workspaceReducer,
        project: projectReducer,
        theme: themeReducer,
    },
})

// api.js er refresh-token interceptor refresh o fail korle eta call kore:
// Redux theke user muche day. Redirect ta ProtectedRoute nijei kore
// (user null hole /login e pathay), tai ekhane shudhu state clear kori.
registerAuthFailureHandler(() => {
    store.dispatch(forceLogout())
})
