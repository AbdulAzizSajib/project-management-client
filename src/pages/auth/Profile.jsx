import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { updateProfile } from "../../services/authService";
import { setUser } from "../../features/authSlice";
import toast from "react-hot-toast";
import { Loader2Icon, ArrowLeftIcon, KeyRoundIcon } from "lucide-react";

// Logged-in user nijer profile (name + contact number) dekhe o update kore।
const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [name, setName] = useState(user?.name || "");
    const [contactNumber, setContactNumber] = useState(user?.contactNumber || "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // contactNumber khali hole null pathai (clear kori), na hole value।
            const updated = await updateProfile({
                name,
                contactNumber: contactNumber.trim() === "" ? null : contactNumber,
            });
            dispatch(setUser(updated)); // Redux e notun user boshai
            toast.success("Profile updated");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update profile");
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

                <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Your profile</h1>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
                    Update your name and contact number
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email — read only (change kora jay na ei form theke) */}
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={user?.email || ""}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-sm bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            minLength={3}
                            maxLength={50}
                            placeholder="John Doe"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">Contact Number</label>
                        <input
                            type="text"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            placeholder="01700000000"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-md transition"
                    >
                        {loading && <Loader2Icon className="size-4 animate-spin" />}
                        {loading ? "Saving..." : "Save changes"}
                    </button>
                </form>

                {/* Password change er shortcut */}
                <Link
                    to="/change-password"
                    className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-500 hover:underline"
                >
                    <KeyRoundIcon className="size-4" /> Change password
                </Link>
            </div>
        </div>
    );
};

export default Profile;
