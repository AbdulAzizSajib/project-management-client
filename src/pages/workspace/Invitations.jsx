import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MailIcon, Loader2Icon, CheckIcon, XIcon } from "lucide-react";
import toast from "react-hot-toast";
import { fetchMyWorkspaces } from "../../features/workspaceSlice";
import {
    getMyInvitations,
    acceptInvitation,
    rejectInvitation,
} from "../../services/invitationService";

/*
  STEP 2 — pending invitation দেখানো (Redux ছাড়া, useState দিয়ে)।
  accept করলে → member হয় → workspaces আবার fetch (Redux) → Dashboard।
  reject করলে → list থেকে সরে; আর কিছু না থাকলে Gate নিজে create এ পাঠাবে।
*/
const Invitations = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null); // কোন invite এ কাজ চলছে

    // invitation গুলো আনি
    useEffect(() => {
        getMyInvitations()
            .then(setInvitations)
            .catch(() => setInvitations([]))
            .finally(() => setLoading(false));
    }, []);

    const pending = invitations.filter((i) => i.status === "PENDING");

    const handleAccept = async (invite) => {
        setBusyId(invite.id);
        try {
            // accept এ token লাগে — invite object এ token আছে
            await acceptInvitation(invite.id, invite.token);
            toast.success("Invitation accepted!");
            // নতুন workspace list এ আনি (Redux), তারপর Dashboard
            await dispatch(fetchMyWorkspaces());
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to accept");
        } finally {
            setBusyId(null);
        }
    };

    const handleReject = async (invite) => {
        setBusyId(invite.id);
        try {
            await rejectInvitation(invite.id);
            toast.success("Invitation rejected");
            // list থেকে সরাই
            setInvitations((prev) => prev.filter((i) => i.id !== invite.id));
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reject");
        } finally {
            setBusyId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
            <div className="w-full max-w-md">
                <div className="flex items-center gap-3 mb-1">
                    <div className="size-9 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                        <MailIcon className="size-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Your invitations
                    </h1>
                </div>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
                    You've been invited to join {pending.length} workspace
                    {pending.length !== 1 ? "s" : ""}.
                </p>

                <div className="space-y-3">
                    {pending.map((invite) => (
                        <div
                            key={invite.id}
                            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {invite.workspace?.name || "A workspace"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                                    Role: {invite.role || "MEMBER"}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => handleReject(invite)}
                                    disabled={busyId === invite.id}
                                    title="Reject"
                                    className="size-8 flex items-center justify-center rounded-md border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition"
                                >
                                    <XIcon className="size-4" />
                                </button>
                                <button
                                    onClick={() => handleAccept(invite)}
                                    disabled={busyId === invite.id}
                                    title="Accept"
                                    className="h-8 px-3 flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-60 transition"
                                >
                                    {busyId === invite.id ? (
                                        <Loader2Icon className="size-4 animate-spin" />
                                    ) : (
                                        <CheckIcon className="size-4" />
                                    )}
                                    Accept
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => navigate("/workspace/create")}
                    className="mt-6 w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Or create your own workspace instead
                </button>
            </div>
        </div>
    );
};

export default Invitations;
