import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
    getTodayAttendance as apiGetTodayAttendance,
    getAttendanceHistory,
    checkIn as apiCheckIn,
    checkOut as apiCheckOut,
    getLeaveRequests,
    submitLeaveRequest as apiSubmitLeaveRequest,
    updateLeaveRequest,
} from "../lib/api";

const DataContext = createContext(undefined);

// Comprehensive sample finance data
const sampleFinanceData = [
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

const generateSampleAttendance = () => {
    const records = [];
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

    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        users.forEach((user, index) => {
            const rand = Math.random();
            let status;
            let checkIn;
            let checkOut;
            let hoursWorked;

            if (rand < 0.05) {
                status = "absent";
            } else if (rand < 0.1) {
                status = "late";
                const checkInHour = 9 + Math.floor(Math.random() * 2);
                checkIn = `${dateStr}T${checkInHour.toString().padStart(2, "0")}:${Math.floor(
                    Math.random() * 60
                )
                    .toString()
                    .padStart(2, "0")}:00`;
                const checkOutHour = 17 + Math.floor(Math.random() * 2);
                checkOut = `${dateStr}T${checkOutHour.toString().padStart(2, "0")}:${Math.floor(
                    Math.random() * 60
                )
                    .toString()
                    .padStart(2, "0")}:00`;
                hoursWorked = checkOutHour - checkInHour + Math.random();
            } else {
                status = "present";
                const checkInHour = 8 + Math.floor(Math.random() * 1);
                checkIn = `${dateStr}T${checkInHour.toString().padStart(2, "0")}:${Math.floor(
                    Math.random() * 60
                )
                    .toString()
                    .padStart(2, "0")}:00`;
                const checkOutHour = 17 + Math.floor(Math.random() * 2);
                checkOut = `${dateStr}T${checkOutHour.toString().padStart(2, "0")}:${Math.floor(
                    Math.random() * 60
                )
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
                    hoursWorked: hoursWorked ? Math.round(hoursWorked * 100) / 100 : undefined,
                });
            }
        });
    }

    return records;
};

const sampleLeaveData = [
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

export const DataProvider = ({ children }) => {
    const [financeRecords, setFinanceRecords] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);

    const { token, user } = useAuth();

    useEffect(() => {
        // finance and leave data remain local/demo for now
        const storedFinance = localStorage.getItem("financeRecords");
        if (storedFinance) {
            setFinanceRecords(JSON.parse(storedFinance));
        } else {
            setFinanceRecords(sampleFinanceData);
            localStorage.setItem("financeRecords", JSON.stringify(sampleFinanceData));
        }

        const storedLeave = localStorage.getItem("leaveRequests");
        if (storedLeave) {
            setLeaveRequests(JSON.parse(storedLeave));
        } else {
            setLeaveRequests(sampleLeaveData);
            localStorage.setItem("leaveRequests", JSON.stringify(sampleLeaveData));
        }
    }, []);

    // Load attendance from backend when authenticated, otherwise fallback to localStorage/demo
    useEffect(() => {
        const loadAttendance = async () => {
            if (token) {
                try {
                    const data = await getAttendanceHistory();
                    // map backend attendance to local shape used by UI
                    const mapped = data.map((r) => ({
                        id: r._id,
                        userId: r.userId,
                        userName: user?.name || 'Unknown',
                        checkIn: r.checkIn,
                        checkOut: r.checkOut,
                        date: r.checkIn ? new Date(r.checkIn).toISOString().split('T')[0] : undefined,
                        status: r.status,
                        hoursWorked: r.hoursWorked,
                    }));
                    setAttendanceRecords(mapped);
                    return;
                } catch (err) {
                    console.warn('Failed to load attendance from server, falling back to local');
                }
            }

            const storedAttendance = localStorage.getItem('attendanceRecords');
            if (storedAttendance) {
                setAttendanceRecords(JSON.parse(storedAttendance));
            } else {
                const sampleAttendance = generateSampleAttendance();
                setAttendanceRecords(sampleAttendance);
                localStorage.setItem('attendanceRecords', JSON.stringify(sampleAttendance));
            }
        };

        loadAttendance();
    }, [token, user?.name]);

    const addFinanceRecord = (record) => {
        const newRecord = { ...record, id: Date.now().toString() };
        const updated = [...financeRecords, newRecord];
        setFinanceRecords(updated);
        localStorage.setItem("financeRecords", JSON.stringify(updated));
    };

    const updateFinanceRecord = (id, record) => {
        const updated = financeRecords.map((r) => (r.id === id ? { ...r, ...record } : r));
        setFinanceRecords(updated);
        localStorage.setItem("financeRecords", JSON.stringify(updated));
    };

    const deleteFinanceRecord = (id) => {
        const updated = financeRecords.filter((r) => r.id !== id);
        setFinanceRecords(updated);
        localStorage.setItem("financeRecords", JSON.stringify(updated));
    };

    const checkIn = async (userId, location, notes) => {
        const today = new Date().toISOString().split("T")[0];

        // If backend available, call checkin endpoint
        if (token) {
            try {
                const r = await apiCheckIn(location, notes);
                const mapped = {
                    id: r._id,
                    userId: r.userId,
                    userName: user?.name || 'Unknown',
                    checkIn: r.checkIn,
                    date: r.checkIn ? new Date(r.checkIn).toISOString().split('T')[0] : today,
                    status: r.status,
                };
                const updated = [...attendanceRecords.filter((a) => !(a.userId === userId && a.date === today)), mapped];
                setAttendanceRecords(updated);
                return;
            } catch (err) {
                console.warn('Checkin failed against server, falling back to local');
            }
        }

        // Local fallback
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const localUser = users.find((u) => u.id === userId);
        const existingRecord = attendanceRecords.find((r) => r.userId === userId && r.date === today);

        if (!existingRecord) {
            const checkInTime = new Date();
            const isLate = checkInTime.getHours() > 9; // Assuming 9 AM is the standard time

            const newRecord = {
                id: Date.now().toString(),
                userId,
                userName: localUser?.name || "Unknown",
                checkIn: new Date().toISOString(),
                checkInLocation: location,
                date: today,
                status: isLate ? "late" : "present",
            };

            const updated = [...attendanceRecords, newRecord];
            setAttendanceRecords(updated);
            localStorage.setItem("attendanceRecords", JSON.stringify(updated));
        }
    };

    const checkOut = async (userId, location, notes) => {
        const today = new Date().toISOString().split("T")[0];

        // If backend available, find today's record id and call checkout
        if (token) {
            try {
                // find a local mapping to backend id
                const todayRecord = attendanceRecords.find((r) => r.userId === userId && r.date === today && !r.checkOut);
                if (todayRecord && todayRecord.id) {
                    const r = await apiCheckOut(todayRecord.id, location);
                    const updated = attendanceRecords.map((a) => (a.id === r._id ? { ...a, checkOut: r.checkOut, hoursWorked: r.hoursWorked } : a));
                    setAttendanceRecords(updated);
                    return;
                }
            } catch (err) {
                console.warn('Checkout failed against server, falling back to local');
            }
        }

        // Local fallback
        const updated = attendanceRecords.map((r) => {
            if (r.userId === userId && r.date === today && !r.checkOut) {
                const checkInTime = r.checkIn ? new Date(r.checkIn) : new Date();
                const checkOutTime = new Date();
                const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

                return {
                    ...r,
                    checkOut: new Date().toISOString(),
                    checkOutLocation: location,
                    status: "present",
                    hoursWorked: Math.round(hoursWorked * 100) / 100,
                };
            }
            return r;
        });

        setAttendanceRecords(updated);
        localStorage.setItem("attendanceRecords", JSON.stringify(updated));
    };

    const getAttendanceByUser = (userId) => {
        return attendanceRecords.filter((r) => r.userId === userId);
    };

    const getTodayAttendance = (userId) => {
        const today = new Date().toISOString().split("T")[0];
        return attendanceRecords.find((r) => r.userId === userId && r.date === today);
    };

    const getWorkingHours = (userId, date) => {
        const record = attendanceRecords.find((r) => r.userId === userId && r.date === date);
        return record?.hoursWorked || 0;
    };

    const submitLeaveRequest = (request) => {
        const newRequest = {
            ...request,
            id: Date.now().toString(),
            requestDate: new Date().toISOString().split("T")[0],
            status: "pending",
        };

        const updated = [...leaveRequests, newRequest];
        setLeaveRequests(updated);
        localStorage.setItem("leaveRequests", JSON.stringify(updated));
    };

    const updateLeaveStatus = (id, status, comments) => {
        const updated = leaveRequests.map((r) => (r.id === id ? { ...r, status, adminComments: comments } : r));
        setLeaveRequests(updated);
        localStorage.setItem("leaveRequests", JSON.stringify(updated));
    };

    const getLeaveByUser = (userId) => {
        return leaveRequests.filter((r) => r.userId === userId);
    };

    const removeTodayAttendance = (userId) => {
        const today = new Date().toISOString().split("T")[0];
        const updated = attendanceRecords.filter((r) => !(r.userId === userId && r.date === today));
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
