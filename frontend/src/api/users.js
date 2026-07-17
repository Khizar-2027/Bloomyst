import api from "./client";

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/users/me");
  return response.data;
}