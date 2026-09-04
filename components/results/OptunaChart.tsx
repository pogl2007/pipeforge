"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from "recharts";
import type { OptunaTrial } from "@/types";

export function OptunaChart({
  history,
  bestParams,
}: {
  history: OptunaTrial[];
  bestParams: Record<string, number | string>;
}) {
  const bestTrial = history.reduce(
    (best, t) => (t.score > best.score ? t : best),
    history[0] ?? { trial: 0, score: 0 }
  );

  const paramsLine = Object.entries(bestParams)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");

  return (
    <div>
      <h3 className="text-sm font-medium text-text-secondary mb-4">Optuna: история подбора</h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="trial"
              tick={{ fill: "#5a4f3a", fontSize: 10 }}
              stroke="#2a2218"
            />
            <YAxis tick={{ fill: "#5a4f3a", fontSize: 10 }} stroke="#2a2218" width={40} />
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
              dataKey="score"
              stroke="#f97316"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload, key } = props;
                const isBest = payload.trial === bestTrial.trial;
                return (
                  <Dot
                    key={key}
                    cx={cx}
                    cy={cy}
                    r={isBest ? 5 : 2}
                    fill={isBest ? "#f97316" : "#3d3020"}
                    stroke={isBest ? "#fdba74" : "none"}
                    strokeWidth={isBest ? 2 : 0}
                  />
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs font-mono text-text-secondary mt-2">
        Лучшие параметры: {paramsLine}
      </p>
    </div>
  );
}
