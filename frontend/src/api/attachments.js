import api from "./client";

export async function getAttachments(taskId) {
  const response = await api.get(`/tasks/${taskId}/attachments/`);
  return response.data;
}

export async function uploadAttachment(taskId, file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(`/tasks/${taskId}/attachments/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deleteAttachment(taskId, attachmentId) {
  await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
}