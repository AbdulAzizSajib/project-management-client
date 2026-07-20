import { useState, useRef, useEffect } from "react";
import { BellIcon, CheckCheckIcon, Trash2Icon, Loader2Icon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from "../services/notificationService";

/*
  Navbar এ bell + unread badge + dropdown।
  notification শুধু এখানেই লাগে — তাই Redux ছাড়া, useState দিয়ে।

  ⚠️ backend: notification এ isRead (read নয়), createdAt আছে।
       GET /notifications → { notifications, unreadCount }
*/
const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    // list আনার helper।
    // silent = true হলে spinner দেখাই না (background polling এর জন্য) —
    // নাহলে প্রতি ৩০ সেকেন্ডে list এ spinner ঝিলিক দিত।
    const load = (silent = false) => {
        if (!silent) setLoading(true);
        getNotifications()
            .then((data) => {
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            })
            .catch(() => {
                setNotifications([]);
                setUnreadCount(0);
            })
            .finally(() => {
                if (!silent) setLoading(false);
            });
    };

    // app খোলার সময় একবার আনি, তারপর প্রতি ৩০ সেকেন্ডে চুপচাপ refresh করি।
    // এতে অন্য কেউ task assign করলে user কে page reload দিতে হয় না —
    // কিছুক্ষণের মধ্যেই bell এ নতুন notification + badge দেখা যায়।
    useEffect(() => {
        load();
        const intervalId = setInterval(() => load(true), 30000);
        return () => clearInterval(intervalId);
    }, []);

    // বাইরে click করলে বন্ধ
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // একটা read করি (backend + local update)
    const handleRead = async (n) => {
        if (n.isRead) return;
        try {
            await markAsRead(n.id);
            setNotifications((prev) =>
                prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch {
            /* ignore */
        }
    };

    // সব read
    const handleReadAll = async () => {
        try {
            await markAllAsRead();
            setNotifications((prev) => prev.map((x) => ({ ...x, isRead: true })));
            setUnreadCount(0);
        } catch {
            /* ignore */
        }
    };

    // একটা মুছি
    const handleDelete = async (n) => {
        try {
            await deleteNotification(n.id);
            setNotifications((prev) => prev.filter((x) => x.id !== n.id));
            if (!n.isRead) setUnreadCount((c) => Math.max(0, c - 1));
        } catch {
            /* ignore */
        }
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => {
                    // খোলার সময় সাথে সাথে fresh data (৩০s poll এর জন্য অপেক্ষা না করে)
                    if (!isOpen) load(true);
                    setIsOpen((p) => !p);
                }}
                className="relative size-8 flex items-center justify-center bg-white dark:bg-zinc-800 shadow rounded-lg transition hover:scale-105 active:scale-95"
            >
                <BellIcon className="size-4 text-gray-800 dark:text-gray-200" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 flex items-center justify-center text-[10px] font-semibold text-white bg-red-500 rounded-full">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg z-50">
                    {/* header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            Notifications
                        </p>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleReadAll}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                                <CheckCheckIcon className="size-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    {/* list */}
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2Icon className="size-5 text-blue-500 animate-spin" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-zinc-400 text-center py-8">
                            No notifications
                        </p>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => handleRead(n)}
                                className={`px-4 py-3 border-b border-gray-100 dark:border-zinc-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 ${
                                    !n.isRead ? "bg-blue-50/50 dark:bg-blue-500/5" : ""
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {n.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                                            {n.message}
                                        </p>
                                        <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1">
                                            {n.createdAt &&
                                                formatDistanceToNow(new Date(n.createdAt), {
                                                    addSuffix: true,
                                                })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(n);
                                        }}
                                        className="text-gray-400 hover:text-red-500 flex-shrink-0"
                                    >
                                        <Trash2Icon className="size-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
