import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createWorkspace } from "../../features/workspaceSlice";
import { Loader2Icon, ImageIcon, Building2Icon } from "lucide-react";
import toast from "react-hot-toast";

/*
  STEP 3 — কোনো workspace নেই → এখানে বানাতে বলি।
  form fields: name (required), description, image (optional)।
  backend multipart/form-data চায় (image থাকতে পারে বলে),
  তাই FormData বানিয়ে পাঠাই।
*/
const CreateWorkspace = () => {
    // form গুলো local state — Redux এ না (hybrid approach)
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");            // backend required
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);       // File | null
    const [preview, setPreview] = useState(null);    // preview URL
    const [submitting, setSubmitting] = useState(false);

    // name থেকে auto slug বানাই (lowercase, শুধু a-z0-9 আর hyphen)
    const slugify = (text) =>
        text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")   // অক্ষর/সংখ্যা ছাড়া সব → hyphen
            .replace(/^-+|-+$/g, "");       // শুরু/শেষের hyphen বাদ

    // name বদলালে slug নিজে থেকে আপডেট হয় (user চাইলে আলাদা করে edit করতে পারে)
    const handleName = (value) => {
        setName(value);
        setSlug(slugify(value));
    };

    // list এ কিছু আছে কিনা — থাকলে "empty state" মেসেজ দেখাবো না
    const { workspaces } = useSelector((state) => state.workspace);
    const isFirst = workspaces.length === 0;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleImage = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // multipart/form-data — FormData বানাই
            const formData = new FormData();
            formData.append("name", name);
            formData.append("slug", slug);
            formData.append("description", description);
            if (image) formData.append("image", image);

            await dispatch(createWorkspace(formData)).unwrap();
            toast.success("Workspace created!");
            navigate("/"); // Dashboard এ (backend auto ADMIN বানিয়ে দেয়)
        } catch (message) {
            toast.error(message || "Failed to create workspace");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
                {/* empty state heading (প্রথম workspace হলে) */}
                <div className="flex items-center gap-3 mb-1">
                    <div className="size-9 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                        <Building2Icon className="size-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Create workspace
                    </h1>
                </div>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
                    {isFirst
                        ? "You don't have any workspace yet. Create one to get started."
                        : "Set up a new workspace for your team."}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image (optional) */}
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">
                            Workspace image <span className="text-gray-400">(optional)</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <label className="size-16 flex items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-zinc-700 cursor-pointer overflow-hidden hover:border-blue-500 transition">
                                {preview ? (
                                    <img src={preview} alt="preview" className="size-full object-cover" />
                                ) : (
                                    <ImageIcon className="size-5 text-gray-400" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImage}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-xs text-gray-400 dark:text-zinc-500">
                                PNG, JPG. No image → a default is used.
                            </p>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => handleName(e.target.value)}
                            required
                            placeholder="My Workspace"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Slug (auto from name, editable) */}
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">
                            Slug <span className="text-gray-400">(URL identifier)</span>
                        </label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(slugify(e.target.value))}
                            required
                            placeholder="my-workspace"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-zinc-300 mb-1">
                            Description <span className="text-gray-400">(optional)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="What is this workspace for?"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-md transition"
                    >
                        {submitting && <Loader2Icon className="size-4 animate-spin" />}
                        {submitting ? "Creating..." : "Create workspace"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateWorkspace;
