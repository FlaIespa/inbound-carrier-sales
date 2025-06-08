import { supabase } from '@/lib/supabaseClient';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Truck,
  Package,
  DollarSign,
} from 'lucide-react';

interface CallEntry {
  id: string;
  call_id: string;
  mc_number: string;
  carrier_name: string;
  final_offer: number | null;
  outcome: string | null;
  sentiment: string | null;
  created_at: string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { mcNumber?: string };
}) {
  const mcNumber = searchParams.mcNumber;
  if (!mcNumber) {
    return <p className="p-4 text-center">No MC number provided.</p>;
  }

  // Fetch all call entries matching this MC number
  const { data, error } = await supabase
    .from('calls')
    .select('*')
    .eq('mc_number', mcNumber)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <Card className="m-4">
        <CardContent>
          <p>Error loading data: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  // Cast the returned data to CallEntry[]
  const entries = (data ?? []) as CallEntry[];

  if (entries.length === 0) {
    return (
      <Card className="m-4">
        <CardContent>
          <p>No entries found for MC {mcNumber}.</p>
        </CardContent>
      </Card>
    );
  }

  // Compute metrics
  const totalRevenue = entries.reduce(
    (sum, e) => sum + (e.final_offer || 0),
    0
  );
  const totalCalls = entries.length;
  const avgRevenue = totalRevenue / totalCalls;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Truck className="w-8 h-8 text-blue-600" />
            Dashboard for MC {mcNumber}
          </h1>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Calls</p>
                  <p className="text-2xl font-bold">{totalCalls}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Final Offer</p>
                  <p className="text-2xl font-bold">${avgRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entries Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Call History
            </CardTitle>
            <CardDescription>
              Recent calls and outcomes for this MC number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Final Offer</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Sentiment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        {new Date(e.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {e.final_offer != null ? (
                          <Badge variant="outline">${e.final_offer}</Badge>
                        ) : (
                          <Badge variant="secondary">N/A</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {e.outcome || (
                          <Badge variant="secondary">Unknown</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {e.sentiment ? (
                          <Badge variant="default">{e.sentiment}</Badge>
                        ) : (
                          <Badge variant="secondary">None</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}