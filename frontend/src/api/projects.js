import api from "./client";

export async function getProjects(workspaceId) {
  const response = await api.get(`/workspaces/${workspaceId}/projects/`);
  return response.data;
}

export async function createProject(workspaceId, name, description) {
  const response = await api.post(`/workspaces/${workspaceId}/projects/`, {
    name,
    description,
  });
  return response.data;
}