import Notification from "../models/Notification.js";
import asyncHandler from "express-async-handler";

// GET /api/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const list = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json(list);
});

// PUT /api/notifications/:id
export const markNotificationRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  if (id === "all") {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return res.json({ message: "All notifications marked as read" });
  }

  const item = await Notification.findOne({ _id: id, userId });
  if (!item) {
    return res.status(404).json({ message: "Notification not found" });
  }

  item.isRead = true;
  await item.save();

  res.json({ message: "Notification marked as read", notification: item });
});

// POST /api/notifications
export const createNotificationDirectly = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { title, message } = req.body;

  const notif = await Notification.create({
    userId,
    title,
    message
  });

  res.status(201).json(notif);
});

// DELETE /api/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const item = await Notification.findOne({ _id: id, userId });
  if (!item) {
    return res.status(404).json({ message: "Notification not found" });
  }

  await item.deleteOne();
  res.json({ message: "Notification deleted successfully" });
});
