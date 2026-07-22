import api from "./api";

/*
==================================================================
  TASK SERVICES (Redux ছাড়া — শুধু ProjectDetails/TaskDetails পেজে লাগে)
==================================================================
  পেজে useState দিয়ে result রাখো। উদাহরণ:
    const [tasks, setTasks] = useState([]);
    useEffect(() => { getProjectTasks(projectId).then(setTasks); }, [projectId]);

  ⚠️ backend contract (নিশ্চিত):
    - সব field camelCase: dueDate, assigneeId, projectId
    - dueDate = ISO datetime string (যেমন new Date(x).toISOString())
    - প্রতিটা task এ nested assignee {id,name,email,image}
    - status বদলাতে আলাদা endpoint (/tasks/:id/status), transition rule আছে:
      TODO→IN_PROGRESS→IN_REVIEW→DONE (+ পিছনে এক ধাপ)
==================================================================
*/

// ---- list: একটা project এর সব task (filters optional) ----
// filters = { status, type, priority, assigneeId }
export const getProjectTasks = (projectId, filters = {}) =>
    api
        .get(`/projects/${projectId}/tasks`, { params: filters })
        .then((r) => r.data?.data || []);

// ---- create ----
export const createTask = (projectId, data) =>
    api.post(`/projects/${projectId}/tasks`, data).then((r) => r.data?.data);

// ---- update (status বাদে সব) ----
export const updateTask = (id, data) =>
    api.patch(`/tasks/${id}`, data).then((r) => r.data?.data);

// ---- status বদলানো (আলাদা endpoint) ----
export const updateTaskStatus = (id, status) =>
    api.patch(`/tasks/${id}/status`, { status }).then((r) => r.data?.data);

// ---- assign / unassign (null = unassign) ----
export const assignTask = (id, assigneeId) =>
    api.patch(`/tasks/${id}/assign`, { assigneeId }).then((r) => r.data?.data);

// ---- delete ----
export const deleteTask = (id) =>
    api.delete(`/tasks/${id}`).then((r) => r.data);

// ---- single task (full detail: assignee, creator, comments, activities) ----
export const getTaskById = (id) =>
    api.get(`/tasks/${id}`).then((r) => r.data?.data);

// ---- task activities (full log) ----
export const getTaskActivities = (id) =>
    api.get(`/tasks/${id}/activities`).then((r) => r.data?.data || []);

// ---- comments ----
export const getComments = (taskId) =>
    api.get(`/tasks/${taskId}/comments`).then((r) => r.data?.data || []);

export const createComment = (taskId, content) =>
    api.post(`/tasks/${taskId}/comments`, { content }).then((r) => r.data?.data);

export const updateComment = (commentId, content) =>
    api.patch(`/comments/${commentId}`, { content }).then((r) => r.data?.data);

export const deleteComment = (commentId) =>
    api.delete(`/comments/${commentId}`).then((r) => r.data);

// ---- attachments ----
// file = File object (input type=file theke)। multipart/form-data e pathai।
export const uploadAttachment = (taskId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
        .post(`/tasks/${taskId}/attachments`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data?.data);
};

export const getTaskAttachments = (taskId) =>
    api.get(`/tasks/${taskId}/attachments`).then((r) => r.data?.data || []);

export const deleteAttachment = (attachmentId) =>
    api.delete(`/attachments/${attachmentId}`).then((r) => r.data);

// ---- subtasks / checklist ----
export const getSubtasks = (taskId) =>
    api.get(`/tasks/${taskId}/subtasks`).then((r) => r.data?.data || []);

export const createSubtask = (taskId, title) =>
    api.post(`/tasks/${taskId}/subtasks`, { title }).then((r) => r.data?.data);

// payload = { title?, isCompleted? }
export const updateSubtask = (subtaskId, payload) =>
    api.patch(`/subtasks/${subtaskId}`, payload).then((r) => r.data?.data);

export const deleteSubtask = (subtaskId) =>
    api.delete(`/subtasks/${subtaskId}`).then((r) => r.data);