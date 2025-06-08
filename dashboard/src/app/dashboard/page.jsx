// src/app/dashboard/page.jsx
import React from "react";
import { supabase } from "@/lib/supabaseClient";
import DashboardHeader from "./components/DashboardHeader";
import MetricsGrid from "./components/MetricsGrid";
import ChartsSection from "./components/ChartsSection";
import RecentActivity from "./components/RecentActivity";
import ActiveLoads from "./components/ActiveLoads";
import CallHistoryTable from "./components/CallHistoryTable";
import MockChart from "./components/MockChart";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage({ searchParams }) {
  const mcNumber = searchParams?.mcNumber;
  
  if (!mcNumber) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto shadow-lg border-slate-200">
          <CardContent className="p-8 text-center">
            <MockChart title="" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              No MC Number Provided
            </h2>
            <p className="text-slate-600">
              Please provide a valid MC number to access the dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch calls
  const { data: callsData, error: callsError } = await supabase
    .from("calls")
    .select("id, carrier_name, final_offer, outcome, sentiment, created_at, load_id")
    .eq("mc_number", mcNumber)
    .order("created_at", { ascending: false });

  if (callsError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto shadow-lg border-red-200">
          <CardContent className="p-8 text-center">
            <MockChart title="" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Error Loading Data
            </h2>
            <p className="text-slate-600">{callsError.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calls = callsData || [];

  // Fetch booked loads
  const loadIds = Array.from(new Set(calls.map(c => c.load_id).filter(Boolean)));
  const { data: loadsData } = loadIds.length
    ? await supabase
        .from("loads")
        .select("load_id, origin, destination, pickup_datetime, delivery_datetime, loadboard_rate")
        .in("load_id", loadIds)
    : { data: [] };

  const loadsMap = (loadsData || []).reduce((map, load) => {
    map[load.load_id] = load;
    return map;
  }, {});
  const bookedLoads = loadIds.map(id => loadsMap[id]).filter(Boolean);

  // Metrics
  const totalRevenue = calls.reduce((sum, c) => sum + (c.final_offer || 0), 0);
  const totalCalls = calls.length;
  const avgOffer = totalCalls ? totalRevenue / totalCalls : 0;
  const successfulCalls = calls.filter(c => c.outcome === "booked" || c.final_offer).length;
  const conversionRate = totalCalls ? (successfulCalls / totalCalls) * 100 : 0;

  // Call volume last 7 days
  const volumeMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    volumeMap[d.toLocaleDateString()] = 0;
  }
  calls.forEach(c => {
    const day = new Date(c.created_at).toLocaleDateString();
    if (volumeMap[day] != null) volumeMap[day]++;
  });
  const callVolumeData = Object.entries(volumeMap).map(([date, count]) => ({ date, count }));

  // Sentiment distribution
  const sentimentCounts = {};
  calls.forEach(c => {
    const s = c.sentiment || "neutral";
    sentimentCounts[s] = (sentimentCounts[s] || 0) + 1;
  });

  // Recent calls (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentCalls = calls
    .filter(c => new Date(c.created_at) >= weekAgo)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
        <DashboardHeader
          mcNumber={mcNumber}
          carrierName={calls[0]?.carrier_name}
        />
        <MetricsGrid
          totalRevenue={totalRevenue}
          totalCalls={totalCalls}
          conversionRate={conversionRate}
          avgOffer={avgOffer}
        />
        <ChartsSection
          callVolumeData={callVolumeData}
          sentimentCounts={sentimentCounts}
          totalCalls={totalCalls}
        />
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          <RecentActivity recentCalls={recentCalls} />
          <ActiveLoads bookedLoads={bookedLoads} />
          <CallHistoryTable calls={calls} />
        </div>
      </div>
    </div>
  );
}
