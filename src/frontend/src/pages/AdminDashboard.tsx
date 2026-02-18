import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserRole } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import ProductManagement from '../components/admin/ProductManagement';
import OrderManagement from '../components/admin/OrderManagement';
import StripeSetup from '../components/admin/StripeSetup';
import { Package, ShoppingCart, CreditCard } from 'lucide-react';

export default function AdminDashboard() {
  const { identity } = useInternetIdentity();
  const { data: userRole, isLoading } = useGetCallerUserRole();

  const isAuthenticated = !!identity;
  const isAdmin = userRole === 'admin';

  if (!isAuthenticated || isLoading) {
    return (
      <div className="container py-16">
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="pt-12 pb-8">
            <p className="text-lg text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-16">
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="pt-12 pb-8">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="mt-2 text-muted-foreground">You don't have permission to access this page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Manage your store</p>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="products">
            <Package className="mr-2 h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="stripe">
            <CreditCard className="mr-2 h-4 w-4" />
            Stripe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductManagement />
        </TabsContent>

        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>

        <TabsContent value="stripe">
          <StripeSetup />
        </TabsContent>
      </Tabs>
    </div>
  );
}
