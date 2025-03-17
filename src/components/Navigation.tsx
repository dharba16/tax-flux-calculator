
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Calculator } from 'lucide-react';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import AuthSection from '@/components/AuthSection';
import { authService } from '@/services/authService';

interface NavigationProps {
  hideAuth?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ hideAuth = false }) => {
  const [user, setUser] = React.useState(authService.getCurrentUser());

  const handleLogin = (email: string, password: string) => {
    try {
      const loggedInUser = authService.login(email, password);
      setUser(loggedInUser);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSignup = (email: string, password: string, name: string) => {
    try {
      const newUser = authService.signup(email, password, name);
      setUser(newUser);
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <div className="flex flex-col items-end">
      {!hideAuth && (
        <div className="mb-2">
          <AuthSection 
            user={user} 
            onLogin={handleLogin} 
            onSignup={handleSignup} 
            onLogout={handleLogout}
          />
        </div>
      )}
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
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default Navigation;
