const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "API request failed");
  }

  return response.json();
}

export async function login(username, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function logout() {
  localStorage.removeItem("token");
}

export async function checkIn(location) {
  return request("/attendance/checkin", {
    method: "POST",
    body: JSON.stringify({ location }),
  });
}

export async function checkOut(attendanceId, location) {
  return request(`/attendance/checkout/${attendanceId}`, {
    method: "POST",
    body: JSON.stringify({ location }),
  });
}

export async function getTodayAttendance() {
  return request("/attendance/today");
}

export async function getAttendanceHistory(startDate, endDate) {
  let url = `/attendance/history`;
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (params.toString()) url += `?${params.toString()}`;
  return request(url);
}

export async function getLeaveRequests() {
  return request("/leave");
}

export async function submitLeaveRequest(startDate, endDate, reason) {
  return request("/leave", {
    method: "POST",
    body: JSON.stringify({ startDate, endDate, reason }),
  });
}

export async function updateLeaveRequest(id, status, comments) {
  return request(`/leave/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status, comments }),
  });
}

export async function getUserProfile() {
  return request("/auth/profile");
}

export async function getAllUsers() {
  return request("/auth/users");
}

export default {
  login,
  logout,
  checkIn,
  checkOut,
  getTodayAttendance,
  getAttendanceHistory,
  getLeaveRequests,
  submitLeaveRequest,
  updateLeaveRequest,
  getUserProfile,
  getAllUsers,
};
