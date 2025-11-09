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

const data = [
  { category: "Drink", count: 2200 },
  { category: "Lunch Special", count: 380 },
  { category: "Fried Chicken", count: 930 },
  { category: "Ramen", count: 870 },
  { category: "Dessert", count: 540 },
  { category: "Appetizer", count: 410 },
  { category: "Fruit Tea", count: 360 },
];

const CategoryBarChart: React.FC = () => {
    return(
        <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-xl font-semibold text-slate-800">
                    Orders by Category
                </h2>
                <span className="text-xs     text-slate-500">
                    Top selling menu groups (sample data)
                </span>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top:4, right: 50, left: 0, bottom: 4}}
                    >
                        <XAxis
                            type="number"
                            tickLine={false}
                            axisLine={false}
                            fontSize={10}
                        />
                        <YAxis
                            dataKey="category"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            width={100}
                            fontSize={12}
                            fill="#000000ff"
                        />
                        <Tooltip
                            cursor={{ fill: "rgba(129,140,248,0.06)" }}
                            contentStyle={{
                                borderRadius: 12,
                                border: "1px solid #858585ff",
                                fontSize: 10,
                        }}
                        />
                        <Bar
                            dataKey="count"
                            radius={[999, 999, 999, 999]}
                            fill="#000000ff"
                        >
                        <LabelList
                            dataKey="count"
                            position="right"
                            offset={6}
                            fontSize={11}
                            fill="#000000ff"
                        />
                        </Bar>
                        </BarChart>
                </ResponsiveContainer>

            </div>
        </div>
    )
}

export default CategoryBarChart;