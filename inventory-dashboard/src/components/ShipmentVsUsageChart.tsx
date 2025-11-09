import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
    LabelList,
} from "recharts";

const data = [
  { ingredient: "Chicken", estimated: 235.41, shipment: 40 },
  { ingredient: "Ramen", estimated: 313, shipment: 50 },
  { ingredient: "Rice Noodles", estimated: 207.01, shipment: 50 },
  { ingredient: "Flour", estimated: 78.87, shipment: 50 },
  { ingredient: "Tapioca Starch", estimated: 62.1, shipment: 25 },
  { ingredient: "Rice", estimated: 310.52, shipment: 50 },
  { ingredient: "Green Onion", estimated: 33.52, shipment: 20 },
  { ingredient: "Cilantro", estimated: 27.6, shipment: 5 },
  { ingredient: "Egg", estimated: 681.89, shipment: 120 },
  { ingredient: "Peas + Carrot", estimated: 0, shipment: 40 },
  { ingredient: "Boychoy", estimated: 0, shipment: 25 },
];

const ShipmentVsUsageChart: React.FC = () => {
    return(
        <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-xl font-semibold text-slate-800">
                    Shipment vs Estimated Usage
                </h2>
                <span className="text-sm text-slate-500">
                    Compare delivered quantity against expected demand
                </span>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 24, left: 0, bottom: 24 }}
                    >
                        <CartesianGrid stroke="#eef2ff" vertical={false} />
                        <XAxis
                            dataKey="ingredient"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            fontWeight={'bold'}
                            axisLine={{ stroke: "#e5e7eb" }}
                            interval={0}
                            angle={-30}
                            textAnchor="end"
                            height={50}
                        />
                        <YAxis
                            tick={{ fontSize: 9 }}
                            tickLine={false}
                            axisLine={{ stroke: "#e5e7eb" }}
                            label={{
                                value: "Units",
                                angle: -90,
                                position: "insideLeft",
                                offset: 10,
                                style: { fontSize: 14, fill: "#6b7280", fontWeight: 'bold'},
                            }}
                        />
                        <Tooltip
                            cursor={{ fill: "rgba(148,163,253,0.08)" }}
                            contentStyle={{
                                borderRadius: 12,
                                border: "1px solid #e5e7eb",
                                fontSize: 10,
                            }}
                        />
                        <Legend 
                            verticalAlign="top"
                            align="right"
                            iconSize={8}
                            wrapperStyle={{ fontSize: 13, fontWeight:'bold' }}
                        />

                        <Bar
                            dataKey="estimated"
                            name="Estimated usage"
                            fill="#000000ff"
                            radius={[4, 4, 0, 0]}
                        >
                            <LabelList
                                dataKey="estimated"
                                position="top"
                                formatter={(v: any) => v ? (v >= 100 ? v.toFixed(0) : v.toFixed(2)) : ""}
                                fontSize={14}
                                fill="#000000ff"
                            />
                        </Bar>

                        <Bar
                            dataKey="shipment"
                            name="Shipment Qty"
                            fill="#ff0000ff"
                            radius={[4, 4, 0, 0]}
                        >
                            <LabelList
                                dataKey="shipment"
                                position="top"
                                formatter={(v: any) => (v ? v.toFixed(0) : "")}
                                fontSize={14}
                                fill="#ff0000ff"
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default ShipmentVsUsageChart;