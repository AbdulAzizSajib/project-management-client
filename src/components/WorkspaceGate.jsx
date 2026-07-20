import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import { fetchMyWorkspaces } from "../features/workspaceSlice";
import { getMyInvitations } from "../services/invitationService";

/*
==================================================================
  WORKSPACE GATE — STEP 1 এর decision logic
==================================================================

  ProtectedRoute বলেছে "user logged in" — এখন Gate ঠিক করে
  user কে কোথায় পাঠাবে:

    workspace আছে              → ভেতরে ঢুকতে দাও (Dashboard etc.)
    নেই, কিন্তু pending invite  → /invitations এ পাঠাও
    নেই, invite ও নেই          → /workspace/create এ পাঠাও

  - workspace list → Redux (Sidebar/Dropdown এও লাগে)
  - invitations → শুধু এখানে লাগে, তাই useState (Redux না)
==================================================================
*/
const WorkspaceGate = () => {
    const dispatch = useDispatch();
    const location = useLocation();

    // workspace list Redux থেকে
    const { workspaces, fetched: wsFetched, loading: wsLoading } = useSelector(
        (state) => state.workspace
    );

    // invitation শুধু এখানে লাগে — local state
    const [invitations, setInvitations] = useState([]);
    const [invFetched, setInvFetched] = useState(false);

    // login এর পর দুটো একসাথে আনি (parallel)
    useEffect(() => {
        if (!wsFetched) dispatch(fetchMyWorkspaces());
    }, [dispatch, wsFetched]);

    useEffect(() => {
        getMyInvitations()
            .then(setInvitations)
            .catch(() => setInvitations([]))
            .finally(() => setInvFetched(true));
    }, []);

    // দুটো fetch শেষ না হওয়া পর্যন্ত spinner
    if (!wsFetched || !invFetched || wsLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        );
    }

    // শুধু আমার pending invite গুলো
    const pendingInvites = invitations.filter((i) => i.status === "PENDING");
    const hasWorkspace = workspaces.length > 0;

    // --- workspace নেই এমন অবস্থায় redirect ---
    // (loop এড়াতে current path চেক করি)
    if (!hasWorkspace) {
        if (pendingInvites.length > 0 && location.pathname !== "/invitations") {
            return <Navigate to="/invitations" replace />;
        }
        if (
            pendingInvites.length === 0 &&
            location.pathname !== "/workspace/create"
        ) {
            return <Navigate to="/workspace/create" replace />;
        }
    }

    // workspace আছে → ভেতরের পেজ দেখাও
    return <Outlet />;
};

export default WorkspaceGate;
