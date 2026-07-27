import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { updateProfile, deactivateAccount } from "../../services/authService";
import { setUser, forceLogout } from "../../features/authSlice";
import toast from "react-hot-toast";
import { Loader2Icon, ArrowLeftIcon, KeyRoundIcon, AlertTriangleIcon } from "lucide-react";
import Avatar from "../../components/Avatar";

// Logged-in user nijer profile (name + contact number) dekhe o update kore।
const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [name, setName] = useState(user?.name || "");
    const [contactNumber, setContactNumber] = useState(user?.contactNumber || "");
    const [image, setImage] = useState(null);       // File | null (notun image bachle)
    const [preview, setPreview] = useState(user?.image || null);
    const [loading, setLoading] = useState(false);
    const [deactivating, setDeactivating] = useState(false);

    const handleImage = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // image bachle multipart/form-data pathai, na hole plain object।
            let updated;
            if (image) {
                const formData = new FormData();
                formData.append("name", name);
                formData.append("contactNumber", contactNumber.trim() === "" ? "" : contactNumber);
                formData.append("image", image);
                updated = await updateProfile(formData);
            } else {
                // contactNumber khali hole null pathai (clear kori), na hole value।
                updated = await updateProfile({
                    name,
                    contactNumber: contactNumber.trim() === "" ? null : contactNumber,
                });
            }
            dispatch(setUser(updated)); // Redux e notun user boshai
            toast.success("Profile updated");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    // Account deactivate — double confirm, tarpor backend session muche day।
    // sekhane Redux clear kore login e pathai।
    const handleDeactivate = async () => {
        const confirmed = window.confirm(
            "Deactivate your account? You will be logged out and lose access. This can only be undone by an administrator."
        );
        if (!confirmed) return;

        setDeactivating(true);
        try {
            await deactivateAccount();
            dispatch(forceLogout());
            toast.success("Account deactivated");
            navigate("/login", { replace: true });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to deactivate account");
        } finally {
            setDeactivating(false);
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
                    {/* Profile image (optional) */}
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">
                            Profile image <span className="text-gray-400">(optional)</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <label className="size-16 rounded-full border border-dashed border-gray-300 dark:border-zinc-700 cursor-pointer overflow-hidden hover:border-primary-500 transition block">
                                <Avatar src={preview} name={name} className="size-full rounded-full" textSize="text-xl" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImage}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-xs text-gray-400 dark:text-zinc-500">
                                PNG, JPG. No image → default avatar stays.
                            </p>
                        </div>
                    </div>

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

                {/* Danger zone — account deactivate */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-zinc-800">
                    <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2 mb-2">
                        <AlertTriangleIcon className="size-4" /> Danger zone
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">
                        Deactivating your account logs you out everywhere and removes your access.
                    </p>
                    <button
                        type="button"
                        onClick={handleDeactivate}
                        disabled={deactivating}
                        className="w-full flex items-center justify-center gap-2 border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-60 text-sm font-medium py-2 rounded-md transition"
                    >
                        {deactivating && <Loader2Icon className="size-4 animate-spin" />}
                        {deactivating ? "Deactivating..." : "Deactivate account"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
