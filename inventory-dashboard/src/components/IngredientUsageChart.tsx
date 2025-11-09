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

type UsagePoint = {
  ingredient: string;
  usage: number;
};

type Props = {
  data: UsagePoint[];
};


const IngredientUsageChart: React.FC<Props> = ({ data }) => {
    const sorted = data
    .slice()
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 15);

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
                        data={sorted}
                        layout="vertical"
                        margin={{ top:4, right:50, left:0, bottom: 4}}
                    >
                        <XAxis
                            type="number"
                            tickLine={false}
                            axisLine={false}
                            fontSize={10}
                            tickFormatter={(v) =>
                                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                            }
                        />
                        <YAxis
                            type="category"
                            dataKey="ingredient"
                            tickLine={false}
                            axisLine={false}
                            width={120}
                            fontSize={12}
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