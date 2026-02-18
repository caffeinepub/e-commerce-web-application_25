import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  return (
    <div className="container py-16">
      <Card className="mx-auto max-w-md text-center">
        <CardContent className="pt-12 pb-8">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold">Payment Failed</h1>
          <p className="mt-4 text-muted-foreground">
            We couldn't process your payment. Please try again or contact support if the problem persists.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Button asChild size="lg">
              <Link to="/checkout">Try Again</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/cart">Back to Cart</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
