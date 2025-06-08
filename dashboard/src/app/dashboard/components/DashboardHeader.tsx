import React from "react";
import { Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  mcNumber: string;
  carrierName?: string;
}

export default function DashboardHeader({ mcNumber, carrierName }: DashboardHeaderProps) {
  return (
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
            {carrierName && <span className="text-slate-600">{carrierName}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
