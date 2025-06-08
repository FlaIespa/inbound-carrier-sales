import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2, XCircle, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface CallEntry {
  id: string;
  created_at: string;
  final_offer?: number | null;
  outcome?: string | null;
  sentiment?: string | null;
}

interface RecentActivityProps {
  recentCalls: CallEntry[];
}

export default function RecentActivity({ recentCalls }: RecentActivityProps) {
  /** Pick icon based on outcome */
  const getOutcomeIcon = (outcome?: string | null) => {
    switch (outcome?.toLowerCase()) {
      case "booked":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "declined":
        return <XCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  /** Pick badge classes based on sentiment */
  const getSentimentColor = (sentiment?: string | null) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "negative":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "neutral":
        return "bg-slate-50 text-slate-700 border-slate-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="col-span-12 lg:col-span-4">
      <Card className="bg-white border-slate-200 shadow-sm h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-slate-600" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-sm">
            {recentCalls.length} calls this week
          </CardDescription>
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
                      {new Date(call.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {call.sentiment != null && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${getSentimentColor(call.sentiment)}`}
                    >
                      {call.sentiment}
                    </Badge>
                  )}
                  {call.final_offer != null && (
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
  );
}
