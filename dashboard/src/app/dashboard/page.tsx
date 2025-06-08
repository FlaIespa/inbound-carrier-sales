import { supabase } from "@/lib/supabaseClient"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import {
  Truck,
  Package,
  DollarSign,
  TrendingUp,
  Phone,
  MapPin,
  Clock,
  Activity,
  BarChart3,
  Target,
  CheckCircle2,
  XCircle,
  Minus,
  Users,
} from "lucide-react"

interface CallEntry {
  id: string
  call_id: string
  mc_number: string
  carrier_name: string
  final_offer: number | null
  outcome: string | null
  sentiment: string | null
  created_at: string
  load_id?: string
}

interface LoadRecord {
  load_id: string
  origin: string
  destination: string
  pickup_datetime: string
  delivery_datetime: string
  loadboard_rate: number
}

interface DashboardPageProps {
  searchParams: { mcNumber?: string }
}

const MockChart = ({ title = "bar" }: { title: string; type?: "bar" | "line" | "pie" }) => (
  <div className="h-40 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 flex items-center justify-center border border-slate-200/50">
    <div className="text-center">
      <BarChart3 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
      <p className="text-sm text-slate-600 font-medium">{title}</p>
      <p className="text-xs text-slate-400 mt-1">Visualization</p>
    </div>
  </div>
)

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const mcNumber: string | undefined = searchParams.mcNumber

  if (!mcNumber) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto shadow-lg border-slate-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No MC Number Provided</h2>
            <p className="text-slate-600">Please provide a valid MC number to access the dashboard.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch call data
  const { data: callsData, error: callsError } = await supabase
    .from("calls")
    .select("id, call_id, mc_number, carrier_name, final_offer, outcome, sentiment, created_at, load_id")
    .eq("mc_number", mcNumber)
    .order("created_at", { ascending: false })

  if (callsError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto shadow-lg border-red-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Data</h2>
            <p className="text-slate-600">{callsError.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const calls: CallEntry[] = (callsData ?? []) as CallEntry[]

  // Fetch load data
  const loadIds: string[] = Array.from(new Set(calls.map((c) => c.load_id).filter(Boolean))) as string[]

  const { data: loadsData } = loadIds.length
    ? await supabase
        .from("loads")
        .select("load_id, origin, destination, pickup_datetime, delivery_datetime, loadboard_rate")
        .in("load_id", loadIds)
    : { data: [] }

  const loadsMap: Record<string, LoadRecord> = (loadsData ?? []).reduce<Record<string, LoadRecord>>((map, load) => {
    map[load.load_id] = load
    return map
  }, {})

  const bookedLoads: LoadRecord[] = loadIds.map((id) => loadsMap[id]).filter((l): l is LoadRecord => Boolean(l))

  // Calculate metrics
  const totalRevenue: number = calls.reduce((sum, e) => sum + (e.final_offer || 0), 0)
  const totalCalls: number = calls.length
  const avgRevenue: number = totalCalls ? totalRevenue / totalCalls : 0
  const successfulCalls: number = calls.filter((c) => c.outcome === "booked" || c.final_offer).length
  const conversionRate: number = totalCalls ? (successfulCalls / totalCalls) * 100 : 0

  // Sentiment analysis
  const sentimentCounts: Record<string, number> = calls.reduce(
    (acc, call) => {
      const sentiment: string = call.sentiment || "neutral"
      acc[sentiment] = (acc[sentiment] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Recent activity (last 7 days)
  const recentCalls: CallEntry[] = calls.filter((call) => {
    const callDate = new Date(call.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return callDate >= weekAgo
  })

  const getOutcomeIcon = (outcome: string | null) => {
    switch (outcome?.toLowerCase()) {
      case "booked":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      case "declined":
        return <XCircle className="w-4 h-4 text-rose-500" />
      default:
        return <Minus className="w-4 h-4 text-slate-400" />
    }
  }

  const getSentimentColor = (sentiment: string | null): string => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "negative":
        return "bg-rose-50 text-rose-700 border-rose-200"
      case "neutral":
        return "bg-slate-50 text-slate-700 border-slate-200"
      default:
        return "bg-slate-50 text-slate-600 border-slate-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-sm">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Carrier Dashboard</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300">
                  MC {mcNumber}
                </Badge>
                {calls[0]?.carrier_name && <span className="text-slate-600">{calls[0].carrier_name}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          {/* Key Metrics - Top Row */}
          <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Calls</p>
                    <p className="text-2xl font-bold text-slate-900">{totalCalls}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Conversion Rate</p>
                    <p className="text-2xl font-bold text-slate-900">{conversionRate.toFixed(1)}%</p>
                  </div>
                  <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-violet-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Avg Offer</p>
                    <p className="text-2xl font-bold text-slate-900">${avgRevenue.toFixed(0)}</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-slate-600" />
                  Call Activity
                </CardTitle>
                <CardDescription className="text-sm">Daily volume trends</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <MockChart title="Call Volume" />
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-slate-600" />
                  Sentiment Analysis
                </CardTitle>
                <CardDescription className="text-sm">Call sentiment distribution</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {Object.entries(sentimentCounts).map(([sentiment, count]) => (
                    <div key={sentiment} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            sentiment === "positive"
                              ? "bg-emerald-500"
                              : sentiment === "negative"
                                ? "bg-rose-500"
                                : "bg-slate-400"
                          }`}
                        ></div>
                        <span className="capitalize text-sm font-medium text-slate-700">{sentiment}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              sentiment === "positive"
                                ? "bg-emerald-500"
                                : sentiment === "negative"
                                  ? "bg-rose-500"
                                  : "bg-slate-400"
                            }`}
                            style={{ width: `${(count / totalCalls) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 w-6">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Sidebar */}
          <div className="col-span-12 lg:col-span-4">
            <Card className="bg-white border-slate-200 shadow-sm h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-slate-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-sm">{recentCalls.length} calls this week</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {recentCalls.slice(0, 8).map((call) => (
                    <div
                      key={call.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        {getOutcomeIcon(call.outcome)}
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(call.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(call.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {call.sentiment && (
                          <Badge variant="outline" className={`text-xs ${getSentimentColor(call.sentiment)}`}>
                            {call.sentiment}
                          </Badge>
                        )}
                        {call.final_offer && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            ${call.final_offer}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Loads */}
          {bookedLoads.length > 0 && (
            <div className="col-span-12 lg:col-span-8">
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="w-5 h-5 text-slate-600" />
                    Active Loads
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {bookedLoads.length} booked
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-sm">Currently scheduled loads</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid gap-3 max-h-60 overflow-y-auto">
                    {bookedLoads.map((load) => (
                      <div key={load.load_id} className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold text-slate-900 text-sm">Load #{load.load_id}</span>
                          </div>
                          <Badge className="bg-emerald-600 text-white text-sm">
                            ${load.loadboard_rate.toLocaleString()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-slate-600 mb-1">Route</p>
                            <p className="font-medium text-slate-900">
                              {load.origin} → {load.destination}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600 mb-1">Pickup</p>
                            <p className="font-medium text-slate-900">
                              {new Date(load.pickup_datetime).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600 mb-1">Delivery</p>
                            <p className="font-medium text-slate-900">
                              {new Date(load.delivery_datetime).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Call History Table */}
          <div className="col-span-12">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Phone className="w-5 h-5 text-slate-600" />
                  Call History
                </CardTitle>
                <CardDescription className="text-sm">Complete interaction log</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead className="font-semibold text-slate-700">Date & Time</TableHead>
                        <TableHead className="font-semibold text-slate-700">Final Offer</TableHead>
                        <TableHead className="font-semibold text-slate-700">Outcome</TableHead>
                        <TableHead className="font-semibold text-slate-700">Sentiment</TableHead>
                        <TableHead className="font-semibold text-slate-700">Load ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calls.map((call) => (
                        <TableRow key={call.id} className="hover:bg-slate-50 border-slate-100">
                          <TableCell className="font-medium">
                            <div>
                              <p className="text-slate-900">{new Date(call.created_at).toLocaleDateString()}</p>
                              <p className="text-sm text-slate-500">
                                {new Date(call.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {call.final_offer ? (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                ${call.final_offer}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                N/A
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getOutcomeIcon(call.outcome)}
                              <span className="text-slate-700">{call.outcome || "Unknown"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {call.sentiment ? (
                              <Badge variant="outline" className={getSentimentColor(call.sentiment)}>
                                {call.sentiment}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                None
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {call.load_id ? (
                              <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                {call.load_id}
                              </Badge>
                            ) : (
                              <span className="text-slate-400">—</span>
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
      </div>
    </div>
  )
}
