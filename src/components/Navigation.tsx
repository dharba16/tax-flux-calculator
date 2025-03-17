
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Calculator, LogIn, UserPlus, LogOut, User } from 'lucide-react';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';

interface NavigationProps {
  hideAuth?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ hideAuth = false }) => {
  const [user, setUser] = React.useState(authService.getCurrentUser());
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      const loggedInUser = authService.login(email, password);
      setUser(loggedInUser);
      setIsLoginOpen(false);
      resetForm();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSignup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      const newUser = authService.signup(email, password, name);
      setUser(newUser);
      setIsSignupOpen(false);
      resetForm();
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  };

  return (
    <NavigationMenu className="max-w-none w-full justify-end">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Home className="mr-2 h-4 w-4" />
              Home
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/tax-calculator">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Calculator className="mr-2 h-4 w-4" />
              Tax Calculator
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        
        {!hideAuth && (
          user ? (
            <>
              <NavigationMenuItem>
                <div className="flex items-center ml-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="ml-2 font-medium">{user.name}</span>
                </div>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <button 
                  onClick={handleLogout}
                  className={navigationMenuTriggerStyle()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </NavigationMenuItem>
            </>
          ) : (
            <>
              <NavigationMenuItem>
                <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                  <DialogTrigger asChild>
                    <button className={navigationMenuTriggerStyle()}>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Login to Your Account</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleLogin} className="space-y-4 pt-4">
                      {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-2 rounded">
                          {error}
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="w-full">Login</Button>
                      <p className="text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <button
                          type="button"
                          className="text-primary underline"
                          onClick={() => {
                            setIsLoginOpen(false);
                            setTimeout(() => setIsSignupOpen(true), 100);
                          }}
                        >
                          Sign up
                        </button>
                      </p>
                    </form>
                  </DialogContent>
                </Dialog>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
                  <DialogTrigger asChild>
                    <button className={navigationMenuTriggerStyle()}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sign Up
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create an Account</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSignup} className="space-y-4 pt-4">
                      {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-2 rounded">
                          {error}
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Name</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="w-full">Sign Up</Button>
                      <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <button
                          type="button"
                          className="text-primary underline"
                          onClick={() => {
                            setIsSignupOpen(false);
                            setTimeout(() => setIsLoginOpen(true), 100);
                          }}
                        >
                          Login
                        </button>
                      </p>
                    </form>
                  </DialogContent>
                </Dialog>
              </NavigationMenuItem>
            </>
          )
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navigation;
