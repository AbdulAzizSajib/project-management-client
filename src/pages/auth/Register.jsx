import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { registerUser } from "../../features/authSlice";
import GoogleLoginButton from "../../components/GoogleLoginButton";
import toast from "react-hot-toast";
import { Loader2Icon } from "lucide-react";

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { loading } = useSelector((state) => state.auth);

    // invite link থেকে এলে AcceptInvitation পেজ এগুলো state এ পাঠায়:
    //   email     → invited email (prefill)
    //   lockEmail → email edit করা যাবে না (ভুল email দিলে accept fail হতো)
    //   from      → verify শেষে যেখানে ফেরত পাঠাতে হবে (accept পেজ)
    const invitedEmail = location.state?.email || "";
    const lockEmail = Boolean(location.state?.lockEmail);
    const from = location.state?.from;

    // চারটা ইনপুট একসাথে একটা object এ রাখছি (backend যা চায়)
    const [form, setForm] = useState({
        name: "",
        email: invitedEmail,
        password: "",
        contactNumber: "",
    });

    // যেকোনো ইনপুট বদলালে এই একটাই function কাজ করে
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(registerUser(form)).unwrap();
            toast.success("Registered! Check your email for the OTP.");
            // OTP verify পেজে যাই, email টা সাথে নিয়ে (state দিয়ে পাঠাচ্ছি)।
            // invite থেকে এলে `from` ও এগিয়ে দিই — verify শেষে accept পেজে ফিরবে।
            navigate("/verify-email", { state: { email: form.email, from } });
        } catch (message) {
            toast.error(message || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Create account</h1>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">Sign up to get started</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            readOnly={lockEmail}
                            placeholder="you@example.com"
                            className={`w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                                lockEmail
                                    ? "cursor-not-allowed opacity-70 bg-gray-50 dark:bg-zinc-800"
                                    : ""
                            }`}
                        />
                        {lockEmail && (
                            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                                You were invited with this email, so it can't be changed.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            placeholder="At least 6 characters"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">Contact Number</label>
                        <input
                            type="text"
                            name="contactNumber"
                            value={form.contactNumber}
                            onChange={handleChange}
                            required
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
                        {loading ? "Creating..." : "Create account"}
                    </button>
                </form>

                {/* invite flow e email locked — tokhon Google login diye lock email
                    bypass hote pare, tai sudhu normal signup e Google button dekhai। */}
                {!lockEmail && (
                    <>
                        <div className="flex items-center gap-3 my-5">
                            <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-800" />
                            <span className="text-xs text-gray-400 dark:text-zinc-500">or</span>
                            <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-800" />
                        </div>
                        <GoogleLoginButton />
                    </>
                )}

                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-5 text-center">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary-600 hover:text-primary-500 hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
