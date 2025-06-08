"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Activity, Users } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface CallVolumePoint {
  date: string;
  count: number;
}

interface ChartsSectionProps {
  callVolumeData: CallVolumePoint[];
  sentimentCounts: Record<string, number>;
  totalCalls: number;
}

export default function ChartsSection({
  callVolumeData,
  sentimentCounts,
  totalCalls,
}: ChartsSectionProps) {
  return (
    <div className="col-span-12 lg:col-span-8 grid grid-cols-1 lg:grid-cols-2 gap-4 my-6">
      {/* Call Activity Chart */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-slate-600" />
            Call Activity
          </CardTitle>
          <CardDescription className="text-sm">
            Daily volume trends
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={callVolumeData}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => `${value} calls`} />
              <Bar dataKey="count" fill="#3B82F6" barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sentiment Analysis Chart */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-slate-600" />
            Sentiment Analysis
          </CardTitle>
          <CardDescription className="text-sm">
            Call sentiment distribution
          </CardDescription>
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
                  <span className="capitalize text-sm font-medium text-slate-700">
                    {sentiment}
                  </span>
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
                  <span className="text-sm font-semibold text-slate-900 w-6">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
