import Notification from "../models/Notification.js";
import { emitToUser } from "./socket.js";

export const createNotification = async (userId, title, message) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message
    });
    console.log(`🔔 Notification dispatched to ${userId}: ${title}`);
    emitToUser(userId, "notification", notification);
  } catch (error) {
    console.error("Failed to create notification log:", error.message);
  }
};
