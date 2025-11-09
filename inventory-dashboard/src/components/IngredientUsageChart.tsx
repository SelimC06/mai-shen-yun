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

const ingredientUsageData = [
  { ingredient: "Rice Noodles", usage: 18540 },
  { ingredient: "Tapioca Starch", usage: 28170 },
  { ingredient: "BoyChoy", usage: 15660 },
  { ingredient: "Cabbage", usage: 11285 },
  { ingredient: "Pickle Cabbage", usage: 10650 },
  { ingredient: "Ramen Noodles", usage: 33710 },
  { ingredient: "Chicken Wings", usage: 15794 },
  { ingredient: "Carrots", usage: 1341.43 },
  { ingredient: "Potato", usage: 1341.43 },
  { ingredient: "White Onion", usage: 2096.44 },
  { ingredient: "Green Onion", usage: 15232.48 },
  { ingredient: "Egg", usage: 681.89 },
  { ingredient: "Braised Chicken", usage: 100523.73 },
];

const IngredientUsageChart: React.FC = () => {
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
                        data={ingredientUsageData}
                        layout="vertical"
                        margin={{ top:4, right:50, left: 0, bottom: 4}}
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