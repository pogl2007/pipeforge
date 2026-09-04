"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/Card";

export function ActivityChart({ activity }: { activity: { date: string; runs: number }[] }) {
  const data = activity.map((a) => ({
    ...a,
    label: new Date(a.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
  }));

  return (
    <Card>
      <h3 className="text-sm font-medium text-text-secondary mb-4">
        Активность за 14 дней
      </h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <XAxis dataKey="label" tick={{ fill: "#5a4f3a", fontSize: 10 }} stroke="#2a2218" />
            <YAxis
              tick={{ fill: "#5a4f3a", fontSize: 10 }}
              stroke="#2a2218"
              width={30}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "#1c1916",
                border: "1px solid #2a2218",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#a09070" }}
              itemStyle={{ color: "#fdba74" }}
            />
            <Line
              type="monotone"
              dataKey="runs"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 2, fill: "#f97316" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
