import api from "./api";

export const getLeaderboard = async () => {
  const response = await api.get("/leaderboard/");
  return response.data;
};

export const getTopUsers = async () => {
  const response = await api.get("/leaderboard/top");
  return response.data;
};

export const getMyRank = async () => {
  const response = await api.get("/leaderboard/my-rank");
  return response.data;
};

export const getCommunityStats = async () => {
  const response = await api.get("/leaderboard/community-stats");
  return response.data;
};
