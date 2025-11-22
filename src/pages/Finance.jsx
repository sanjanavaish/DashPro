import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Plus, TrendingUp, TrendingDown, Download, Filter } from 'lucide-react';

const Finance = () => {
    const { user, isAdmin } = useAuth();
    const { financeRecords, addFinanceRecord, deleteFinanceRecord } = useData();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const [formData, setFormData] = useState({
        type: 'income',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const filteredRecords = useMemo(() => {
        return financeRecords.filter(record => {
            const categoryMatch = filterCategory === 'all' || record.category === filterCategory;
            const typeMatch = filterType === 'all' || record.type === filterType;
            const dateMatch = (!dateRange.start || record.date >= dateRange.start) && (!dateRange.end || record.date <= dateRange.end);
            return categoryMatch && typeMatch && dateMatch;
        });
    }, [financeRecords, filterCategory, filterType, dateRange]);

    const totalIncome = filteredRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = filteredRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
    const balance = totalIncome - totalExpenses;

    const categories = [...new Set(financeRecords.map(r => r.category))];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.category || !formData.date) return;

        addFinanceRecord({
            type: formData.type,
            amount: parseFloat(formData.amount),
            category: formData.category,
            date: formData.date,
            description: formData.description,
            createdBy: user?.id || ''
        });

        setFormData({ type: 'income', amount: '', category: '', date: new Date().toISOString().split('T')[0], description: '' });
        setIsAddDialogOpen(false);
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
        const csvData = filteredRecords.map(record => [record.date, record.type, record.category, record.amount, record.description]);

        const csvContent = [headers, ...csvData].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Finance Dashboard</h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">Track income, expenses, and financial performance</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button onClick={exportToCSV} variant="outline" className="flex-1 sm:flex-none">
                        <Download className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Export CSV</span>
                        <span className="sm:hidden">Export</span>
                    </Button>
                    {isAdmin() && (
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex-1 sm:flex-none">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Record
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add Financial Record</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="type">Type</Label>
                                        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="income">Income</SelectItem>
                                                <SelectItem value="expense">Expense</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="amount">Amount</Label>
                                        <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" required />
                                    </div>

                                    <div>
                                        <Label htmlFor="category">Category</Label>
                                        <Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Sales Revenue, Office Supplies" required />
                                    </div>

                                    <div>
                                        <Label htmlFor="date">Date</Label>
                                        <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" />
                                    </div>

                                    <Button type="submit" className="w-full">Add Record</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        <TrendingUp className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">${totalIncome.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className={`${balance >= 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'} text-white`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                        <DollarSign className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">${balance.toLocaleString()}</div>
                        <p className="text-xs opacity-80">{balance >= 0 ? 'Profit' : 'Loss'}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center text-base sm:text-lg">
                        <Filter className="mr-2 h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <Label>Type</Label>
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="income">Income</SelectItem>
                                    <SelectItem value="expense">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Category</Label>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(category => (
                                        <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Start Date</Label>
                            <Input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
                        </div>

                        <div>
                            <Label>End Date</Label>
                            <Input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Records Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Financial Records</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2 text-xs sm:text-sm">Date</th>
                                        <th className="text-left p-2 text-xs sm:text-sm">Type</th>
                                        <th className="text-left p-2 text-xs sm:text-sm hidden sm:table-cell">Category</th>
                                        <th className="text-left p-2 text-xs sm:text-sm">Amount</th>
                                        <th className="text-left p-2 text-xs sm:text-sm hidden md:table-cell">Description</th>
                                        {isAdmin() && <th className="text-left p-2 text-xs sm:text-sm">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((record) => (
                                        <tr key={record.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2 text-xs sm:text-sm">{new Date(record.date).toLocaleDateString()}</td>
                                            <td className="p-2">
                                                <Badge variant={record.type === 'income' ? 'default' : 'destructive'} className="text-xs">{record.type}</Badge>
                                            </td>
                                            <td className="p-2 text-xs sm:text-sm hidden sm:table-cell">{record.category}</td>
                                            <td className="p-2 font-medium text-xs sm:text-sm"><span className={record.type === 'income' ? 'text-green-600' : 'text-red-600'}>${record.amount.toLocaleString()}</span></td>
                                            <td className="p-2 text-xs sm:text-sm hidden md:table-cell max-w-xs truncate">{record.description}</td>
                                            {isAdmin() && (
                                                <td className="p-2">
                                                    <Button variant="outline" size="sm" onClick={() => deleteFinanceRecord(record.id)} className="text-xs">Delete</Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {filteredRecords.length === 0 && (
                        <div className="text-center py-8 text-gray-500">No financial records found</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Finance;
