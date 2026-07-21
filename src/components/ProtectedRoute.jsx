import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2Icon } from "lucide-react";

/*
  ProtectedRoute = দরজার পাহারাদার।
  - user নেই  → /login এ পাঠায়
  - user আছে  → ভেতরের পেজ দেখায় (<Outlet />)

  authChecked = app শুরুতে "আমি কে?" check শেষ হয়েছে কিনা।
  check শেষ না হওয়া পর্যন্ত spinner দেখাই — নাহলে refresh এর সময়
  এক মুহূর্তের জন্য ভুল করে login পেজে ছুড়ে দিত।
*/
const ProtectedRoute = () => {
    const { user, authChecked } = useSelector((state) => state.auth);
    const location = useLocation();

    // এখনো check চলছে → অপেক্ষা করো
    if (!authChecked) {
        return (
            <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
                <Loader2Icon className="size-7 text-primary-500 animate-spin" />
            </div>
        );
    }

    // check শেষ, user নেই → login পেজে পাঠাও।
    // যে পেজে যেতে চেয়েছিল (path + query) সেটা state এ রাখি,
    // যাতে login শেষে ঠিক সেখানেই ফেরত পাঠানো যায় (invite link এর জন্য জরুরি)।
    if (!user) {
        const from = location.pathname + location.search;
        return <Navigate to="/login" replace state={{ from }} />;
    }

    // user আছে → ভেতরের পেজ দেখাও
    return <Outlet />;
};

export default ProtectedRoute;
