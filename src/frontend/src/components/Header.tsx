import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, User, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useCart } from '../hooks/useCart';
import { useGetCallerUserRole } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { items } = useCart();
  const { data: userRole } = useGetCallerUserRole();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ShopHub</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary"
              activeProps={{ className: 'text-primary' }}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-sm font-medium transition-colors hover:text-primary"
              activeProps={{ className: 'text-primary' }}
            >
              Products
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && userRole === 'admin' && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin">
                <User className="h-4 w-4 mr-2" />
                Admin
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" className="relative" asChild>
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Link>
          </Button>
          <Button onClick={handleAuth} disabled={disabled} size="sm">
            {loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
          </Button>
        </div>
      </div>
    </header>
  );
}
