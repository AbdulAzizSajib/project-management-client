import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ListChecksIcon, Loader2Icon, Trash2Icon, PlusIcon } from "lucide-react";
import {
    getSubtasks,
    createSubtask,
    updateSubtask,
    deleteSubtask,
} from "../services/taskService";

/*
  Task er subtask / checklist section — TaskDetails page e boshe।
  Self-contained: fetch + add + toggle complete + delete + progress bar।
*/
const TaskSubtasks = ({ taskId }) => {
    const [subtasks, setSubtasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState("");
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (!taskId) return;
        getSubtasks(taskId)
            .then(setSubtasks)
            .catch(() => setSubtasks([]))
            .finally(() => setLoading(false));
    }, [taskId]);

    const handleAdd = async (e) => {
        e.preventDefault();
        const title = newTitle.trim();
        if (!title) return;
        setAdding(true);
        try {
            const saved = await createSubtask(taskId, title);
            if (saved) setSubtasks((prev) => [...prev, saved]);
            setNewTitle("");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to add subtask");
        } finally {
            setAdding(false);
        }
    };

    const handleToggle = async (sub) => {
        // optimistic: sathe sathe UI te dekhai, fail hole revert
        const next = !sub.isCompleted;
        setSubtasks((prev) =>
            prev.map((s) => (s.id === sub.id ? { ...s, isCompleted: next } : s))
        );
        try {
            await updateSubtask(sub.id, { isCompleted: next });
        } catch (error) {
            setSubtasks((prev) =>
                prev.map((s) => (s.id === sub.id ? { ...s, isCompleted: sub.isCompleted } : s))
            );
            toast.error(error?.response?.data?.message || "Failed to update");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteSubtask(id);
            setSubtasks((prev) => prev.filter((s) => s.id !== id));
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete");
        }
    };

    const completed = subtasks.filter((s) => s.isCompleted).length;
    const total = subtasks.length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <div className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800">
            <h2 className="text-base font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                <ListChecksIcon className="size-4" /> Checklist ({completed}/{total})
            </h2>

            {/* Progress bar */}
            {total > 0 && (
                <div className="mb-4">
                    <div className="h-2 w-full bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-500 transition-all"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 py-2">
                    <Loader2Icon className="size-4 animate-spin" /> Loading...
                </div>
            ) : (
                <div className="flex flex-col gap-1.5 mb-4">
                    {subtasks.map((sub) => (
                        <div
                            key={sub.id}
                            className="flex items-center gap-2 group py-1"
                        >
                            <input
                                type="checkbox"
                                checked={sub.isCompleted}
                                onChange={() => handleToggle(sub)}
                                className="size-4 accent-primary-600 cursor-pointer shrink-0"
                            />
                            <span
                                className={`flex-1 text-sm ${
                                    sub.isCompleted
                                        ? "line-through text-gray-400 dark:text-zinc-600"
                                        : "text-gray-800 dark:text-zinc-200"
                                }`}
                            >
                                {sub.title}
                            </span>
                            <button
                                onClick={() => handleDelete(sub.id)}
                                title="Delete"
                                className="text-gray-300 dark:text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition shrink-0"
                            >
                                <Trash2Icon className="size-4" />
                            </button>
                        </div>
                    ))}
                    {total === 0 && (
                        <p className="text-sm text-gray-500 dark:text-zinc-500 py-1">
                            No checklist items yet.
                        </p>
                    )}
                </div>
            )}

            {/* Add subtask */}
            <form onSubmit={handleAdd} className="flex items-center gap-2">
                <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Add a checklist item..."
                    className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button
                    type="submit"
                    disabled={adding || !newTitle.trim()}
                    className="flex items-center gap-1 text-sm bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-md transition"
                >
                    <PlusIcon className="size-4" /> Add
                </button>
            </form>
        </div>
    );
};

export default TaskSubtasks;
