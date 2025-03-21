
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Calculator, LogIn } from 'lucide-react';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { authService } from '@/services/authService';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NavigationProps {
  hideAuth?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ hideAuth = false }) => {
  const [user, setUser] = React.useState(authService.getCurrentUser());
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoginDialogOpen, setIsLoginDialogOpen] = React.useState(false);

  const handleLogin = () => {
    try {
      const loggedInUser = authService.login(email, password);
      setUser(loggedInUser);
      setIsLoginDialogOpen(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <div className="flex flex-col items-end gap-4">
      <div className="w-full flex justify-end items-center mb-4">
        {!hideAuth && (
          <>
            {user ? (
              <div className="flex items-center gap-4 bg-muted/40 px-4 py-2 rounded-full shadow-sm">
                <span className="text-sm text-foreground font-medium">Welcome, {user.name}</span>
                <Button variant="outline" size="sm" className="rounded-full text-xs px-3 hover:bg-background/80" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full flex items-center gap-1.5 px-4 py-2 hover:bg-accent/50 transition-colors border-accent">
                    <LogIn className="h-3.5 w-3.5" />
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Welcome Back</DialogTitle>
                    <DialogDescription className="text-muted-foreground/90">
                      Enter your credentials to access your account
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        className="h-11"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <Input 
                        id="password" 
                        type="password"
                        className="h-11" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <Button 
                      className="w-full h-11 text-base font-medium" 
                      onClick={handleLogin}
                    >
                      Sign In
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
      </div>
      <NavigationMenu className="max-w-none w-full justify-end">
        <NavigationMenuList className="px-2 py-1 bg-background/50 backdrop-blur-sm border border-border/30 rounded-full shadow-sm">
          <NavigationMenuItem>
            <Link to="/">
              <NavigationMenuLink className={navigationMenuTriggerStyle() + " rounded-full gap-1.5 px-4"}>
                <Home className="h-4 w-4" />
                Home
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/tax-calculator">
              <NavigationMenuLink className={navigationMenuTriggerStyle() + " rounded-full gap-1.5 px-4"}>
                <Calculator className="h-4 w-4" />
                Tax Calculator
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default Navigation;
