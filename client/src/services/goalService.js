import api from "./api";

export const createGoal = async (data) => {
  const response = await api.post("/goals/", data);
  return response.data;
};

export const getGoals = async () => {
  const response = await api.get("/goals/");
  return response.data;
};

export const updateGoal = async (id, data) => {
  const response = await api.put(`/goals/${id}`, data);
  return response.data;
};

export const deleteGoal = async (id) => {
  const response = await api.delete(`/goals/${id}`);
  return response.data;
};

export const getGoalAnalytics = async () => {
  const response = await api.get("/goals/analytics");
  return response.data;
};
