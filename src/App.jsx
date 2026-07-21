import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ChangePassword from "./pages/auth/ChangePassword";
import Profile from "./pages/auth/Profile";
import CreateWorkspace from "./pages/workspace/CreateWorkspace";
import Invitations from "./pages/workspace/Invitations";
import AcceptInvitation from "./pages/workspace/AcceptInvitation";
import ProtectedRoute from "./components/ProtectedRoute";
import WorkspaceGate from "./components/WorkspaceGate";

const App = () => {
    return (
        <>
            <Toaster />
            <Routes>
                {/* Public routes — login ছাড়াই ঢোকা যায় */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* email এর link এখানে আসে। এটা PUBLIC — কারণ যাকে invite করা
                    হয়েছে তার account নাও থাকতে পারে। পেজ নিজে ঠিক করে:
                    logged in → auto accept | account নেই → register এ পাঠায়
                    | account আছে কিন্তু logged out → login এ পাঠায়।
                    (email আর from সাথে নিয়ে, যাতে শেষে আবার এখানে ফেরত আসে) */}
                <Route path="/invitations/accept" element={<AcceptInvitation />} />

                {/* Protected — login লাগবে।
                    ProtectedRoute পাহারা দেয় (user আছে কিনা)। */}
                <Route element={<ProtectedRoute />}>
                    {/* এই দুটো পেজ workspace ছাড়াই দেখা যায়
                        (কারণ এখান থেকেই workspace বানানো/join হয়) */}
                    <Route path="/workspace/create" element={<CreateWorkspace />} />
                    <Route path="/invitations" element={<Invitations />} />
                    {/* profile + password — login lage, kintu workspace lage na */}
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/change-password" element={<ChangePassword />} />

                    {/* WorkspaceGate পাহারা দেয় (workspace আছে কিনা)।
                        না থাকলে create/invitations এ পাঠায়। */}
                    <Route element={<WorkspaceGate />}>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="team" element={<Team />} />
                            <Route path="projects" element={<Projects />} />
                            <Route path="projectsDetail" element={<ProjectDetails />} />
                            <Route path="taskDetails" element={<TaskDetails />} />
                        </Route>
                    </Route>
                </Route>
            </Routes>
        </>
    );
};

export default App;
