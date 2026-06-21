import api from "./api";

export const getDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const blockUser = async (id) => {
  const response = await api.put(`/admin/block/${id}`);
  return response.data;
};

export const getCarbonRecords = async () => {
  const response = await api.get("/admin/carbon-records");
  return response.data;
};

export const getGoals = async () => {
  const response = await api.get("/admin/goals");
  return response.data;
};

export const getActions = async () => {
  const response = await api.get("/admin/actions");
  return response.data;
};

export const getTopUsers = async () => {
  const response = await api.get("/admin/top-users");
  return response.data;
};

export const getCommunity = async () => {
  const response = await api.get("/admin/community");
  return response.data;
};

export const bulkBlockUsers = async (userIds) => {
  const response = await api.post("/admin/users/bulk-block", { userIds });
  return response.data;
};

export const bulkDeleteUsers = async (userIds) => {
  const response = await api.post("/admin/users/bulk-delete", { userIds });
  return response.data;
};

export const getAuditLogs = async () => {
  const response = await api.get("/admin/audit-logs");
  return response.data;
};
