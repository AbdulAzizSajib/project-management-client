import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginUser } from "../../features/authSlice";
import GoogleLoginButton from "../../components/GoogleLoginButton";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2Icon } from "lucide-react";
import sharingIdeasIllustration from "../../assets/undraw_sharing-ideas_toje.svg";

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
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-zinc-900">
            {/* ---------------- Left: form ---------------- */}
            <div className="flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-10">
                <div className="w-full max-w-sm mx-auto">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="flex items-center justify-center size-9 rounded-xl bg-primary-600 text-white font-bold text-lg shadow-brand">
                            P
                        </span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">Projment</span>
                    </div>
                    {/* <p className="text-xs text-gray-400 dark:text-zinc-500 mb-8">
                        A project management tool to plan, track, and deliver work.
                    </p> */}

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back!</h1>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mb-8">
                        Simplify your workflow and boost your productivity with{" "}
                        <span className="font-semibold text-gray-700 dark:text-zinc-200">Projment</span>. Get started for free.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Email"
                            className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-full text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition"
                        />

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Password"
                                className="w-full px-4 py-3 pr-11 border border-gray-200 dark:border-zinc-700 rounded-full text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                                tabIndex={-1}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-xs text-gray-500 dark:text-zinc-400 hover:text-primary-600 hover:underline">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 disabled:opacity-60 text-white dark:text-gray-900 text-sm font-semibold py-3 rounded-full transition"
                        >
                            {loading && <Loader2Icon className="size-4 animate-spin" />}
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    {/* Separator */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-800" />
                        <span className="text-xs text-gray-400 dark:text-zinc-500">or continue with</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-800" />
                    </div>

                    <div className="flex items-center justify-center">
                        <GoogleLoginButton redirect={from} label="" round />
                    </div>

                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-8 text-center">
                        Not a member?{" "}
                        <Link to="/register" className="text-primary-600 font-medium hover:text-primary-500 hover:underline">
                            Register now
                        </Link>
                    </p>
                </div>
            </div>

            {/* ---------------- Right: illustration panel ---------------- */}
            <div className="hidden md:flex relative flex-col items-center justify-center bg-primary-50 dark:bg-zinc-800/40 p-10 overflow-hidden">
                <span className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 dark:bg-zinc-900/50 border border-primary-200 dark:border-zinc-700 text-xs font-medium text-primary-700 dark:text-primary-300 shadow-sm">
                    ✨ Plan • Track • Deliver
                </span>

                <div className="flex-1 flex items-center justify-center w-full">
                    <img src={sharingIdeasIllustration} alt="Team collaborating on a project board" className="w-full max-w-2xl" />
                </div>

                <div className="text-center max-w-md space-y-2">
                    <p className="text-xl font-semibold text-gray-800 dark:text-zinc-100">
                        Make your work easier and organized with{" "}
                        <span className="font-bold text-primary-700 dark:text-primary-400">Projment</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                        Plan sprints, track tasks, and collaborate with your team — all in one place.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
