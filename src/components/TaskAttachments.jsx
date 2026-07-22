import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { PaperclipIcon, Loader2Icon, Trash2Icon, FileIcon, UploadIcon } from "lucide-react";
import {
    getTaskAttachments,
    uploadAttachment,
    deleteAttachment,
} from "../services/taskService";

// human-readable file size
const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/*
  Task er file attachment section — TaskDetails page e boshe।
  Nijei fetch + upload + delete kore (self-contained)।
  Delete: uploader nijei ba approver parbe — backend enforce kore,
  UI te uploader-i sudhu delete button dekhi (approver check frontend e nei)।
*/
const TaskAttachments = ({ taskId }) => {
    const currentUser = useSelector((state) => state.auth.user);
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!taskId) return;
        getTaskAttachments(taskId)
            .then(setAttachments)
            .catch(() => setAttachments([]))
            .finally(() => setLoading(false));
    }, [taskId]);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const saved = await uploadAttachment(taskId, file);
            if (saved) setAttachments((prev) => [saved, ...prev]);
            toast.success("File uploaded");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to upload file");
        } finally {
            setUploading(false);
            // ekই file abar upload korte chaile jate onChange fire hoy
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this attachment?")) return;
        try {
            await deleteAttachment(id);
            setAttachments((prev) => prev.filter((a) => a.id !== id));
            toast.success("Attachment deleted");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete");
        }
    };

    return (
        <div className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                    <PaperclipIcon className="size-4" /> Attachments ({attachments.length})
                </h2>

                {/* Upload button — hidden file input trigger kore */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 text-sm bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-md transition"
                >
                    {uploading ? (
                        <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                        <UploadIcon className="size-4" />
                    )}
                    {uploading ? "Uploading..." : "Upload"}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 py-2">
                    <Loader2Icon className="size-4 animate-spin" /> Loading...
                </div>
            ) : attachments.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-zinc-500 py-2">
                    No attachments yet.
                </p>
            ) : (
                <div className="flex flex-col gap-2">
                    {attachments.map((att) => (
                        <div
                            key={att.id}
                            className="flex items-center gap-3 p-2 rounded-md border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition"
                        >
                            <FileIcon className="size-5 text-primary-500 shrink-0" />
                            <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 min-w-0"
                            >
                                <p className="text-sm text-gray-900 dark:text-zinc-200 truncate hover:underline">
                                    {att.fileName}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-zinc-500">
                                    {att.uploader?.name} • {formatSize(att.fileSize)} •{" "}
                                    {format(new Date(att.createdAt), "dd MMM yyyy")}
                                </p>
                            </a>

                            {/* uploader nijei delete button dekhe (approver o backend e parbe) */}
                            {att.uploader?.id === currentUser?.id && (
                                <button
                                    onClick={() => handleDelete(att.id)}
                                    title="Delete"
                                    className="text-gray-400 hover:text-red-500 transition shrink-0"
                                >
                                    <Trash2Icon className="size-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaskAttachments;
