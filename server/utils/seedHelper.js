import CarbonRecord from "../models/CarbonRecord.js";
import User from "../models/User.js";
import Goal from "../models/Goal.js";
import UserAction from "../models/UserAction.js";
import Action from "../models/Action.js";
import bcrypt from "bcryptjs";

export const seedCarbonRecordsForUser = async (userId) => {
  try {
    const count = await CarbonRecord.countDocuments({ userId });
    if (count < 5) {
      const records = [];
      const now = new Date();
      // Seed 8 records per user to hit total database counts cleanly
      for (let i = 8; i >= 1; i--) {
        const recordDate = new Date(now.getTime() - i * 3 * 24 * 60 * 60 * 1000);
        
        const transport = Math.round((8 + Math.random() * 15) * 10) / 10;
        const electricity = Math.round((4 + Math.random() * 12) * 10) / 10;
        const food = Math.round((2 + Math.random() * 5) * 10) / 10;
        const waste = Math.round((1 + Math.random() * 3) * 10) / 10;
        const water = Math.round((2 + Math.random() * 6) * 10) / 10;
        
        const totalCarbon = Math.round((transport + electricity + food + waste + water) * 10) / 10;

        records.push({
          userId,
          transport,
          electricity,
          food,
          waste,
          water,
          totalCarbon,
          createdAt: recordDate,
          updatedAt: recordDate
        });
      }
      await CarbonRecord.insertMany(records);
      console.log(`🟢 Seeded carbon history records for user: ${userId}`);
    }
  } catch (error) {
    console.error("Error seeding carbon records:", error.message);
  }
};

export const seedGoalsForUser = async (userId) => {
  try {
    const count = await Goal.countDocuments({ userId });
    if (count === 0) {
      await Goal.create([
        {
          userId,
          title: "Reduce Travel Carbon",
          targetCarbon: 15,
          deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          status: "Active"
        },
        {
          userId,
          title: "Energy Efficiency Plan",
          targetCarbon: 10,
          deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: "Completed"
        }
      ]);
      console.log(`🎯 Seeded target goals for user: ${userId}`);
    }
  } catch (error) {
    console.error("Error seeding goals:", error.message);
  }
};

export const seedActionsForUser = async (userId) => {
  try {
    const count = await UserAction.countDocuments({ userId });
    if (count === 0) {
      const actions = await Action.find();
      if (actions.length > 0) {
        const logs = [];
        const now = new Date();
        // Seed 10 completions per user to hit total database counts
        for (let i = 0; i < 10; i++) {
          const randomAction = actions[Math.floor(Math.random() * actions.length)];
          logs.push({
            userId,
            actionId: randomAction._id,
            completedDate: new Date(now.getTime() - i * 2.5 * 24 * 60 * 60 * 1000)
          });
        }
        await UserAction.insertMany(logs);
        console.log(`⚡ Seeded completion logs for user: ${userId}`);
      }
    }
  } catch (error) {
    console.error("Error seeding actions:", error.message);
  }
};

export const seedDemoUsers = async () => {
  try {
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Seed admin user if it doesn't exist
    const adminExists = await User.findOne({ email: "admin@gmail.com" });
    if (!adminExists) {
      const createdAdmin = await User.create({
        name: "Admin User",
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "admin",
        points: 500,
        streak: 10,
        badges: ["Earth Guardian"]
      });
      console.log(`👤 Created admin user: Admin User`);
      await seedCarbonRecordsForUser(createdAdmin._id);
      await seedGoalsForUser(createdAdmin._id);
      await seedActionsForUser(createdAdmin._id);
    }

    const demoUsers = [
      { name: "Rahul", email: "rahul@gmail.com", points: 380, streak: 8, badges: ["Eco Warrior"] },
      { name: "Priya", email: "priya@gmail.com", points: 290, streak: 12, badges: ["Green Champion"] },
      { name: "Aman", email: "aman@gmail.com", points: 210, streak: 4, badges: ["Eco Beginner"] },
      { name: "Sneha", email: "sneha@gmail.com", points: 150, streak: 6, badges: ["Eco Beginner"] },
      { name: "Karan", email: "karan@gmail.com", points: 90, streak: 2, badges: ["Eco Beginner"] },
      { name: "Riya", email: "riya@gmail.com", points: 120, streak: 3, badges: ["Eco Beginner"] },
      { name: "Dev", email: "dev@gmail.com", points: 310, streak: 11, badges: ["Green Champion"] },
      { name: "Harsh", email: "harsh@gmail.com", points: 260, streak: 7, badges: ["Eco Warrior"] },
      { name: "Snehal", email: "snehal@gmail.com", points: 80, streak: 1, badges: ["Eco Beginner"] },
      { name: "Rupa", email: "rupa@gmail.com", points: 170, streak: 5, badges: ["Eco Warrior"] }
    ];

    for (const demo of demoUsers) {
      const exists = await User.findOne({ email: demo.email });
      if (!exists) {
        const createdUser = await User.create({
          name: demo.name,
          email: demo.email,
          password: hashedPassword,
          points: demo.points,
          streak: demo.streak,
          badges: demo.badges
        });
        console.log(`👤 Created demo user: ${demo.name}`);
        // Seed associated data
        await seedCarbonRecordsForUser(createdUser._id);
        await seedGoalsForUser(createdUser._id);
        await seedActionsForUser(createdUser._id);
      }
    }
  } catch (error) {
    console.error("Error seeding demo users:", error.message);
  }
};
