/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 * @property {string} password
 * @property {"admin" | "employee"} role
 * @property {string} name
 * @property {string} email
 * @property {string} [department]
 */

/**
 * @typedef {Object} FinanceRecord
 * @property {string} id
 * @property {"income" | "expense"} type
 * @property {number} amount
 * @property {string} category
 * @property {string} date
 * @property {string} description
 * @property {string} createdBy
 */

/**
 * @typedef {Object} Location
 * @property {number} lat
 * @property {number} lng
 * @property {string} [address]
 */

/**
 * @typedef {Object} AttendanceRecord
 * @property {string} id
 * @property {string} userId
 * @property {string} userName
 * @property {string} [checkIn]
 * @property {string} [checkOut]
 * @property {Location} [checkInLocation]
 * @property {Location} [checkOutLocation]
 * @property {string} date
 * @property {"present" | "late" | "absent" | "checked-in"} status
 * @property {number} [hoursWorked]
 * @property {string} [notes]
 */

/**
 * @typedef {Object} LeaveRequest
 * @property {string} id
 * @property {string} userId
 * @property {string} userName
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} reason
 * @property {"pending" | "approved" | "rejected"} status
 * @property {string} requestDate
 * @property {string} [adminComments]
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} user
 * @property {(username: string, password: string) => boolean} login
 * @property {() => void} logout
 * @property {() => boolean} isAdmin
 */

/**
 * @typedef {Object} DataContextType
 *
 * @property {FinanceRecord[]} financeRecords
 * @property {(record: Omit<FinanceRecord, "id">) => void} addFinanceRecord
 * @property {(id: string, record: Partial<FinanceRecord>) => void} updateFinanceRecord
 * @property {(id: string) => void} deleteFinanceRecord
 *
 * @property {AttendanceRecord[]} attendanceRecords
 * @property {(userId: string, location?: Location) => void} checkIn
 * @property {(userId: string, location?: Location) => void} checkOut
 * @property {(userId: string) => AttendanceRecord[]} getAttendanceByUser
 * @property {(userId: string) => void} removeTodayAttendance
 * @property {(userId: string) => AttendanceRecord|undefined} getTodayAttendance
 * @property {(userId: string, date: string) => number} getWorkingHours
 *
 * @property {LeaveRequest[]} leaveRequests
 * @property {(request: Omit<LeaveRequest, "id"|"requestDate"|"status">) => void} submitLeaveRequest
 * @property {(id: string, status: "approved"|"rejected", comments?: string) => void} updateLeaveStatus
 * @property {(userId: string) => LeaveRequest[]} getLeaveByUser
 */

// You can export for modular use (optional)
export {};
