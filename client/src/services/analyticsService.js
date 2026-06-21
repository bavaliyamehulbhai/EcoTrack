import api from "./api";

export const getCategoryAnalytics = async () => {
  const response = await api.get("/analytics/category");
  return response.data;
};

export const getTrendAnalytics = async () => {
  const response = await api.get("/analytics/trend");
  return response.data;
};

export const getMonthlyAnalytics = async () => {
  const response = await api.get("/analytics/monthly");
  return response.data;
};
