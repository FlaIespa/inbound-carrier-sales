import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Phone, CheckCircle2, XCircle, Minus } from "lucide-react";

export interface CallEntry {
  id: string;
  created_at: string;
  final_offer?: number | null;
  outcome?: string | null;
  sentiment?: string | null;
  load_id?: string | null;
}

interface CallHistoryTableProps {
  calls: CallEntry[];
}

export default function CallHistoryTable({ calls }: CallHistoryTableProps) {
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

  const getSentimentClasses = (sentiment?: string | null) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "negative":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "neutral":
        return "bg-slate-50 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="col-span-12">
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="w-5 h-5 text-slate-600" />
            Call History
          </CardTitle>
          <CardDescription className="text-sm">
            Complete interaction log
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="font-semibold text-slate-700">
                    Date & Time
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Final Offer
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Outcome
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Sentiment
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Load ID
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.map((call) => (
                  <TableRow
                    key={call.id}
                    className="hover:bg-slate-50 border-slate-100"
                  >
                    <TableCell className="font-medium">
                      <div>
                        <p className="text-slate-900">
                          {new Date(call.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(call.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {call.final_offer != null ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          ${call.final_offer}
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-600"
                        >
                          N/A
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getOutcomeIcon(call.outcome)}
                        <span className="text-slate-700">
                          {call.outcome ?? "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {call.sentiment ? (
                        <Badge
                          variant="outline"
                          className={getSentimentClasses(call.sentiment)}
                        >
                          {call.sentiment}
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-600"
                        >
                          None
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {call.load_id ? (
                        <Badge
                          variant="outline"
                          className="bg-slate-50 text-slate-700 border-slate-200"
                        >
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
  );
}
