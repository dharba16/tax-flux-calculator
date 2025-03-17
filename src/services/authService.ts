
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface StoredUser extends User {
  password: string;
}

// Helper function to get users from localStorage
const getUsers = (): Record<string, StoredUser> => {
  const usersJson = localStorage.getItem('tax-calculator-users');
  return usersJson ? JSON.parse(usersJson) : {};
};

// Helper function to save users to localStorage
const saveUsers = (users: Record<string, StoredUser>) => {
  localStorage.setItem('tax-calculator-users', JSON.stringify(users));
};

// Helper function to get current user from localStorage
const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('tax-calculator-current-user');
  return userJson ? JSON.parse(userJson) : null;
};

// Helper function to save current user to localStorage
const saveCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('tax-calculator-current-user', JSON.stringify(user));
  } else {
    localStorage.removeItem('tax-calculator-current-user');
  }
};

export const authService = {
  // Register a new user
  signup: (email: string, password: string, name: string): User => {
    const users = getUsers();
    
    if (users[email]) {
      toast.error('A user with this email already exists');
      throw new Error('User already exists');
    }
    
    const newUser: StoredUser = {
      id: uuidv4(),
      email,
      name,
      password
    };
    
    users[email] = newUser;
    saveUsers(users);
    
    // Create user object without password for return
    const { password: _, ...userWithoutPassword } = newUser;
    saveCurrentUser(userWithoutPassword);
    
    toast.success('Account created successfully!');
    return userWithoutPassword;
  },
  
  // Login a user
  login: (email: string, password: string): User => {
    const users = getUsers();
    const user = users[email];
    
    if (!user || user.password !== password) {
      toast.error('Invalid email or password');
      throw new Error('Invalid credentials');
    }
    
    // Create user object without password for return
    const { password: _, ...userWithoutPassword } = user;
    saveCurrentUser(userWithoutPassword);
    
    toast.success('Login successful!');
    return userWithoutPassword;
  },
  
  // Logout the current user
  logout: () => {
    saveCurrentUser(null);
    toast.info('You have been logged out');
  },
  
  // Get the current logged in user
  getCurrentUser
};
