import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { StripeConfiguration } from '../../backend';

export default function StripeSetup() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setStripeConfig = useSetStripeConfiguration();
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!secretKey.trim()) {
      toast.error('Please enter your Stripe secret key');
      return;
    }

    const allowedCountries = countries.split(',').map(c => c.trim()).filter(c => c);
    if (allowedCountries.length === 0) {
      toast.error('Please enter at least one country code');
      return;
    }

    const config: StripeConfiguration = {
      secretKey: secretKey.trim(),
      allowedCountries,
    };

    try {
      await setStripeConfig.mutateAsync(config);
      toast.success('Stripe configuration saved successfully');
      setSecretKey('');
    } catch (error) {
      console.error('Stripe config error:', error);
      toast.error('Failed to save Stripe configuration');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {isConfigured ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            <CardTitle>Stripe Payment Configuration</CardTitle>
          </div>
          <CardDescription>
            {isConfigured
              ? 'Stripe is configured and ready to accept payments'
              : 'Configure Stripe to enable payment processing'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secretKey">Stripe Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                placeholder="sk_test_..."
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Your Stripe secret key (starts with sk_test_ or sk_live_)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countries">Allowed Countries</Label>
              <Input
                id="countries"
                placeholder="US,CA,GB"
                value={countries}
                onChange={(e) => setCountries(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of country codes (e.g., US,CA,GB,DE,FR)
              </p>
            </div>

            <Button type="submit" disabled={setStripeConfig.isPending}>
              {setStripeConfig.isPending ? 'Saving...' : isConfigured ? 'Update Configuration' : 'Save Configuration'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Get Your Stripe Keys</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>Go to <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">stripe.com</a> and create an account</li>
            <li>Navigate to Developers → API keys in your Stripe dashboard</li>
            <li>Copy your Secret key (starts with sk_test_ for testing)</li>
            <li>Paste it in the form above</li>
            <li>For production, use your live secret key (sk_live_)</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
