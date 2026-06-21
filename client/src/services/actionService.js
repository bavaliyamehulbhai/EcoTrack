import api from "./api";

export const getActions = async () => {
  const response = await api.get("/actions");
  return response.data;
};

export const completeAction = async (actionId) => {
  const response = await api.post("/actions/complete", { actionId });
  return response.data;
};

export const getStats = async () => {
  const response = await api.get("/actions/stats");
  return response.data;
};

export const buyStreakFreeze = async () => {
  const response = await api.post("/actions/buy-streak-freeze");
  return response.data;
};
