import React, { createContext, useContext, useState, useEffect } from "react";
import {
  FinanceRecord,
  AttendanceRecord,
  LeaveRequest,
  DataContextType,
  User,
  Location,
} from "../types";

const DataContext = createContext<DataContextType | undefined>(undefined);

// Comprehensive sample finance data
const sampleFinanceData: FinanceRecord[] = [
  // November Income
  {
    id: "1",
    type: "income",
    amount: 50000,
    category: "Sales Revenue",
    date: "2024-11-01",
    description: "Q4 Sales Revenue - Product A",
    createdBy: "1",
  },
  {
    id: "2",
    type: "income",
    amount: 35000,
    category: "Consulting",
    date: "2024-11-03",
    description: "Consulting services for Client X",
    createdBy: "1",
  },
  {
    id: "3",
    type: "income",
    amount: 28000,
    category: "Sales Revenue",
    date: "2024-11-05",
    description: "Product B sales",
    createdBy: "1",
  },
  {
    id: "4",
    type: "income",
    amount: 15000,
    category: "Subscription",
    date: "2024-11-07",
    description: "Monthly subscription renewals",
    createdBy: "1",
  },
  {
    id: "5",
    type: "income",
    amount: 42000,
    category: "Sales Revenue",
    date: "2024-11-08",
    description: "Enterprise client contract",
    createdBy: "1",
  },
  // November Expenses
  {
    id: "6",
    type: "expense",
    amount: 15000,
    category: "Office Supplies",
    date: "2024-11-02",
    description: "Monthly office supplies and equipment",
    createdBy: "1",
  },
  {
    id: "7",
    type: "expense",
    amount: 8500,
    category: "Marketing",
    date: "2024-11-04",
    description: "Social media advertising campaign",
    createdBy: "1",
  },
  {
    id: "8",
    type: "expense",
    amount: 12000,
    category: "Utilities",
    date: "2024-11-05",
    description: "Office rent and utilities",
    createdBy: "1",
  },
  {
    id: "9",
    type: "expense",
    amount: 5000,
    category: "Software",
    date: "2024-11-06",
    description: "Software licenses and subscriptions",
    createdBy: "1",
  },
  {
    id: "10",
    type: "expense",
    amount: 3500,
    category: "Travel",
    date: "2024-11-07",
    description: "Business travel expenses",
    createdBy: "1",
  },
  {
    id: "11",
    type: "expense",
    amount: 6000,
    category: "Training",
    date: "2024-11-08",
    description: "Employee training and development",
    createdBy: "1",
  },
  {
    id: "12",
    type: "expense",
    amount: 4200,
    category: "Maintenance",
    date: "2024-11-09",
    description: "Office equipment maintenance",
    createdBy: "1",
  },
];

// Sample attendance data for multiple employees
const generateSampleAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const users = [
    { id: "2", name: "John Doe" },
    { id: "3", name: "Jane Smith" },
    { id: "4", name: "Michael Chen" },
    { id: "5", name: "Sarah Johnson" },
    { id: "6", name: "David Wilson" },
    { id: "7", name: "Emily Brown" },
    { id: "8", name: "Robert Garcia" },
    { id: "9", name: "Lisa Martinez" },
    { id: "10", name: "James Anderson" },
    { id: "11", name: "Maria Rodriguez" },
    { id: "12", name: "William Lee" },
    { id: "13", name: "Jennifer Taylor" },
    { id: "14", name: "Thomas White" },
    { id: "15", name: "Patricia Harris" },
    { id: "16", name: "Daniel Clark" },
    { id: "17", name: "Linda Lewis" },
  ];

  // Generate attendance for the past 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    users.forEach((user, index) => {
      // Randomize attendance (90% present, 5% late, 5% absent)
      const rand = Math.random();
      let status: "present" | "late" | "absent";
      let checkIn: string | undefined;
      let checkOut: string | undefined;
      let hoursWorked: number | undefined;

      if (rand < 0.05) {
        status = "absent";
      } else if (rand < 0.1) {
        status = "late";
        const checkInHour = 9 + Math.floor(Math.random() * 2); // 9-10 AM (late)
        checkIn = `${dateStr}T${checkInHour
          .toString()
          .padStart(2, "0")}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, "0")}:00`;
        const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
        checkOut = `${dateStr}T${checkOutHour
          .toString()
          .padStart(2, "0")}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, "0")}:00`;
        hoursWorked = checkOutHour - checkInHour + Math.random();
      } else {
        status = "present";
        const checkInHour = 8 + Math.floor(Math.random() * 1); // 8-9 AM (on time)
        checkIn = `${dateStr}T${checkInHour
          .toString()
          .padStart(2, "0")}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, "0")}:00`;
        const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
        checkOut = `${dateStr}T${checkOutHour
          .toString()
          .padStart(2, "0")}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, "0")}:00`;
        hoursWorked = checkOutHour - checkInHour + Math.random();
      }

      if (status !== "absent") {
        records.push({
          id: `att-${i}-${index}`,
          userId: user.id,
          userName: user.name,
          checkIn,
          checkOut,
          date: dateStr,
          status,
          hoursWorked: hoursWorked
            ? Math.round(hoursWorked * 100) / 100
            : undefined,
        });
      }
    });
  }

  return records;
};

// Sample leave requests
const sampleLeaveData: LeaveRequest[] = [
  {
    id: "leave-1",
    userId: "2",
    userName: "John Doe",
    startDate: "2024-11-15",
    endDate: "2024-11-17",
    reason: "Family vacation",
    status: "approved",
    requestDate: "2024-11-01",
    adminComments: "Approved - Enjoy your vacation!",
  },
  {
    id: "leave-2",
    userId: "3",
    userName: "Jane Smith",
    startDate: "2024-11-20",
    endDate: "2024-11-22",
    reason: "Medical appointment",
    status: "pending",
    requestDate: "2024-11-05",
  },
  {
    id: "leave-3",
    userId: "4",
    userName: "Michael Chen",
    startDate: "2024-11-12",
    endDate: "2024-11-12",
    reason: "Personal matter",
    status: "approved",
    requestDate: "2024-11-03",
    adminComments: "Approved",
  },
  {
    id: "leave-4",
    userId: "5",
    userName: "Sarah Johnson",
    startDate: "2024-11-25",
    endDate: "2024-11-29",
    reason: "Thanksgiving holiday",
    status: "pending",
    requestDate: "2024-11-06",
  },
  {
    id: "leave-5",
    userId: "6",
    userName: "David Wilson",
    startDate: "2024-11-10",
    endDate: "2024-11-11",
    reason: "Sick leave",
    status: "approved",
    requestDate: "2024-11-09",
    adminComments: "Get well soon!",
  },
  {
    id: "leave-6",
    userId: "7",
    userName: "Emily Brown",
    startDate: "2024-12-01",
    endDate: "2024-12-05",
    reason: "Annual leave",
    status: "pending",
    requestDate: "2024-11-07",
  },
  {
    id: "leave-7",
    userId: "8",
    userName: "Robert Garcia",
    startDate: "2024-11-08",
    endDate: "2024-11-08",
    reason: "Doctor appointment",
    status: "rejected",
    requestDate: "2024-11-07",
    adminComments: "Please reschedule - critical project deadline",
  },
  {
    id: "leave-8",
    userId: "9",
    userName: "Lisa Martinez",
    startDate: "2024-11-18",
    endDate: "2024-11-19",
    reason: "Conference attendance",
    status: "approved",
    requestDate: "2024-11-04",
    adminComments: "Approved - Great learning opportunity",
  },
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    // Initialize data from localStorage
    const storedFinance = localStorage.getItem("financeRecords");
    if (storedFinance) {
      setFinanceRecords(JSON.parse(storedFinance));
    } else {
      setFinanceRecords(sampleFinanceData);
      localStorage.setItem("financeRecords", JSON.stringify(sampleFinanceData));
    }

    const storedAttendance = localStorage.getItem("attendanceRecords");
    if (storedAttendance) {
      setAttendanceRecords(JSON.parse(storedAttendance));
    } else {
      const sampleAttendance = generateSampleAttendance();
      setAttendanceRecords(sampleAttendance);
      localStorage.setItem(
        "attendanceRecords",
        JSON.stringify(sampleAttendance)
      );
    }

    const storedLeave = localStorage.getItem("leaveRequests");
    if (storedLeave) {
      setLeaveRequests(JSON.parse(storedLeave));
    } else {
      setLeaveRequests(sampleLeaveData);
      localStorage.setItem("leaveRequests", JSON.stringify(sampleLeaveData));
    }
  }, []);

  // Finance methods
  const addFinanceRecord = (record: Omit<FinanceRecord, "id">) => {
    const newRecord = { ...record, id: Date.now().toString() };
    const updated = [...financeRecords, newRecord];
    setFinanceRecords(updated);
    localStorage.setItem("financeRecords", JSON.stringify(updated));
  };

  const updateFinanceRecord = (id: string, record: Partial<FinanceRecord>) => {
    const updated = financeRecords.map((r) =>
      r.id === id ? { ...r, ...record } : r
    );
    setFinanceRecords(updated);
    localStorage.setItem("financeRecords", JSON.stringify(updated));
  };

  const deleteFinanceRecord = (id: string) => {
    const updated = financeRecords.filter((r) => r.id !== id);
    setFinanceRecords(updated);
    localStorage.setItem("financeRecords", JSON.stringify(updated));
  };

  // Attendance methods
  const checkIn = (userId: string, location?: Location) => {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();
    const users = JSON.parse(localStorage.getItem("users") || "[]") as User[];
    const user = users.find((u: User) => u.id === userId);

    const existingRecord = attendanceRecords.find(
      (r) => r.userId === userId && r.date === today
    );

    if (!existingRecord) {
      const checkInTime = new Date();
      const isLate = checkInTime.getHours() > 9; // Assuming 9 AM is the standard time

      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        userId,
        userName: user?.name || "Unknown",
        checkIn: now,
        checkInLocation: location,
        date: today,
        status: isLate ? ("late" as const) : ("present" as const),
      };

      const updated = [...attendanceRecords, newRecord];
      setAttendanceRecords(updated);
      localStorage.setItem("attendanceRecords", JSON.stringify(updated));
    }
  };

  const checkOut = (userId: string, location?: Location) => {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();

    const updated = attendanceRecords.map((r) => {
      if (r.userId === userId && r.date === today && !r.checkOut) {
        const checkInTime = new Date(r.checkIn!);
        const checkOutTime = new Date(now);
        const hoursWorked =
          (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

        return {
          ...r,
          checkOut: now,
          checkOutLocation: location,
          status: "present" as const,
          hoursWorked: Math.round(hoursWorked * 100) / 100,
        } as AttendanceRecord;
      }
      return r;
    });

    setAttendanceRecords(updated);
    localStorage.setItem("attendanceRecords", JSON.stringify(updated));
  };

  const getAttendanceByUser = (userId: string) => {
    return attendanceRecords.filter((r) => r.userId === userId);
  };

  const getTodayAttendance = (userId: string) => {
    const today = new Date().toISOString().split("T")[0];
    return attendanceRecords.find(
      (r) => r.userId === userId && r.date === today
    );
  };

  const getWorkingHours = (userId: string, date: string) => {
    const record = attendanceRecords.find(
      (r) => r.userId === userId && r.date === date
    );
    return record?.hoursWorked || 0;
  };

  // Leave methods
  const submitLeaveRequest = (
    request: Omit<LeaveRequest, "id" | "requestDate" | "status">
  ) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: Date.now().toString(),
      requestDate: new Date().toISOString().split("T")[0],
      status: "pending",
    };

    const updated = [...leaveRequests, newRequest];
    setLeaveRequests(updated);
    localStorage.setItem("leaveRequests", JSON.stringify(updated));
  };

  const updateLeaveStatus = (
    id: string,
    status: "approved" | "rejected",
    comments?: string
  ) => {
    const updated = leaveRequests.map((r) =>
      r.id === id ? { ...r, status, adminComments: comments } : r
    );
    setLeaveRequests(updated);
    localStorage.setItem("leaveRequests", JSON.stringify(updated));
  };

  const getLeaveByUser = (userId: string) => {
    return leaveRequests.filter((r) => r.userId === userId);
  };

  // Development helper: remove today's attendance for a user (useful to re-test check-in/out)
  const removeTodayAttendance = (userId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = attendanceRecords.filter(
      (r) => !(r.userId === userId && r.date === today)
    );
    setAttendanceRecords(updated);
    localStorage.setItem("attendanceRecords", JSON.stringify(updated));
  };

  return (
    <DataContext.Provider
      value={{
        financeRecords,
        addFinanceRecord,
        updateFinanceRecord,
        deleteFinanceRecord,
        attendanceRecords,
        checkIn,
        checkOut,
        getAttendanceByUser,
        getTodayAttendance,
        getWorkingHours,
        removeTodayAttendance,
        leaveRequests,
        submitLeaveRequest,
        updateLeaveStatus,
        getLeaveByUser,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
