import apiClient from "./apiClient";

export const getTasks = (config = {}) =>
  apiClient.get("/tasks", { ...config, requiresAuth: true });

export const createTask = (taskData, config = {}) =>
  apiClient.post("/tasks", taskData, { ...config, requiresAuth: true });

export const updateTask = (id, taskData, config = {}) =>
  apiClient.put(`/tasks/${id}`, taskData, {
    ...config,
    requiresAuth: true,
  });

export const deleteTask = (id, config = {}) =>
  apiClient.delete(`/tasks/${id}`, { ...config, requiresAuth: true });
