import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from "recharts";
import { type IngredientUsage } from "../lib/dashboardData";

type Props = {
  data: IngredientUsage[];
}

const IngredientUsageChart: React.FC<Props> = ({ data }) => {
    const rows = data
        .slice()
        .sort((a, b) => b.used_qty - a.used_qty)
        .slice(0, 15)
        .map((u) => ({
        ingredient: u.ingredient,
        usage: u.used_qty,
    }));

    return (
        <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-xl font-semibold text-slate-800">
                    Estimated Ingredient Usage
                </h2>
                <span className="text-sm text-slate-500">
                    Based on historical orders & menu mapping
                </span>
            </div>

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={rows}
                        layout="vertical"
                        margin={{ top:4, right:40, left:-40, bottom: 4}}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            type="category"
                            dataKey="ingredient"
                            axisLine={false}
                            width={150}
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            fontWeight="bold"
                            interval={0}
                        />
                        <Tooltip
                            cursor={{ fill: "rgba(79,70,229,0.04)"}}
                            contentStyle={{
                                borderRadius: 12,
                                border: "1px solid #e5e7eb",
                                fontSize: 10,
                            }}
                            formatter={(value: any) => [`${value.toLocaleString()}`, "Usage"]}
                        />
                        <Bar 
                            dataKey="usage"
                            radius={[999, 999, 999, 999]}
                            fill="#000000ff"
                            stroke="none"
                            isAnimationActive={false}
                        >
                            <LabelList
                                dataKey="usage"
                                position="right"
                                offset={6}
                                fontSize={11}
                                fontWeight="bold"
                                formatter={(value: any) =>
                                value >= 1000
                                    ? `${(value / 1000).toFixed(0)}k`
                                    : `${value}`
                                }
                                fill="#000000ff"
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default IngredientUsageChart