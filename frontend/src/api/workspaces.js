import api from "./client";

export async function getWorkspaces() {
  const response = await api.get("/workspaces/");
  return response.data;
}

export async function createWorkspace(name) {
  const response = await api.post("/workspaces/", { name });
  return response.data;
}