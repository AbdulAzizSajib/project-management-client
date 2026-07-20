import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2Icon, XCircleIcon, UserRoundXIcon } from "lucide-react";
import { fetchMyWorkspaces } from "../../features/workspaceSlice";
import { logoutUser } from "../../features/authSlice";
import {
    getInvitationByToken,
    acceptInvitation,
} from "../../services/invitationService";

/*
==================================================================
  ACCEPT INVITATION — email এর link এ click করলে এই পেজ চলে
==================================================================
  email এর link: /invitations/accept?token=...&invitationId=...

  এই পেজ PUBLIC (login ছাড়াই ঢোকা যায়) — কারণ যাকে invite করা
  হয়েছে তার account নাও থাকতে পারে। পেজ নিজে ঠিক করে কী করবে:

    1. আগে token দিয়ে invitation টা যাচাই করি (public API)।
       → invalid/expired/already used হলে error দেখাই।

    2. তারপর তিন অবস্থা:
       ┌ user logged in  → সরাসরি accept করে Dashboard এ পাঠাই।
       ├ account নেই     → /register এ পাঠাই (email prefill + locked)।
       └ account আছে     → /login এ পাঠাই (email prefill)।
          কিন্তু logged out    দুই ক্ষেত্রেই `from` সাথে দিই — login/verify
                              শেষে আবার এই accept পেজে ফেরত এসে accept হয়।

  ⚠️ auth শেষে ফেরত এলে user তখন logged in — তখন উপরের ধাপ ১ ঠিকঠাক
     হলে সরাসরি accept হয়ে Dashboard এ চলে যায়।
==================================================================
*/
const AcceptInvitation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");
    const invitationId = searchParams.get("invitationId");

    // auth check শেষ + এই পেজে logged in user আছে কিনা
    const { user, authChecked } = useSelector((state) => state.auth);

    // "working" = কাজ চলছে | "error" = ব্যর্থ (success হলে সরাসরি navigate)
    // "mismatch" = logged in ঠিকই, কিন্তু ভুল account (email মিলছে না)
    const [state, setState] = useState("working");
    const [message, setMessage] = useState("");

    // mismatch হলে দুটো email দেখাবো: কোনটা দিয়ে login আছে vs invite কার জন্য
    const [invitedEmail, setInvitedEmail] = useState("");

    // StrictMode এ useEffect দুবার চলে — logic যেন একবারই চলে
    const ranRef = useRef(false);

    useEffect(() => {
        // auth check শেষ না হওয়া পর্যন্ত অপেক্ষা — নাহলে logged in user কেও
        // ভুল করে register এ পাঠিয়ে দিতে পারি।
        if (!authChecked) return;

        if (ranRef.current) return;
        ranRef.current = true;

        // link এ token/invitationId না থাকলে আর এগোনোর মানে নেই
        if (!token || !invitationId) {
            setState("error");
            setMessage("This invitation link is invalid or incomplete.");
            return;
        }

        // এই পেজে ফেরত আসার জন্য পুরো URL (path + query) — auth শেষে দরকার
        const from = `/invitations/accept?token=${encodeURIComponent(
            token
        )}&invitationId=${encodeURIComponent(invitationId)}`;

        const run = async () => {
            // ---- ধাপ ১: token দিয়ে invitation যাচাই (public) ----
            let details;
            try {
                details = await getInvitationByToken(token);
            } catch (err) {
                setState("error");
                setMessage(
                    err.response?.data?.message ||
                        "This invitation link is invalid or has been removed."
                );
                return;
            }

            if (details.isExpired || details.status === "EXPIRED") {
                setState("error");
                setMessage("This invitation has expired.");
                return;
            }

            if (details.status !== "PENDING") {
                setState("error");
                setMessage(
                    "This invitation is no longer available (it may already be accepted or rejected)."
                );
                return;
            }

            // ---- ধাপ ২: logged in ----
            if (user) {
                // এই invite এই email এর জন্য, কিন্তু user অন্য account দিয়ে
                // login করা? তাহলে accept API কল করলে backend "not allowed"
                // দিত। তার আগেই এখানে পরিষ্কার message দেখাই + logout option।
                const currentEmail = (user.email || "").toLowerCase();
                const targetEmail = (details.email || "").toLowerCase();

                if (currentEmail !== targetEmail) {
                    setInvitedEmail(details.email);
                    setState("mismatch");
                    return;
                }

                // email মিলছে → সরাসরি accept
                try {
                    await acceptInvitation(invitationId, token);
                    await dispatch(fetchMyWorkspaces());
                    navigate("/", { replace: true });
                } catch (err) {
                    setState("error");
                    setMessage(
                        err.response?.data?.message ||
                            "Could not accept this invitation. It may have expired or already been used."
                    );
                }
                return;
            }

            // ---- ধাপ ৩: logged out ----
            // account আছে কিনা তার উপর ঠিক করি কোথায় পাঠাবো।
            // email + from state এ পাঠাই → auth শেষে আবার এখানে ফেরত আসবে।
            if (details.hasAccount) {
                navigate("/login", {
                    replace: true,
                    state: { from, email: details.email },
                });
            } else {
                navigate("/register", {
                    replace: true,
                    state: { from, email: details.email, lockEmail: true },
                });
            }
        };

        run();
    }, [authChecked, user, token, invitationId, dispatch, navigate]);

    // mismatch হলে: ভুল account থেকে বেরিয়ে গিয়ে আবার এই পেজ reload করি।
    // logged out অবস্থায় পেজ আবার চলবে → account আছে/নেই দেখে login/register এ
    // পাঠাবে (সঠিক email prefill সহ)।
    const handleLogoutAndSwitch = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
        } catch {
            // logout fail করলেও এগিয়ে যাই — নিচে page reload তো হচ্ছেই
        }
        // full reload — auth state clean করে আবার এই accept flow শুরু করতে
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm p-6 text-center">
                {state === "working" && (
                    <>
                        <Loader2Icon className="size-8 text-blue-500 animate-spin mx-auto mb-4" />
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Checking your invitation…
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                            Hang on a moment.
                        </p>
                    </>
                )}

                {state === "mismatch" && (
                    <>
                        <UserRoundXIcon className="size-8 text-amber-500 mx-auto mb-4" />
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Wrong account
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
                            This invitation was sent to{" "}
                            <span className="font-medium text-gray-700 dark:text-zinc-200">
                                {invitedEmail}
                            </span>
                            , but you're signed in as{" "}
                            <span className="font-medium text-gray-700 dark:text-zinc-200">
                                {user?.email}
                            </span>
                            .
                        </p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
                            Sign in with the invited account to accept it.
                        </p>
                        <button
                            onClick={handleLogoutAndSwitch}
                            className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-md transition"
                        >
                            Switch account
                        </button>
                        <Link
                            to="/"
                            className="inline-block mt-3 text-sm text-gray-500 dark:text-zinc-400 hover:underline"
                        >
                            Cancel
                        </Link>
                    </>
                )}

                {state === "error" && (
                    <>
                        <XCircleIcon className="size-8 text-red-500 mx-auto mb-4" />
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Invitation not accepted
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                            {message}
                        </p>
                        <Link
                            to="/login"
                            className="inline-block mt-5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Go to login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default AcceptInvitation;
