import React from "react";
import { BarChart3 } from "lucide-react";

interface MockChartProps {
  title?: string;
  type?: "bar" | "line" | "pie";
}

export default function MockChart({ title = "Visualization" }: MockChartProps) {
  return (
    <div className="h-40 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 flex items-center justify-center border border-slate-200/50">
      <div className="text-center">
        <BarChart3 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-600 font-medium">{title}</p>
        <p className="text-xs text-slate-400 mt-1">Placeholder</p>
      </div>
    </div>
  );
}
