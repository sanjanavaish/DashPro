import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    DollarSign,
    Clock,
    Calendar,
    LogOut,
    User,
    Building2,
    Menu,
    X,
} from "lucide-react";

const Sidebar = ({ activeSection, onSectionChange }) => {
    const { user, logout, isAdmin } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            adminOnly: false,
        },
        { id: "finance", label: "Finance", icon: DollarSign, adminOnly: true },
        { id: "attendance", label: "Attendance", icon: Clock, adminOnly: false },
        {
            id: "leave",
            label: "Leave Management",
            icon: Calendar,
            adminOnly: false,
        },
    ];

    const filteredMenuItems = menuItems.filter((item) => !item.adminOnly || isAdmin());

    const handleSectionChange = (section) => {
        onSectionChange(section);
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="bg-white shadow-lg"
                >
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            <div
                className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-slate-900 text-white h-screen flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
            >
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Company Portal</h1>
                            <p className="text-sm text-slate-400">Management Dashboard</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-700 rounded-full">
                            <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-2">
                        {filteredMenuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.id}>
                                    <Button
                                        variant={activeSection === item.id ? "secondary" : "ghost"}
                                        className={`w-full justify-start text-left ${activeSection === item.id
                                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                                : "text-slate-300 hover:text-white hover:bg-slate-800"
                                            }`}
                                        onClick={() => handleSectionChange(item.id)}
                                    >
                                        <Icon className="mr-3 h-4 w-4" />
                                        {item.label}
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800" onClick={logout}>
                        <LogOut className="mr-3 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
