import api from "./api";

export const getNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data;
};

export const markAllRead = async () => {
  const response = await api.put("/notifications/all", {});
  return response.data;
};

export const markSingleRead = async (id) => {
  const response = await api.put(`/notifications/${id}`, {});
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};
