import { format } from "date-fns";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarIcon, MessageCircle, PenIcon } from "lucide-react";
import { getTaskById, createComment } from "../services/taskService";
import { getProjectById, getProjectMembers } from "../services/projectService";
import TaskAttachments from "../components/TaskAttachments";
import TaskSubtasks from "../components/TaskSubtasks";
import { renderCommentContent, detectMentionQuery } from "../utils/mentions";
import socket from "../services/socket";

const TaskDetails = () => {

    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    // logged-in user (comment এর ডান/বাম দিক ঠিক করতে)
    const currentUser = useSelector((state) => state.auth.user);

    const [task, setTask] = useState(null);
    const [project, setProject] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [posting, setPosting] = useState(false);
    const [loading, setLoading] = useState(true);

    // @mention: project member list + dropdown state
    const [members, setMembers] = useState([]);
    const [mention, setMention] = useState(null); // { query, start } ba null
    const commentRef = useRef(null);

    // comment list এর একদম নিচে একটা invisible anchor — এখানে scroll করলে
    // সর্বশেষ message দেখা যায়।
    const bottomRef = useRef(null);

    // task detail + project + comments — সব real API থেকে
    useEffect(() => {
        if (!taskId) return;
        setLoading(true);
        (async () => {
            try {
                // getTaskById এ comments ও আসে, তবু আলাদা getComments রাখছি
                // যাতে নতুন comment এর পর শুধু ওটা reload করা যায়
                const tsk = await getTaskById(taskId);
                setTask(tsk);
                setComments(tsk.comments || []);
                if (projectId) {
                    const [proj, mem] = await Promise.all([
                        getProjectById(projectId),
                        getProjectMembers(projectId).catch(() => []),
                    ]);
                    setProject(proj);
                    setMembers(mem);
                }
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to load task");
                setTask(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [taskId, projectId]);

    // comments বদলালে (নতুন এলে বা নিজে পাঠালে) নিচে scroll করি,
    // যাতে সর্বশেষ message সবসময় দেখা যায়।
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    // Real-time: এই task এর room এ join করি, নতুন comment এলে সাথে সাথে
    // list এ যোগ করি — কারো post করলে অন্যদের reload লাগে না।
    useEffect(() => {
        if (!taskId) return;

        // socket connect না থাকলে (edge case) join মিস না করতে connect করি
        if (!socket.connected) socket.connect();
        socket.emit("task:join", taskId);

        const onNewComment = (comment) => {
            if (comment?.taskId !== taskId) return;
            setComments((prev) => {
                // নিজের post করা comment fetchComments এ already যোগ হতে পারে —
                // id দেখে duplicate এড়াই
                if (prev.some((c) => c.id === comment.id)) return prev;
                return [...prev, comment];
            });
        };

        socket.on("comment:new", onNewComment);

        return () => {
            socket.emit("task:leave", taskId);
            socket.off("comment:new", onNewComment);
        };
    }, [taskId]);

    // textarea e type korle — @mention query detect kori
    const handleCommentChange = (e) => {
        const value = e.target.value;
        setNewComment(value);
        const caret = e.target.selectionStart;
        setMention(detectMentionQuery(value, caret));
    };

    // dropdown theke member select korle "@word" ke "@[Name](id) " diye replace kori
    const handleSelectMention = (member) => {
        if (!mention) return;
        const before = newComment.slice(0, mention.start);
        const after = newComment.slice(
            mention.start + 1 + mention.query.length // "@" + query
        );
        const inserted = `@[${member.user.name}](${member.user.id}) `;
        setNewComment(before + inserted + after);
        setMention(null);
        commentRef.current?.focus();
    };

    // dropdown e dekhanor jonno member filter (query onujayi, khali hole shob)
    const mentionCandidates =
        mention === null
            ? []
            : members
                  .filter((m) =>
                      m.user?.name
                          ?.toLowerCase()
                          .includes(mention.query.toLowerCase())
                  )
                  .slice(0, 6);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setPosting(true);
        try {
            // createComment saved comment টা ফেরত দেয় — সেটা সাথে সাথে নিজের
            // list এ যোগ করি। এতে socket কাজ করুক বা না করুক, নিজের comment
            // সবসময় দেখা যায় (reload লাগে না)। অন্যরা socket broadcast দিয়ে পায়।
            const saved = await createComment(taskId, newComment.trim());
            if (saved) {
                setComments((prev) =>
                    prev.some((c) => c.id === saved.id) ? prev : [...prev, saved]
                );
            }
            setNewComment("");
            toast.success("Comment added");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to add comment");
        } finally {
            setPosting(false);
        }
    };

    if (loading) return <div className="text-gray-500 dark:text-zinc-400 px-4 py-6">Loading task details...</div>;
    if (!task) return <div className="text-red-500 px-4 py-6">Task not found.</div>;

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-6 sm:p-4 text-gray-900 dark:text-zinc-100 max-w-6xl mx-auto">
            {/* Left: Comments / Chatbox */}
            <div className="w-full lg:w-2/3">
                <div className="p-5 rounded-md  border border-gray-300 dark:border-zinc-800  flex flex-col lg:h-[80vh]">
                    <h2 className="text-base font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                        <MessageCircle className="size-5" /> Task Discussion ({comments.length})
                    </h2>

                    <div className="flex-1 md:overflow-y-scroll no-scrollbar">
                        {comments.length > 0 ? (
                            <div className="flex flex-col gap-4 mb-6 mr-2">
                                {comments.map((comment) => (
                                    <div key={comment.id} className={`sm:max-w-4/5 dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-900 border border-gray-300 dark:border-zinc-700 p-3 rounded-md ${comment.user?.id === currentUser?.id ? "ml-auto" : "mr-auto"}`} >
                                        <div className="flex items-center gap-2 mb-1 text-sm text-gray-500 dark:text-zinc-400">
                                            <img src={comment.user.image} alt="avatar" className="size-5 rounded-full" />
                                            <span className="font-medium text-gray-900 dark:text-white">{comment.user.name}</span>
                                            <span className="text-xs text-gray-400 dark:text-zinc-600">
                                                • {format(new Date(comment.createdAt), "dd MMM yyyy, HH:mm")}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-900 dark:text-zinc-200 whitespace-pre-wrap">{renderCommentContent(comment.content)}</p>
                                    </div>
                                ))}
                                {/* scroll target — সর্বশেষ message এর ঠিক নিচে */}
                                <div ref={bottomRef} />
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-zinc-500 mb-4 text-sm">No comments yet. Be the first!</p>
                        )}
                    </div>

                    {/* Add Comment */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                        <div className="relative w-full">
                            {/* @mention dropdown — query thakle candidate member dekhai */}
                            {mention !== null && mentionCandidates.length > 0 && (
                                <div className="absolute bottom-full mb-1 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg overflow-hidden">
                                    {mentionCandidates.map((m) => (
                                        <button
                                            key={m.user.id}
                                            type="button"
                                            onClick={() => handleSelectMention(m)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                        >
                                            <img src={m.user.image} alt="" className="size-5 rounded-full" />
                                            <span className="truncate">{m.user.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <textarea
                                ref={commentRef}
                                value={newComment}
                                onChange={handleCommentChange}
                                onKeyDown={(e) => {
                                    // mention dropdown khola thakle Enter = kichu na (select korte dei)
                                    if (e.key === "Enter" && !e.shiftKey && mention === null) {
                                        e.preventDefault();
                                        handleAddComment();
                                    }
                                    if (e.key === "Escape") setMention(null);
                                }}
                                placeholder="Write a comment... use @ to mention (Enter to send)"
                                className="w-full dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md p-2 text-sm text-gray-900 dark:text-zinc-200 resize-none focus:outline-none focus:ring-1 focus:ring-primary-600"
                                rows={3}
                            />
                        </div>
                        <button onClick={handleAddComment} disabled={posting} className="bg-gradient-to-l from-primary-500 to-primary-600 shadow-brand transition-colors text-white text-sm px-5 py-2 rounded disabled:opacity-60" >
                            {posting ? "Posting..." : "Post"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Task + Project Info */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
                {/* Task Info */}
                <div className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 ">
                    <div className="mb-3">
                        <h1 className="text-lg font-medium text-gray-900 dark:text-zinc-100">{task.title}</h1>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-300 text-xs">
                                {task.status}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-300 text-xs">
                                {task.type}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-green-200 dark:bg-emerald-900 text-green-900 dark:text-emerald-300 text-xs">
                                {task.priority}
                            </span>
                        </div>
                    </div>

                    {task.description && (
                        <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed mb-4">{task.description}</p>
                    )}

                    <hr className="border-zinc-200 dark:border-zinc-700 my-3" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-zinc-300">
                        <div className="flex items-center gap-2">
                            <img src={task.assignee?.image} className="size-5 rounded-full" alt="avatar" />
                            {task.assignee?.name || "Unassigned"}
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="size-4 text-gray-500 dark:text-zinc-500" />
                            Due : {task.dueDate ? format(new Date(task.dueDate), "dd MMM yyyy") : "-"}
                        </div>
                    </div>
                </div>

                {/* Checklist / Subtasks */}
                <TaskSubtasks taskId={taskId} />

                {/* Attachments */}
                <TaskAttachments taskId={taskId} />

                {/* Project Info */}
                {project && (
                    <div className="p-4 rounded-md bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-gray-300 dark:border-zinc-800 ">
                        <p className="text-xl font-medium mb-4">Project Details</p>
                        <h2 className="text-gray-900 dark:text-zinc-100 flex items-center gap-2"> <PenIcon className="size-4" /> {project.name}</h2>
                        {project.startDate && (
                            <p className="text-xs mt-3">Project Start Date: {format(new Date(project.startDate), "dd MMM yyyy")}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-zinc-400 mt-3">
                            <span>Status: {project.status}</span>
                            <span>Priority: {project.priority}</span>
                            <span>Progress: {project.progress}%</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskDetails;
