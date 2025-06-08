import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package } from "lucide-react";

export interface LoadRecord {
  load_id: string;
  origin: string;
  destination: string;
  pickup_datetime: string;
  delivery_datetime: string;
  loadboard_rate: number;
}

interface ActiveLoadsProps {
  bookedLoads: LoadRecord[];
}

export default function ActiveLoads({ bookedLoads }: ActiveLoadsProps) {
  if (bookedLoads.length === 0) {
    return null;
  }

  return (
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
          <CardDescription className="text-sm">
            Currently scheduled loads
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 max-h-60 overflow-y-auto">
            {bookedLoads.map((load) => (
              <div
                key={load.load_id}
                className="p-4 bg-emerald-50 rounded-lg border border-emerald-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-900 text-sm">
                      Load #{load.load_id}
                    </span>
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
  );
}
