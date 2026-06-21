import mongoose from "mongoose";
import Action from "../models/Action.js";
import User from "../models/User.js";
import { seedCarbonRecordsForUser, seedDemoUsers, seedGoalsForUser, seedActionsForUser } from "../utils/seedHelper.js";

const seedDatabaseExtras = async () => {
  console.log("🌱 Running database demo seeders...");
  await seedDemoUsers();
  
  const users = await User.find();
  for (const u of users) {
    await seedCarbonRecordsForUser(u._id);
    await seedGoalsForUser(u._id);
    await seedActionsForUser(u._id);
  }
  console.log("🌱 Database seeding checks completed.");
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Auto-seed Eco Actions if empty
    const count = await Action.countDocuments();
    if (count === 0) {
      const defaultActions = [
        {
          title: "Ride Bicycle",
          description: "Commute using a bicycle to reduce vehicle carbon footprint.",
          points: 20
        },
        {
          title: "Plant Tree",
          description: "Plant a sapling/tree to offset greenhouse gases.",
          points: 50
        },
        {
          title: "Recycle Plastic",
          description: "Recycle plastic packaging or containers properly.",
          points: 15
        },
        {
          title: "Public Transport",
          description: "Commute using buses, trains, or carpools.",
          points: 25
        },
        {
          title: "Reusable Bottle",
          description: "Refuse single-use plastics and carry a water flask.",
          points: 10
        }
      ];
      await Action.insertMany(defaultActions);
      console.log("Default Eco Actions seeded successfully!");
    }

    // Run custom seeders for leaderboard and carbon history
    await seedDatabaseExtras();

  } catch (error) {
    console.warn("\n⚠️ MongoDB Atlas Connection Error:", error.message);
    console.warn("👉 Common fix: Whitelist your current IP address in your MongoDB Atlas console: https://cloud.mongodb.com/");
    console.warn("👉 Alternatively: Ensure you are connected to the internet, or change your MONGO_URI in the server's .env file.\n");

    try {
      console.log("🔌 Attempting connection to local MongoDB fallback (mongodb://127.0.0.1:27017/ecotrack)...");
      await mongoose.connect("mongodb://127.0.0.1:27017/ecotrack");
      console.log("🟢 Fallback Connected: Local MongoDB is active!");
      
      const count = await Action.countDocuments();
      if (count === 0) {
        const defaultActions = [
          {
            title: "Ride Bicycle",
            description: "Commute using a bicycle to reduce vehicle carbon footprint.",
            points: 20
          },
          {
            title: "Plant Tree",
            description: "Plant a sapling/tree to offset greenhouse gases.",
            points: 50
          },
          {
            title: "Recycle Plastic",
            description: "Recycle plastic packaging or containers properly.",
            points: 15
          },
          {
            title: "Public Transport",
            description: "Commute using buses, trains, or carpools.",
            points: 25
          },
          {
            title: "Reusable Bottle",
            description: "Refuse single-use plastics and carry a water flask.",
            points: 10
          }
        ];
        await Action.insertMany(defaultActions);
        console.log("Default Eco Actions seeded successfully!");
      }

      // Run custom seeders for leaderboard and carbon history
      await seedDatabaseExtras();

    } catch (fallbackError) {
      console.error("❌ Local MongoDB fallback connection also failed:", fallbackError.message);
      console.log("\n💡 Server is still running. Modify your MONGO_URI in .env and save the file to trigger an automatic nodemon reload!\n");
    }
  }
};

export default connectDB;