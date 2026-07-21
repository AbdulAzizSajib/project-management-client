import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../services/authService";
import toast from "react-hot-toast";
import { Loader2Icon, ArrowLeftIcon } from "lucide-react";

// Logged-in user nijer password change kore. currentPassword lage (security)।
const ChangePassword = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        setLoading(true);
        try {
            await changePassword({ currentPassword, newPassword });
            toast.success("Password changed successfully");
            navigate(-1); // agher page e ferot
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 mb-4"
                >
                    <ArrowLeftIcon className="size-4" /> Back
                </button>

                <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Change password</h1>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
                    Enter your current and new password
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            placeholder="••••••"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="••••••"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="••••••"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-md transition"
                    >
                        {loading && <Loader2Icon className="size-4 animate-spin" />}
                        {loading ? "Changing..." : "Change password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
