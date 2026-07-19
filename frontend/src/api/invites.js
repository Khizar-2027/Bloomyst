import api from "./client";

export async function createInvite(workspaceId, email, role) {
  const response = await api.post(`/workspaces/${workspaceId}/invites/`, { email, role });
  return response.data;
}

export async function acceptInvite(token) {
  const response = await api.post(`/invites/${token}/accept`);
  return response.data;
}