import { PanelLeft, LogOutIcon, KeyRoundIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../features/themeSlice'
import { logoutUser } from '../features/authSlice'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import toast from 'react-hot-toast'
import NotificationBell from './NotificationBell'
import GlobalSearch from './GlobalSearch'

const Navbar = ({ setIsSidebarOpen }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme } = useSelector(state => state.theme);
    const { user } = useSelector(state => state.auth);

    // logout: thunk চালাই → cookie মুছে যায় → login পেজে পাঠাই
    const handleLogout = async () => {
        await dispatch(logoutUser());
        toast.success("Logged out");
        navigate("/login");
    };

    return (
        <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 py-3 flex-shrink-0">
            <div className="flex items-center justify-between  mx-auto">
                {/* Left section */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Sidebar Trigger */}
                    <button onClick={() => setIsSidebarOpen((prev) => !prev)} className="sm:hidden p-2 rounded-lg transition-colors text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800" >
                        <PanelLeft size={20} />
                    </button>

                    {/* Search Input — global search (project + task) */}
                    <GlobalSearch />
                </div>

                {/* Right section */}
                <div className="flex items-center gap-3">

                    {/* Theme Toggle */}
                    <button onClick={() => dispatch(toggleTheme())} className="size-8 flex items-center justify-center bg-white dark:bg-zinc-800 shadow rounded-lg transition hover:scale-105 active:scale-95">
                        {
                            theme === "light"
                                ? (<MoonIcon className="size-4 text-gray-800 dark:text-gray-200" />)
                                : (<SunIcon className="size-4 text-yellow-400" />)
                        }
                    </button>

                    {/* Notifications */}
                    <NotificationBell />

                    {/* User Button — click korle profile page e jay.
                        user.image thakle setai, na hole default avatar. */}
                    <button onClick={() => navigate("/profile")} title="Profile">
                        <img
                            src={user?.image || assets.profile_img_a}
                            alt="User Avatar"
                            className="size-7 rounded-full ring-2 ring-primary-500/30 transition hover:scale-105 active:scale-95"
                        />
                    </button>

                    {/* Change Password */}
                    <button onClick={() => navigate("/change-password")} title="Change password" className="size-8 flex items-center justify-center bg-white dark:bg-zinc-800 shadow rounded-lg transition hover:scale-105 active:scale-95">
                        <KeyRoundIcon className="size-4 text-gray-800 dark:text-gray-200" />
                    </button>

                    {/* Logout Button */}
                    <button onClick={handleLogout} title="Log out" className="size-8 flex items-center justify-center bg-white dark:bg-zinc-800 shadow rounded-lg transition hover:scale-105 active:scale-95">
                        <LogOutIcon className="size-4 text-gray-800 dark:text-gray-200" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Navbar
