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
import { type MenuGroup } from "../lib/dashboardData";

type Props = {
  data: MenuGroup[]; // already filtered by month
};

const CategoryBarChart: React.FC<Props> = ({ data }) => {
    const rows = data
    .filter(
      (d) =>
        d.group &&
        d.group.trim() !== "" &&
        d.group.toLowerCase() !== "category" &&
        d.count > 0
    )
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 12) // top N
    .map((d) => ({
      category: d.group.trim(),
      count: d.count,
    }));

    console.table(rows);
    return(
        <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-xl font-semibold text-slate-800">
                    Orders by Category
                </h2>
                <span className="text-xs text-slate-500">
                    Top selling menu groups
                </span>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={rows}
                        layout="vertical"
                        margin={{ top:4, right: 40, left: -40, bottom: 4}}
                    >
                        <XAxis type="number" hide/>
                        <YAxis
                            type="category"
                            dataKey="category"
                            axisLine={false}
                            width={150}
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            interval={0}
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