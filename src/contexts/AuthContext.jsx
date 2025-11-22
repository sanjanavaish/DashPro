import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

// Expanded default users for demo with diverse roles and departments
const defaultUsers = [
    {
        id: '1',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'Admin User',
        email: 'admin@company.com',
        department: 'Management'
    },
    {
        id: '2',
        username: 'john.doe',
        password: 'password123',
        role: 'employee',
        name: 'John Doe',
        email: 'john.doe@company.com',
        department: 'Engineering'
    },
    {
        id: '3',
        username: 'jane.smith',
        password: 'password123',
        role: 'employee',
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        department: 'Marketing'
    },
    {
        id: '4',
        username: 'michael.chen',
        password: 'password123',
        role: 'employee',
        name: 'Michael Chen',
        email: 'michael.chen@company.com',
        department: 'Engineering'
    },
    {
        id: '5',
        username: 'sarah.johnson',
        password: 'password123',
        role: 'employee',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        department: 'Sales'
    },
    {
        id: '6',
        username: 'david.wilson',
        password: 'password123',
        role: 'employee',
        name: 'David Wilson',
        email: 'david.wilson@company.com',
        department: 'Finance'
    },
    {
        id: '7',
        username: 'emily.brown',
        password: 'password123',
        role: 'employee',
        name: 'Emily Brown',
        email: 'emily.brown@company.com',
        department: 'HR'
    },
    {
        id: '8',
        username: 'robert.garcia',
        password: 'password123',
        role: 'employee',
        name: 'Robert Garcia',
        email: 'robert.garcia@company.com',
        department: 'Engineering'
    },
    {
        id: '9',
        username: 'lisa.martinez',
        password: 'password123',
        role: 'employee',
        name: 'Lisa Martinez',
        email: 'lisa.martinez@company.com',
        department: 'Marketing'
    },
    {
        id: '10',
        username: 'james.anderson',
        password: 'password123',
        role: 'employee',
        name: 'James Anderson',
        email: 'james.anderson@company.com',
        department: 'Sales'
    },
    {
        id: '11',
        username: 'maria.rodriguez',
        password: 'password123',
        role: 'employee',
        name: 'Maria Rodriguez',
        email: 'maria.rodriguez@company.com',
        department: 'Customer Support'
    },
    {
        id: '12',
        username: 'william.lee',
        password: 'password123',
        role: 'employee',
        name: 'William Lee',
        email: 'william.lee@company.com',
        department: 'Engineering'
    },
    {
        id: '13',
        username: 'jennifer.taylor',
        password: 'password123',
        role: 'employee',
        name: 'Jennifer Taylor',
        email: 'jennifer.taylor@company.com',
        department: 'Design'
    },
    {
        id: '14',
        username: 'thomas.white',
        password: 'password123',
        role: 'employee',
        name: 'Thomas White',
        email: 'thomas.white@company.com',
        department: 'Operations'
    },
    {
        id: '15',
        username: 'patricia.harris',
        password: 'password123',
        role: 'employee',
        name: 'Patricia Harris',
        email: 'patricia.harris@company.com',
        department: 'Finance'
    },
    {
        id: '16',
        username: 'daniel.clark',
        password: 'password123',
        role: 'employee',
        name: 'Daniel Clark',
        email: 'daniel.clark@company.com',
        department: 'Sales'
    },
    {
        id: '17',
        username: 'linda.lewis',
        password: 'password123',
        role: 'employee',
        name: 'Linda Lewis',
        email: 'linda.lewis@company.com',
        department: 'HR'
    }
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        // Initialize users in localStorage if not exists (demo fallback)
        const storedUsers = localStorage.getItem('users');
        if (!storedUsers) {
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }

        // Check for existing session
        const storedUser = localStorage.getItem('currentUser');
        const storedToken = localStorage.getItem('authToken');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    // login tries the backend first; if unavailable falls back to local demo users
    const login = async (identifier, password) => {
        // determine if identifier looks like an email
        const isEmail = identifier.includes('@');

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: isEmail ? identifier : undefined, username: isEmail ? undefined : identifier, password }),
            });

            if (res.ok) {
                const data = await res.json();
                // store token and user
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                return true;
            }
        } catch (err) {
            // ignore and fallback to local
            console.warn('Auth server not reachable, falling back to local demo users');
        }

        // Fallback: local users stored in localStorage (demo)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = users.find((u) => (isEmail ? u.email === identifier : u.username === identifier) && u.password === password);

        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('currentUser', JSON.stringify(foundUser));
            return true;
        }

        return false;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
