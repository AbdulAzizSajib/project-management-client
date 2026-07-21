import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgetPassword } from "../../services/authService";
import toast from "react-hot-toast";
import { Loader2Icon } from "lucide-react";

// "Forgot password?" — email dile OTP pathay, tarpor Reset page e niye jay.
const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgetPassword(email);
            toast.success("Reset code sent to your email");
            // email ta Reset page e pathiye dei (prefill), na hole abar likhte hobe।
            navigate("/reset-password", { state: { email } });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to send reset code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Forgot password</h1>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
                    Enter your email and we'll send a reset code
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-md transition"
                    >
                        {loading && <Loader2Icon className="size-4 animate-spin" />}
                        {loading ? "Sending..." : "Send reset code"}
                    </button>
                </form>

                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-5 text-center">
                    Remembered it?{" "}
                    <Link to="/login" className="text-primary-600 hover:text-primary-500 hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
