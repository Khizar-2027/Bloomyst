import api from "./client";

export async function getTasks(projectId) {
  const response = await api.get(`/projects/${projectId}/tasks/`);
  return response.data;
}

export async function createTask(projectId, title, priority) {
  const response = await api.post(`/projects/${projectId}/tasks/`, {
    title,
    priority,
  });
  return response.data;
}

export async function updateTask(projectId, taskId, updates) {
  const response = await api.patch(`/projects/${projectId}/tasks/${taskId}`, updates);
  return response.data;
}

export async function deleteTask(projectId, taskId) {
  await api.delete(`/projects/${projectId}/tasks/${taskId}`);
}