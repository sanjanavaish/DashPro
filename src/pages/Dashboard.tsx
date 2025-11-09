import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Finance from './Finance';
import Attendance from './Attendance';
import Leave from './Leave';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Clock, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

const DashboardHome: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { financeRecords, attendanceRecords, leaveRequests } = useData();

  // Calculate finance summary
  const totalIncome = financeRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const totalExpenses = financeRecords
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const balance = totalIncome - totalExpenses;

  // Calculate attendance summary
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.filter(r => r.date === today);
  const presentToday = todayAttendance.filter(r => r.status === 'present' || r.status === 'late').length;

  // Calculate leave summary
  const pendingLeaves = leaveRequests.filter(r => r.status === 'pending').length;
  const userLeaves = leaveRequests.filter(r => r.userId === user?.id && r.status === 'pending').length;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Here's what's happening in your company today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {isAdmin() && (
          <>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">${totalIncome.toLocaleString()}</div>
                <p className="text-xs opacity-80">+12% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
                <p className="text-xs opacity-80">-5% from last month</p>
              </CardContent>
            </Card>

            <Card className={`${balance >= 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'} text-white`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <DollarSign className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">${balance.toLocaleString()}</div>
                <p className="text-xs opacity-80">{balance >= 0 ? 'Profit' : 'Loss'}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                <Users className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{presentToday}</div>
                <p className="text-xs opacity-80">Employees checked in</p>
              </CardContent>
            </Card>
          </>
        )}

        {!isAdmin() && (
          <>
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Attendance</CardTitle>
                <Clock className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {todayAttendance.find(r => r.userId === user?.id) ? 'Checked In' : 'Not Checked In'}
                </div>
                <p className="text-xs opacity-80">Today's status</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
                <Calendar className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{userLeaves}</div>
                <p className="text-xs opacity-80">Awaiting approval</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {isAdmin() && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Calendar className="mr-2 h-5 w-5" />
                Pending Leave Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingLeaves > 0 ? (
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-orange-600">{pendingLeaves}</p>
                  <p className="text-sm text-gray-600">Requests awaiting your review</p>
                </div>
              ) : (
                <p className="text-gray-500">No pending leave requests</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Clock className="mr-2 h-5 w-5" />
                Today's Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Present:</span>
                  <span className="font-medium text-green-600">{todayAttendance.filter(r => r.status === 'present').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Late:</span>
                  <span className="font-medium text-orange-600">{todayAttendance.filter(r => r.status === 'late').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'finance':
        return <Finance />;
      case 'attendance':
        return <Attendance />;
      case 'leave':
        return <Leave />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 overflow-auto lg:ml-0">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;