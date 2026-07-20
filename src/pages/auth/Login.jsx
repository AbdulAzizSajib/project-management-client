import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginUser } from "../../features/authSlice";
import toast from "react-hot-toast";
import { Loader2Icon } from "lucide-react";

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // ProtectedRoute / invite flow যদি এখানে পাঠিয়ে থাকে, তাহলে কোথা থেকে
    // এসেছিল সেটা state.from এ থাকে (যেমন invite link)। না থাকলে Dashboard এ।
    const from = location.state?.from || "/";

    // invite flow থেকে এলে email আগে থেকে বসানো থাকে (prefill)।
    // form এর ইনপুট রাখার জন্য local state
    const [email, setEmail] = useState(location.state?.email || "");
    const [password, setPassword] = useState("");

    // Redux box থেকে loading পড়ছি (button spinner দেখাতে)
    const { loading } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault(); // page reload আটকাই

        // dispatch(loginUser(...)) = "login করো" — thunk চলবে।
        // .unwrap() দিলে সফল/ব্যর্থ try-catch দিয়ে ধরা যায়।
        try {
            await dispatch(loginUser({ email, password })).unwrap();
            toast.success("Logged in successfully");
            navigate(from, { replace: true }); // এসেছিল যেখান থেকে (নাহলে Dashboard)
        } catch (message) {
            toast.error(message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Welcome back</h1>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">Log in to your account</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-md transition"
                    >
                        {loading && <Loader2Icon className="size-4 animate-spin" />}
                        {loading ? "Logging in..." : "Log in"}
                    </button>
                </form>

                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-5 text-center">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-600 hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
