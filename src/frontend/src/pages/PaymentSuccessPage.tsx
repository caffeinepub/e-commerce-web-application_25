import { useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart';

export default function PaymentSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="container py-16">
      <Card className="mx-auto max-w-md text-center">
        <CardContent className="pt-12 pb-8">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">Payment Successful!</h1>
          <p className="mt-4 text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed and will be processed shortly.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Button asChild size="lg">
              <Link to="/">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/products">Browse More Products</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
