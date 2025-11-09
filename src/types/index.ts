export interface User {
  id: string;
  username: string;
  password: string;
  role: "admin" | "employee";
  name: string;
  email: string;
  department?: string;
}

export interface FinanceRecord {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
  description: string;
  createdBy: string;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  checkIn?: string;
  checkOut?: string;
  checkInLocation?: Location;
  checkOutLocation?: Location;
  date: string;
  status: "present" | "late" | "absent" | "checked-in";
  hoursWorked?: number;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestDate: string;
  adminComments?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: () => boolean;
}

export interface DataContextType {
  // Finance
  financeRecords: FinanceRecord[];
  addFinanceRecord: (record: Omit<FinanceRecord, "id">) => void;
  updateFinanceRecord: (id: string, record: Partial<FinanceRecord>) => void;
  deleteFinanceRecord: (id: string) => void;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  checkIn: (userId: string, location?: Location) => void;
  checkOut: (userId: string, location?: Location) => void;
  getAttendanceByUser: (userId: string) => AttendanceRecord[];
  removeTodayAttendance: (userId: string) => void;
  getTodayAttendance: (userId: string) => AttendanceRecord | undefined;
  getWorkingHours: (userId: string, date: string) => number;

  // Leave
  leaveRequests: LeaveRequest[];
  submitLeaveRequest: (
    request: Omit<LeaveRequest, "id" | "requestDate" | "status">
  ) => void;
  updateLeaveStatus: (
    id: string,
    status: "approved" | "rejected",
    comments?: string
  ) => void;
  getLeaveByUser: (userId: string) => LeaveRequest[];
}
