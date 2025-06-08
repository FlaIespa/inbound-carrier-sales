'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle } from 'lucide-react';

export default function HomePage() {
  const [mcNumber, setMcNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleVerify = async () => {
    if (!mcNumber.trim()) {
      setError('Please enter a valid MC number');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mcNumber }),
      });
      const data = await res.json();

      if (data.valid) {
        // on success, send user to the dashboard route
        router.push(`/dashboard?mcNumber=${encodeURIComponent(mcNumber)}`);
      } else {
        setError('MC number not found. Please try again.');
      }
    } catch {
      // no `err` variable here, so no unused-var error
      setError('Verification failed. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>MC Number Verification</CardTitle>
          <CardDescription>
            Enter your MC number to continue into your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mcNumber">MC Number</Label>
            <Input
              id="mcNumber"
              value={mcNumber}
              onChange={(e) => setMcNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              placeholder="Enter MC number"
            />
          </div>
          <Button onClick={handleVerify} disabled={loading} className="w-full">
            {loading ? 'Verifying…' : 'Verify'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
