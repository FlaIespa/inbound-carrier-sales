import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, DollarSign, Target, TrendingUp } from "lucide-react";

interface MetricsGridProps {
  totalRevenue: number;
  totalCalls: number;
  conversionRate: number;
  avgOffer: number;
}

export default function MetricsGrid({
  totalRevenue,
  totalCalls,
  conversionRate,
  avgOffer,
}: MetricsGridProps) {
  return (
    <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium">Total Calls</p>
            <p className="text-2xl font-bold text-slate-900">{totalCalls}</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Phone className="w-5 h-5 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium">Conversion Rate</p>
            <p className="text-2xl font-bold text-slate-900">{conversionRate.toFixed(1)}%</p>
          </div>
          <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-violet-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium">Avg Offer</p>
            <p className="text-2xl font-bold text-slate-900">${avgOffer.toFixed(0)}</p>
          </div>
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
