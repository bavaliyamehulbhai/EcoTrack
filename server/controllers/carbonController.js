import CarbonRecord from "../models/CarbonRecord.js";
import calculateCarbon from "../utils/carbonCalculator.js";
import asyncHandler from "express-async-handler";

export const createCarbonRecord = asyncHandler(async (req, res) => {
  const result = calculateCarbon(req.body);

  const record = await CarbonRecord.create({
    userId: req.user.id,
    transport: result.transport,
    electricity: result.electricity,
    food: result.food,
    waste: result.waste,
    water: result.water,
    totalCarbon: result.totalCarbon
  });

  res.status(201).json({
    success: true,
    record
  });
});

export const getCarbonHistory = asyncHandler(async (req, res) => {
  const records = await CarbonRecord.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  res.json(records);
});

export const getDashboardData = asyncHandler(async (req, res) => {
  const records = await CarbonRecord.find({ userId: req.user.id }).lean();

  const totalCarbon = records.reduce((acc, curr) => acc + curr.totalCarbon, 0);

  const avgCarbon = records.length ? totalCarbon / records.length : 0;

  res.json({
    totalRecords: records.length,
    totalCarbon,
    avgCarbon
  });
});
