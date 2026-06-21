import api from "./api";

export const createCarbon = async (data) => {
  const response = await api.post("/carbon/calculate", data);
  return response.data;
};

export const getCarbonHistory = async () => {
  const response = await api.get("/carbon/history");
  return response.data;
};

export const getDashboardData = async () => {
  const response = await api.get("/carbon/dashboard");
  return response.data;
};
