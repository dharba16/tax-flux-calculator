import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TaxCalculator from '@/components/TaxCalculator';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User, LogIn, UserPlus } from 'lucide-react';
import { authService, User as AuthUser } from '@/services/authService';
import { toast } from 'sonner';

const TaxCalculatorPage = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  // Check for user on mount and set up polling for auth state changes
  useEffect(() => {
    const checkAuthState = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    };
    
    checkAuthState();
    
    // Poll for auth state changes every 100ms to catch updates from Navigation component
    const interval = setInterval(checkAuthState, 100);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loggedInUser = authService.login(email, password);
      setUser(loggedInUser);
      setEmail('');
      setPassword('');
      toast.success('Successfully logged in!');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      const newUser = authService.signup(email, password, name);
      setUser(newUser);
      setEmail('');
      setPassword('');
      setName('');
      setIsSignup(false);
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error('Signup failed. This email might already be in use.');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <header className="py-6 border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container max-w-6xl px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/919bde2f-178b-47a9-9824-0a1c48c18ca9.png" 
                alt="The Alchemist's Solutions Logo" 
                className="h-16 sm:h-20 alchemist-logo"
              />
            </div>
            <Navigation hideAuth={false} />
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-16">
        <div className="container max-w-6xl px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-8 animate-slide-down text-center">
            Tax Return Calculator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-balance mb-12 animate-slide-down text-center text-lg">
            Estimate your tax refund or amount owed based on your income, filing status, and deductions.
            Now with support for all major filing statuses and selectable tax deductions.
          </p>
          <div className="animate-fade-in max-w-5xl mx-auto">
            {user ? (
              <TaxCalculator />
            ) : (
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>{isSignup ? 'Create an Account' : 'Login to Access Calculator'}</CardTitle>
                  <CardDescription>
                    {isSignup 
                      ? 'Sign up to save tax scenarios and get personalized recommendations' 
                      : 'Login to access the tax calculator and manage your tax scenarios'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSignup ? (
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input 
                          id="name" 
                          type="text" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Sign Up
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        <LogIn className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </form>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col">
                  <Button 
                    variant="link" 
                    className="px-0" 
                    onClick={() => setIsSignup(!isSignup)}
                  >
                    {isSignup
                      ? 'Already have an account? Login'
                      : "Don't have an account? Sign up"}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <footer className="py-10 border-t border-border/40 bg-background/80 backdrop-blur-sm mt-16">
        <div className="container max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center space-y-6">
            <img 
              src="/lovable-uploads/919bde2f-178b-47a9-9824-0a1c48c18ca9.png" 
              alt="The Alchemist's Solutions Logo" 
              className="h-12 mb-2 alchemist-logo"
            />
            <div className="space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} The Alchemist's Solutions. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground max-w-xl mx-auto">
                This calculator provides estimates for educational purposes only and should not be used for filing taxes.
                Consult a tax professional for advice specific to your situation.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TaxCalculatorPage;
