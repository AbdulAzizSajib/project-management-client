import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { resetPassword, resendPasswordResetOtp } from "../../services/authService";
import toast from "react-hot-toast";
import { Loader2Icon } from "lucide-react";

// OTP + notun password diye password reset kore.
// email ta ForgotPassword page theke state e ashe (prefill), sorasori ele input diyeo dewa jay।
const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState(location.state?.email || "");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await resetPassword({ email, otp, newPassword });
            toast.success("Password reset! Please log in.");
            navigate("/login", { state: { email } });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            toast.error("Enter your email first");
            return;
        }
        setResending(true);
        try {
            await resendPasswordResetOtp(email);
            toast.success("New reset code sent");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to resend code");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Reset password</h1>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
                    Enter the code sent to your email and a new password
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

                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">OTP Code</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            maxLength={4}
                            placeholder="1234"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-sm tracking-widest text-center bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-md transition"
                    >
                        {loading && <Loader2Icon className="size-4 animate-spin" />}
                        {loading ? "Resetting..." : "Reset password"}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full mt-3 text-sm text-primary-600 hover:text-primary-500 hover:underline disabled:opacity-60"
                >
                    {resending ? "Resending..." : "Resend code"}
                </button>

                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-4 text-center">
                    Back to{" "}
                    <Link to="/login" className="text-primary-600 hover:text-primary-500 hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
