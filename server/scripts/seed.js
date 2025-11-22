import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";

dotenv.config();

// Default users from AuthContext
const defaultUsers = [
  {
    username: "admin",
    password: "admin123",
    role: "admin",
    name: "Admin User",
    email: "admin@company.com",
    department: "Management",
  },
  {
    username: "john.doe",
    password: "password123",
    role: "employee",
    name: "John Doe",
    email: "john.doe@company.com",
    department: "Engineering",
  },
  {
    username: "jane.smith",
    password: "password123",
    role: "employee",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    department: "Marketing",
  },
  {
    username: "michael.chen",
    password: "password123",
    role: "employee",
    name: "Michael Chen",
    email: "michael.chen@company.com",
    department: "Engineering",
  },
  {
    username: "sarah.johnson",
    password: "password123",
    role: "employee",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    department: "Sales",
  },
  {
    username: "david.wilson",
    password: "password123",
    role: "employee",
    name: "David Wilson",
    email: "david.wilson@company.com",
    department: "Finance",
  },
  {
    username: "emily.brown",
    password: "password123",
    role: "employee",
    name: "Emily Brown",
    email: "emily.brown@company.com",
    department: "HR",
  },
];

const generateSampleAttendance = async (userMap) => {
  const records = [];
  const users = Object.values(userMap);

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    for (const user of users) {
      if (user.role === "employee") {
        // Skip attendance for admin
        const rand = Math.random();
        let status, checkIn, checkOut, hoursWorked;

        if (rand < 0.05) {
          // 5% absent
          status = "absent";
        } else if (rand < 0.1) {
          // 5% late
          status = "late";
          const baseDate = new Date(dateStr);
          const checkInHour = 9 + Math.floor(Math.random() * 2); // 9-10 AM
          checkIn = new Date(
            baseDate.setHours(checkInHour, Math.floor(Math.random() * 60), 0)
          );
          const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
          checkOut = new Date(
            baseDate.setHours(checkOutHour, Math.floor(Math.random() * 60), 0)
          );
          hoursWorked =
            Math.round(
              ((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)) *
                100
            ) / 100;
        } else {
          // 90% present
          status = "present";
          const baseDate = new Date(dateStr);
          const checkInHour = 8 + Math.floor(Math.random() * 1); // 8-9 AM
          checkIn = new Date(
            baseDate.setHours(checkInHour, Math.floor(Math.random() * 60), 0)
          );
          const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
          checkOut = new Date(
            baseDate.setHours(checkOutHour, Math.floor(Math.random() * 60), 0)
          );
          hoursWorked =
            Math.round(
              ((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)) *
                100
            ) / 100;
        }

        const location = {
          lat: 40.7128 + (Math.random() - 0.5) * 0.01,
          lng: -74.006 + (Math.random() - 0.5) * 0.01,
          accuracy: Math.floor(Math.random() * 20) + 5,
        };

        records.push({
          userId: user._id,
          date: new Date(dateStr),
          status,
          checkIn: status !== "absent" ? checkIn : undefined,
          checkOut: status !== "absent" ? checkOut : undefined,
          hoursWorked: status !== "absent" ? hoursWorked : undefined,
          checkInLocation: status !== "absent" ? location : undefined,
          checkOutLocation:
            status !== "absent"
              ? {
                  ...location,
                  lat: location.lat + (Math.random() - 0.5) * 0.001,
                  lng: location.lng + (Math.random() - 0.5) * 0.001,
                }
              : undefined,
        });
      }
    }
  }

  return records;
};

const seedDatabase = async () => {
  let connection;
  try {
    const MONGO_URI =
      process.env.MONGO_URI || "mongodb://localhost:27017/dashpro";
    connection = await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    console.log("Cleared existing data");

    // Insert users with hashed passwords
    const userMap = {};
    for (const userData of defaultUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        username: userData.username,
        name: userData.name,
        email: userData.email,
        passwordHash: hashedPassword,
        role: userData.role,
        department: userData.department,
      });
      userMap[user.email] = user;
      console.log(`Created user: ${user.name} (${user.email})`);
    }

    // Generate and insert attendance records
    const attendanceRecords = await generateSampleAttendance(userMap);
    await Attendance.insertMany(attendanceRecords);
    console.log(`Created ${attendanceRecords.length} attendance records`);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.disconnect();
      console.log("Disconnected from MongoDB");
    }
  }
};

// Run the seeder
seedDatabase();
