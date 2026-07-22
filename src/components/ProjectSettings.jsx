import { Plus, Save, Trash2, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AddProjectMember from "./AddProjectMember";
import { updateProject, deleteProject } from "../services/projectService";
import { getProjectMembers } from "../services/projectService";

// date কে yyyy-MM-dd তে (input[type=date] এর জন্য)
const toDateInput = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

export default function ProjectSettings({ project }) {

    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "PLANNING",
        priority: "MEDIUM",
        start_date: "",
        end_date: "",
    });

    const [members, setMembers] = useState([]);   // project members (real API)
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // project এর মান form এ বসাই (backend camelCase → form)
    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || "",
                description: project.description || "",
                status: project.status || "PLANNING",
                priority: project.priority || "MEDIUM",
                start_date: toDateInput(project.startDate),
                end_date: toDateInput(project.endDate),
            });
        }
    }, [project]);

    // project members আনি (nested user সহ)
    useEffect(() => {
        if (project?.id) {
            getProjectMembers(project.id)
                .then(setMembers)
                .catch(() => setMembers([]));
        }
    }, [project?.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateProject(project.id, {
                name: formData.name,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                startDate: formData.start_date
                    ? new Date(formData.start_date).toISOString()
                    : undefined,
                endDate: formData.end_date
                    ? new Date(formData.end_date).toISOString()
                    : undefined,
            });
            toast.success("Project updated");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update project");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Project delete — double confirm, tarpor projects list e ferot।
    // (backend cascade: project muchle er task/member/attachment shob muche jabe)
    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Delete project "${project.name}"? This permanently removes the project and all its tasks. This cannot be undone.`
        );
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            await deleteProject(project.id);
            toast.success("Project deleted");
            navigate("/projects");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete project");
            setIsDeleting(false);
        }
    };

    const inputClasses = "w-full px-3 py-2 rounded mt-2 border text-sm dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-300";

    const cardClasses = "rounded-lg border p-6 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800";

    const labelClasses = "text-sm text-zinc-600 dark:text-zinc-400";

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Project Details */}
            <div className={cardClasses}>
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300 mb-4">Project Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className={labelClasses}>Project Name</label>
                        <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClasses} required />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className={labelClasses}>Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClasses + " h-24"} />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className={labelClasses}>Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClasses} >
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className={labelClasses}>Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputClasses} >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4 grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className={labelClasses}>Start Date</label>
                            <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelClasses}>End Date</label>
                            <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className={inputClasses} />
                        </div>
                    </div>

                    {/* NOTE: progress backend এ auto (task status থেকে হিসাব হয়),
                        তাই এখানে edit করার সুযোগ নেই — Project detail এর উপরে দেখাই। */}

                    {/* Save Button */}
                    <button type="submit" disabled={isSubmitting} className="ml-auto flex items-center text-sm justify-center gap-2 bg-gradient-to-br from-primary-500 to-primary-600 shadow-brand text-white px-4 py-2 rounded" >
                        <Save className="size-4" /> {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>

            {/* Team Members */}
            <div className="space-y-6">
                <div className={cardClasses}>
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300 mb-4">
                            Team Members <span className="text-sm text-zinc-600 dark:text-zinc-400">({members.length})</span>
                        </h2>
                        <button type="button" onClick={() => setIsDialogOpen(true)} className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800" >
                            <Plus className="size-4 text-zinc-900 dark:text-zinc-300" />
                        </button>
                        <AddProjectMember isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} projectId={project.id} onAdded={() => getProjectMembers(project.id).then(setMembers)} />
                    </div>

                    {/* Member List */}
                    {members.length > 0 && (
                        <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                            {members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between px-3 py-2 rounded dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-300" >
                                    <span> {member?.user?.name || member?.user?.email || "Unknown"} </span>
                                    {project.teamLeadId === member.userId && <span className="px-2 py-0.5 rounded-xs ring ring-zinc-200 dark:ring-zinc-600">Team Lead</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Danger zone — project delete */}
                <div className="rounded-lg border border-red-300 dark:border-red-900/60 p-6 bg-red-50/50 dark:bg-red-950/20">
                    <h2 className="text-lg font-medium text-red-700 dark:text-red-400 mb-1 flex items-center gap-2">
                        <AlertTriangle className="size-5" /> Danger zone
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                        Deleting a project permanently removes it along with all its tasks, comments, and attachments.
                    </p>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-4 py-2 rounded transition"
                    >
                        <Trash2 className="size-4" /> {isDeleting ? "Deleting..." : "Delete project"}
                    </button>
                </div>
            </div>
        </div>
    );
}
