import { useState, useEffect } from "react";
import { Mail, UserPlus } from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getWorkspaceMembers, } from "../services/workspaceService";
import { addProjectMember, getProjectMembers } from "../services/projectService";

// projectId + onAdded (member যোগ হলে parent এ list reload)
const AddProjectMember = ({ isDialogOpen, setIsDialogOpen, projectId, onAdded }) => {

    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);

    // workspace members (nested user সহ) — এখান থেকে select করব
    const [wsMembers, setWsMembers] = useState([]);
    // যারা already এই project এ আছে তাদের userId — dropdown থেকে বাদ দিতে
    const [projectMemberIds, setProjectMemberIds] = useState([]);
    const [userId, setUserId] = useState("");     // select করা member এর userId
    const [isAdding, setIsAdding] = useState(false);

    // workspace members + already project এ থাকা members — দুটোই আনি,
    // যাতে dropdown এ শুধু "এখনো project এ নেই" এমন member দেখাতে পারি।
    // (আগে সবাইকে দেখাত → already-থাকা কে add করলে "already a member" error আসত)
    useEffect(() => {
        if (isDialogOpen && currentWorkspace?.id && projectId) {
            getWorkspaceMembers(currentWorkspace.id)
                .then(setWsMembers)
                .catch(() => setWsMembers([]));

            getProjectMembers(projectId)
                .then((members) =>
                    setProjectMemberIds(members.map((m) => m.userId))
                )
                .catch(() => setProjectMemberIds([]));
        }
    }, [isDialogOpen, currentWorkspace?.id, projectId]);

    // যারা এখনো project এ নেই শুধু তারাই select করা যাবে
    const availableMembers = wsMembers.filter(
        (member) => !projectMemberIds.includes(member.userId)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId || !projectId) return;
        setIsAdding(true);
        try {
            await addProjectMember(projectId, userId, "MEMBER");
            toast.success("Member added to project");
            setUserId("");
            onAdded?.();
            setIsDialogOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add member");
        } finally {
            setIsAdding(false);
        }
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                {/* Header */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserPlus className="size-5 text-zinc-900 dark:text-zinc-200" /> Add Member to Project
                    </h2>
                    <p className="text-sm text-zinc-700 dark:text-zinc-400">
                        Select a workspace member to add to this project.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 w-4 h-4" />
                            {/* List All non project members from current workspace */}
                            <select value={userId} onChange={(e) => setUserId(e.target.value)} className="pl-10 mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 text-sm placeholder-zinc-400 dark:placeholder-zinc-500 py-2 focus:outline-none focus:border-primary-500 disabled:opacity-60" required disabled={availableMembers.length === 0} >
                                <option value="">
                                    {availableMembers.length === 0
                                        ? "All workspace members are already in this project"
                                        : "Select a member"}
                                </option>
                                {availableMembers.map((member) => (
                                    <option key={member.userId} value={member.userId}>
                                        {member.user?.name || member.user?.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="px-5 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition" >
                            Cancel
                        </button>
                        <button type="submit" disabled={isAdding || !currentWorkspace || !userId} className="px-5 py-2 text-sm rounded bg-gradient-to-br from-primary-500 to-primary-600 shadow-brand hover:opacity-90 text-white disabled:opacity-50 transition" >
                            {isAdding ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProjectMember;
