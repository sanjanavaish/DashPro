import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

const Leave = () => {
    const { user, isAdmin } = useAuth();
    const { leaveRequests, submitLeaveRequest, updateLeaveStatus, getLeaveByUser } = useData();
    const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');

    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: ''
    });

    const filteredRequests = useMemo(() => {
        const requests = isAdmin() ? leaveRequests : getLeaveByUser(user?.id || '');
        return filterStatus === 'all'
            ? requests
            : requests.filter(r => r.status === filterStatus);
    }, [leaveRequests, user?.id, isAdmin, filterStatus, getLeaveByUser]);

    const stats = useMemo(() => {
        const requests = isAdmin() ? leaveRequests : getLeaveByUser(user?.id || '');
        return {
            total: requests.length,
            pending: requests.filter(r => r.status === 'pending').length,
            approved: requests.filter(r => r.status === 'approved').length,
            rejected: requests.filter(r => r.status === 'rejected').length
        };
    }, [leaveRequests, user?.id, isAdmin, getLeaveByUser]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.startDate || !formData.endDate || !formData.reason) return;

        submitLeaveRequest({
            userId: user?.id || '',
            userName: user?.name || '',
            startDate: formData.startDate,
            endDate: formData.endDate,
            reason: formData.reason
        });

        setFormData({ startDate: '', endDate: '', reason: '' });
        setIsRequestDialogOpen(false);
    };

    const handleStatusUpdate = (requestId, status, comments) => {
        updateLeaveStatus(requestId, status, comments);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>;
            case 'approved':
                return <Badge className="bg-green-100 text-green-800 text-xs">Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800 text-xs">Rejected</Badge>;
            default:
                return <Badge variant="secondary" className="text-xs">Unknown</Badge>;
        }
    };

    const calculateDays = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    return (
        <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leave Management</h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                        {isAdmin() ? 'Review and manage employee leave requests' : 'Submit and track your leave requests'}
                    </p>
                </div>
                {!isAdmin() && (
                    <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                Request Leave
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Submit Leave Request</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="reason">Reason</Label>
                                    <Textarea
                                        id="reason"
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        placeholder="Please provide a reason for your leave request"
                                        required
                                    />
                                </div>

                                {formData.startDate && formData.endDate && (
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            Total days: {calculateDays(formData.startDate, formData.endDate)}
                                        </p>
                                    </div>
                                )}

                                <Button type="submit" className="w-full">Submit Request</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Total Requests</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Approved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.approved}</div>
                        <p className="text-xs text-muted-foreground">Approved requests</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Rejected</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejected}</div>
                        <p className="text-xs text-muted-foreground">Rejected requests</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <Label className="text-sm sm:text-base">Filter by Status:</Label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Leave Requests Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                        {isAdmin() ? 'All Leave Requests' : 'My Leave Requests'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="border-b">
                                        {isAdmin() && <th className="text-left p-2 text-xs sm:text-sm">Employee</th>}
                                        <th className="text-left p-2 text-xs sm:text-sm hidden sm:table-cell">Request Date</th>
                                        <th className="text-left p-2 text-xs sm:text-sm">Start Date</th>
                                        <th className="text-left p-2 text-xs sm:text-sm hidden md:table-cell">End Date</th>
                                        <th className="text-left p-2 text-xs sm:text-sm">Days</th>
                                        <th className="text-left p-2 text-xs sm:text-sm hidden lg:table-cell">Reason</th>
                                        <th className="text-left p-2 text-xs sm:text-sm">Status</th>
                                        {isAdmin() && <th className="text-left p-2 text-xs sm:text-sm">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map((request) => (
                                        <tr key={request.id} className="border-b hover:bg-gray-50">
                                            {isAdmin() && <td className="p-2 font-medium text-xs sm:text-sm">{request.userName}</td>}
                                            <td className="p-2 text-xs sm:text-sm hidden sm:table-cell">{new Date(request.requestDate).toLocaleDateString()}</td>
                                            <td className="p-2 text-xs sm:text-sm">{new Date(request.startDate).toLocaleDateString()}</td>
                                            <td className="p-2 text-xs sm:text-sm hidden md:table-cell">{new Date(request.endDate).toLocaleDateString()}</td>
                                            <td className="p-2 text-xs sm:text-sm">{calculateDays(request.startDate, request.endDate)}</td>
                                            <td className="p-2 text-xs sm:text-sm max-w-xs truncate hidden lg:table-cell" title={request.reason}>{request.reason}</td>
                                            <td className="p-2">{getStatusBadge(request.status)}</td>
                                            {isAdmin() && (
                                                <td className="p-2">
                                                    {request.status === 'pending' && (
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            <Button size="sm" onClick={() => handleStatusUpdate(request.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-xs">Approve</Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(request.id, 'rejected')} className="text-xs">Reject</Button>
                                                        </div>
                                                    )}
                                                    {request.adminComments && (
                                                        <p className="text-xs text-gray-600 mt-1">Comments: {request.adminComments}</p>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {filteredRequests.length === 0 && (
                        <div className="text-center py-8 text-gray-500">No leave requests found</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Leave;
