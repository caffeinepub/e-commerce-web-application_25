import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '../hooks/useCart';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateCheckoutSession, useGetCallerUserProfile, useIsStripeConfigured } from '../hooks/useQueries';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ShoppingItem } from '../backend';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { items, getTotalPrice, clearCart } = useCart();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isStripeConfigured } = useIsStripeConfigured();
  const createCheckoutSession = useCreateCheckoutSession();

  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const isAuthenticated = !!identity;
  const totalPrice = getTotalPrice();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to continue');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!isStripeConfigured) {
      toast.error('Payment system is not configured. Please contact support.');
      return;
    }

    try {
      const shoppingItems: ShoppingItem[] = items.map((item) => ({
        productName: item.product.name,
        productDescription: item.product.description,
        priceInCents: item.product.priceCents,
        quantity: BigInt(item.quantity),
        currency: 'usd',
      }));

      const sessionJson = await createCheckoutSession.mutateAsync(shoppingItems);
      const session = JSON.parse(sessionJson);
      
      window.location.href = session.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to create checkout session. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="pt-12 pb-8">
            <h2 className="text-2xl font-bold">Login Required</h2>
            <p className="mt-2 text-muted-foreground">Please login to proceed with checkout</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="pt-12 pb-8">
            <h2 className="text-2xl font-bold">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">Add some products before checking out</p>
            <Button className="mt-4" onClick={() => navigate({ to: '/products' })}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={createCheckoutSession.isPending}>
                  {createCheckoutSession.isPending ? 'Processing...' : 'Continue to Payment'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => {
                  const price = (Number(item.product.priceCents) / 100).toFixed(2);
                  const subtotal = ((Number(item.product.priceCents) * item.quantity) / 100).toFixed(2);
                  return (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="font-medium">${subtotal}</span>
                    </div>
                  );
                })}
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">${totalPrice}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
