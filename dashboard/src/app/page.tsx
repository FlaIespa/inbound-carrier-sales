"use client";

import { useState } from 'react';
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
import { XCircle, Truck } from 'lucide-react';

export default function HomePage() {
  const [mcNumber, setMcNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // on success, route to the dashboard page
        window.location.href = `/dashboard?mcNumber=${encodeURIComponent(mcNumber)}`;
      } else {
        setError('MC number not found. Please try again.');
      }
    } catch {
      setError('Verification failed. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div suppressHydrationWarning className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with same styling as dashboard */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-sm">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Carrier Portal</h1>
            </div>
          </div>
        </div>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-900">MC Number Verification</CardTitle>
            <CardDescription className="text-sm text-slate-600">
              Enter your MC number to continue into your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <Label htmlFor="mcNumber" className="text-slate-700 font-medium">MC Number</Label>
              <Input
                id="mcNumber"
                value={mcNumber}
                onChange={(e) => setMcNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                placeholder="Enter MC number"
                className="mt-1 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
              />
            </div>
            <Button
              onClick={handleVerify}
              disabled={loading}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white shadow-sm"
            >
              {loading ? 'Verifying…' : 'Verify'}
            </Button>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}