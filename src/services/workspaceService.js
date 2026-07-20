import api from "./api";

/*
  Workspace member + invite + dashboard এর plain services।
  workspace/project এর মূল list Redux এ; এগুলো Team/Settings পেজে লাগে।
*/

// ---- workspace members (এখানে nested user আসে: {id,name,email,image,...}) ----
export const getWorkspaceMembers = (workspaceId) =>
    api.get(`/workspaces/${workspaceId}/members`).then((r) => r.data?.data || []);

export const addWorkspaceMember = (workspaceId, userId, role = "MEMBER") =>
    api
        .post(`/workspaces/${workspaceId}/members`, { userId, role })
        .then((r) => r.data?.data);

export const updateMemberRole = (workspaceId, userId, role) =>
    api
        .patch(`/workspaces/${workspaceId}/members/${userId}`, { role })
        .then((r) => r.data?.data);

export const removeWorkspaceMember = (workspaceId, userId) =>
    api.delete(`/workspaces/${workspaceId}/members/${userId}`).then((r) => r.data);

// ---- invite someone to the workspace (STEP 4-A) ----
export const inviteToWorkspace = (workspaceId, email, role = "MEMBER") =>
    api
        .post(`/workspaces/${workspaceId}/invitations`, { email, role })
        .then((r) => r.data?.data);

// ---- workspace dashboard (stats) ----
export const getWorkspaceDashboard = (workspaceId) =>
    api.get(`/workspaces/${workspaceId}/dashboard`).then((r) => r.data?.data);

// ---- update / delete workspace (multipart) ----
export const updateWorkspace = (workspaceId, formData) =>
    api
        .patch(`/workspaces/${workspaceId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data?.data);

export const deleteWorkspace = (workspaceId) =>
    api.delete(`/workspaces/${workspaceId}`).then((r) => r.data);