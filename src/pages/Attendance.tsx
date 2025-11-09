import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { User } from "../types";

const Attendance: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const {
    attendanceRecords,
    checkIn,
    checkOut,
    getAttendanceByUser,
    removeTodayAttendance,
  } = useData();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedResetUser, setSelectedResetUser] = useState<string>("");

  // Get today's attendance for current user
  const today = new Date().toISOString().split("T")[0];
  const userTodayAttendance = attendanceRecords.find(
    (r) => r.userId === user?.id && r.date === today
  );

  // Filter attendance records
  const filteredRecords = useMemo(() => {
    if (isAdmin()) {
      return attendanceRecords.filter((r) => r.date === selectedDate);
    } else {
      return getAttendanceByUser(user?.id || "").filter(
        (r) => r.date === selectedDate
      );
    }
  }, [attendanceRecords, selectedDate, user?.id, isAdmin, getAttendanceByUser]);

  // Calculate statistics
  const stats = useMemo(() => {
    const records = isAdmin()
      ? attendanceRecords
      : getAttendanceByUser(user?.id || "");
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthlyRecords = records.filter((r) => r.date.startsWith(thisMonth));

    return {
      totalDays: monthlyRecords.length,
      presentDays: monthlyRecords.filter((r) => r.status === "present").length,
      lateDays: monthlyRecords.filter((r) => r.status === "late").length,
      avgHours:
        monthlyRecords.reduce((sum, r) => sum + (r.hoursWorked || 0), 0) /
          monthlyRecords.length || 0,
    };
  }, [attendanceRecords, user?.id, isAdmin, getAttendanceByUser]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("users");
      if (stored) {
        const parsed = JSON.parse(stored) as User[];
        setUsers(parsed);
        if (!selectedResetUser && parsed.length)
          setSelectedResetUser(parsed[0].id);
      }
    } catch (e) {
      console.warn("Could not load users from localStorage", e);
    }
  }, []);

  const getLocation = async (): Promise<{
    lat: number;
    lng: number;
  } | null> => {
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      );

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    } catch (error) {
      toast({
        title: "Location Error",
        description:
          "Could not get your location. Please enable location services.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;
    setLoading(true);
    try {
      console.debug("handleCheckIn invoked for user", user.id);
      const location = await getLocation();
      // call checkIn with location if available, otherwise call without
      if (location) {
        // some implementations expect only userId; using any to avoid TS errors
        // DataContext currently accepts only userId but will ignore extra arg at runtime
        checkIn(user.id, location as any);
      } else {
        checkIn(user.id);
      }
      toast({
        title: "Checked In Successfully",
        description: `Time: ${currentTime.toLocaleTimeString()}`,
      });
    } catch (error) {
      console.error("check-in error", error);
      toast({
        title: "Check-in Failed",
        description: "There was an error recording your check-in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user) return;
    setLoading(true);
    try {
      console.debug("handleCheckOut invoked for user", user.id);
      const location = await getLocation();
      if (location) {
        checkOut(user.id, location as any);
      } else {
        // still perform checkout even if location not available
        checkOut(user.id);
      }
      toast({
        title: "Checked Out Successfully",
        description: `Time: ${currentTime.toLocaleTimeString()}`,
      });
    } catch (error) {
      toast({
        title: "Check-out Failed",
        description: "There was an error recording your check-out",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-green-100 text-green-800 text-xs">Present</Badge>
        );
      case "late":
        return (
          <Badge className="bg-orange-100 text-orange-800 text-xs">Late</Badge>
        );
      case "absent":
        return (
          <Badge className="bg-red-100 text-red-800 text-xs">Absent</Badge>
        );
      case "checked-in":
        return (
          <Badge className="bg-blue-100 text-blue-800 text-xs">
            Checked In
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Unknown
          </Badge>
        );
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Attendance Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {isAdmin()
              ? "Monitor employee attendance and working hours"
              : "Track your attendance and working hours"}
          </p>
        </div>
      </div>

      {/* Admin reset control */}
      {isAdmin() && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-base sm:text-lg">
              Attendance Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <label className="text-sm">Select Employee:</label>
              <select
                value={selectedResetUser}
                onChange={(e) => setSelectedResetUser(e.target.value)}
                className="border rounded px-2 py-1"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.username})
                  </option>
                ))}
              </select>
              <Button
                variant="destructive"
                onClick={() => {
                  if (!selectedResetUser) return;
                  removeTodayAttendance(selectedResetUser);
                  toast({
                    title: "Today's attendance cleared for selected employee",
                  });
                }}
              >
                Reset Employee Today
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee Check-in/out Section */}
      {!isAdmin() && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Clock className="mr-2 h-5 w-5" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="text-3xl font-bold text-center">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2 w-full sm:w-auto">
                  {userTodayAttendance ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm text-gray-500">
                          {userTodayAttendance.checkInLocation
                            ? "Location recorded"
                            : "No location data"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            Check-in:{" "}
                            {userTodayAttendance.checkIn || "Not checked in"}
                          </Badge>
                          {userTodayAttendance.checkOut && (
                            <Badge variant="outline" className="text-xs">
                              Check-out: {userTodayAttendance.checkOut}
                            </Badge>
                          )}
                        </div>
                        {userTodayAttendance.hoursWorked && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs w-fit">
                            Hours worked:{" "}
                            {userTodayAttendance.hoursWorked.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <span className="text-sm sm:text-base">
                        Not checked in today
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={handleCheckIn}
                    className="flex-1 sm:flex-none"
                    disabled={loading || !!userTodayAttendance?.checkIn}
                  >
                    Check In
                  </Button>
                  <Button
                    onClick={handleCheckOut}
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    disabled={
                      loading ||
                      !userTodayAttendance?.checkIn ||
                      !!userTodayAttendance?.checkOut
                    }
                  >
                    Check Out
                  </Button>
                  {import.meta.env.DEV && user && (
                    <Button
                      variant="ghost"
                      className="ml-2 text-xs"
                      onClick={() => {
                        // remove today's attendance so developer can re-test
                        removeTodayAttendance(user.id);
                        toast({ title: "Today's attendance reset" });
                      }}
                    >
                      Reset Today
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              {isAdmin() ? "Total Employees" : "Days Worked"}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {isAdmin()
                ? new Set(attendanceRecords.map((r) => r.userId)).size
                : stats.totalDays}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Present Days
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {stats.presentDays}
            </div>
            <p className="text-xs text-muted-foreground">On time arrivals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Late Days
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">
              {stats.lateDays}
            </div>
            <p className="text-xs text-muted-foreground">Late arrivals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Avg Hours
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {stats.avgHours.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Per day</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Label htmlFor="date" className="text-sm sm:text-base">
              Select Date:
            </Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto"
            />
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {isAdmin() ? "All Employee Attendance" : "My Attendance Records"} -{" "}
            {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="border-b">
                    {isAdmin() && (
                      <th className="text-left p-2 text-xs sm:text-sm">
                        Employee
                      </th>
                    )}
                    <th className="text-left p-2 text-xs sm:text-sm hidden sm:table-cell">
                      Date
                    </th>
                    <th className="text-left p-2 text-xs sm:text-sm">
                      Check In
                    </th>
                    <th className="text-left p-2 text-xs sm:text-sm">
                      Check Out
                    </th>
                    <th className="text-left p-2 text-xs sm:text-sm hidden md:table-cell">
                      Hours
                    </th>
                    <th className="text-left p-2 text-xs sm:text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      {isAdmin() && (
                        <td className="p-2 font-medium text-xs sm:text-sm">
                          {record.userName}
                        </td>
                      )}
                      <td className="p-2 text-xs sm:text-sm hidden sm:table-cell">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="p-2 text-xs sm:text-sm">
                        {record.checkIn ? formatTime(record.checkIn) : "-"}
                      </td>
                      <td className="p-2 text-xs sm:text-sm">
                        {record.checkOut ? formatTime(record.checkOut) : "-"}
                      </td>
                      <td className="p-2 text-xs sm:text-sm hidden md:table-cell">
                        {record.hoursWorked
                          ? `${record.hoursWorked.toFixed(1)}h`
                          : "-"}
                      </td>
                      <td className="p-2">{getStatusBadge(record.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No attendance records found for this date
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
