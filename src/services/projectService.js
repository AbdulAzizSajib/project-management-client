import api from "./api";

/*
==================================================================
  PROJECT-RELATED PLAIN SERVICES
==================================================================
  এগুলো শুধু এক পেজে লাগে (ProjectDetails/Team) — তাই Redux slice
  বানাইনি, সরাসরি function। পেজে useState দিয়ে result রাখলেই হবে।
==================================================================
*/

// ---- single project ----
export const getProjectById = (id) =>
    api.get(`/projects/${id}`).then((r) => r.data?.data);

export const updateProject = (id, data) =>
    api.patch(`/projects/${id}`, data).then((r) => r.data?.data);

export const deleteProject = (id) =>
    api.delete(`/projects/${id}`).then((r) => r.data);

// ---- project members ----
export const getProjectMembers = (projectId) =>
    api.get(`/projects/${projectId}/members`).then((r) => r.data?.data || []);

// memberId = userId, role = "LEAD" | "MEMBER"
export const addProjectMember = (projectId, memberId, role = "MEMBER") =>
    api
        .post(`/projects/${projectId}/members`, { memberId, role })
        .then((r) => r.data?.data);

export const removeProjectMember = (projectId, userId) =>
    api.delete(`/projects/${projectId}/members/${userId}`).then((r) => r.data);

// ---- project dashboard (stats) ----
export const getProjectDashboard = (projectId) =>
    api.get(`/projects/${projectId}/dashboard`).then((r) => r.data?.data);