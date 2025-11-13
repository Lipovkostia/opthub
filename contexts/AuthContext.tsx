import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

// A simple hashing function for demonstration. 
// In a real app, use a robust library like bcrypt.
const simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
};

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => 'success' | 'not_found' | 'wrong_password';
  register: (email: string, password: string) => 'success' | 'exists';
  logout: () => void;
  updateUserDetails: (userId: number, details: { name: string; city: string; address: string; }) => void;
  changePassword: (userId: number, oldPassword: string, newPassword: string) => 'success' | 'wrong_password';
  addUserByAdmin: (email: string, password: string) => 'success' | 'exists';
  deleteUserByAdmin: (userId: number) => void;
  updateUserByAdmin: (userId: number, updates: Partial<User> & { newPassword?: string }) => void;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  users: [],
  login: () => 'not_found',
  register: () => 'exists',
  logout: () => {},
  updateUserDetails: () => {},
  changePassword: () => 'wrong_password',
  addUserByAdmin: () => 'exists',
  deleteUserByAdmin: () => {},
  updateUserByAdmin: () => {},
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load users from localStorage and ensure admin exists
    const storedUsers = localStorage.getItem('users');
    let usersData: User[] = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Migration for customerType
    usersData = usersData.map(u => ({ ...u, customerType: u.customerType || 'Розничный' }));

    // Clean up old admin user
    usersData = usersData.filter(u => u.email !== 'admin@cheese.com');

    const adminLogin = '1';
    const adminExists = usersData.some(u => u.email === adminLogin);

    if (!adminExists) {
        const adminUser: User = {
            id: Date.now(),
            email: adminLogin,
            passwordHash: simpleHash('1'),
            isAdmin: true,
            customerType: 'Розничный',
        };
        usersData.push(adminUser);
    }
    localStorage.setItem('users', JSON.stringify(usersData));
    setUsers(usersData);

    // Check for a logged-in user in sessionStorage
    const sessionUser = sessionStorage.getItem('currentUser');
    if (sessionUser) {
      setCurrentUser(JSON.parse(sessionUser));
    }
  }, []);

  const login = (email: string, password: string): 'success' | 'not_found' | 'wrong_password' => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return 'not_found';
    const user = users.find(u => u.email === trimmedEmail);
    if (!user) {
      return 'not_found';
    }
    if (user.passwordHash !== simpleHash(password)) {
      return 'wrong_password';
    }
    setCurrentUser(user);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    return 'success';
  };

  const register = (email: string, password: string): 'success' | 'exists' => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return 'exists'; // Or some other error for empty email
    if (users.some(u => u.email === trimmedEmail)) {
      return 'exists';
    }
    const newUser: User = {
      id: Date.now(),
      email: trimmedEmail,
      passwordHash: simpleHash(password),
      isAdmin: false, // Regular users are not admins
      customerType: 'Розничный',
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Automatically log in after registration
    setCurrentUser(newUser);
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));
    return 'success';
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
  };
  
  const updateUserDetails = (userId: number, details: { name: string; city: string; address: string; }) => {
    const updatedUsers = users.map(u => {
        if (u.id === userId) {
            return { ...u, ...details };
        }
        return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    if (currentUser && currentUser.id === userId) {
        const updatedCurrentUser = { ...currentUser, ...details };
        setCurrentUser(updatedCurrentUser);
        sessionStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    }
  };

  const changePassword = (userId: number, oldPassword: string, newPassword: string): 'success' | 'wrong_password' => {
    const user = users.find(u => u.id === userId);
    if (!user || user.passwordHash !== simpleHash(oldPassword)) {
        return 'wrong_password';
    }

    const updatedUsers = users.map(u => {
        if (u.id === userId) {
            return { ...u, passwordHash: simpleHash(newPassword) };
        }
        return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    return 'success';
  };

  const addUserByAdmin = (email: string, password: string): 'success' | 'exists' => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return 'exists';
    if (users.some(u => u.email === trimmedEmail)) {
      return 'exists';
    }
    const newUser: User = {
      id: Date.now(),
      email: trimmedEmail,
      passwordHash: simpleHash(password),
      isAdmin: false,
      customerType: 'Розничный',
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    return 'success';
  };

  const deleteUserByAdmin = (userId: number) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const updateUserByAdmin = (userId: number, updates: Partial<User> & { newPassword?: string }) => {
    const { newPassword, ...otherUpdates } = updates;
    
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        const updatedUser = { ...user, ...otherUpdates };
        if (newPassword) {
          updatedUser.passwordHash = simpleHash(newPassword);
        }
        return updatedUser;
      }
      return user;
    });
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };


  return (
    <AuthContext.Provider value={{ currentUser, users, login, register, logout, updateUserDetails, changePassword, addUserByAdmin, deleteUserByAdmin, updateUserByAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
