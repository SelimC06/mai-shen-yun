import React from "react";

type ForecastRow = {
    ingredient: string,
    forecast_next: number,
    trend: "increasing" | "decreasing" | "stable" | string;
    planned_monthly: number | null;
    forecast_to_plan_ratio: number| null;
    risk: "shortage_risk" | "overstock_risk" | "balanced" | "no_plan" | string;
};

interface Props{
    data: ForecastRow[];
}

const InventoryInsights: React.FC<Props> = ({ data }) => {
    const shortage = data
        .filter((d) => d.risk === "shortage_risk")
        .sort((a, b) => (b.forecast_to_plan_ratio ?? 0) - (a.forecast_to_plan_ratio ?? 0))
        .slice(0, 5);

    const overstock = data
        .filter((d) => d.risk === "overstock_risk")
        .sort((a, b) => (a.forecast_to_plan_ratio ?? 0) - (b.forecast_to_plan_ratio ?? 0))
        .slice(0, 5);

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 grid md:grid-cols-2 gap-4">
            <div>
                <h3 className="text-xl font-semibold text-slate-800">
                    Shortage risk (next month)
                </h3> 
                {shortage.length === 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                        No ingredients flagged. Current plan covers forecasted demand.
                    </p>
                )}
                <ul className="mt-1 space-y-1">
                    {shortage.map((d) => (
                        <li key={d.ingredient} className="text-xs text-slate-800">
                        <span className="font-semibold">{d.ingredient}</span>{" "}
                        — forecast <b>{Math.round(d.forecast_next).toLocaleString()}</b>
                        {d.planned_monthly
                            ? <> vs plan {Math.round(d.planned_monthly).toLocaleString()}</>
                            : <> (no shipment plan)</>}
                    </li>
                    ))}
                </ul>
            </div>

            <div>
                <h3 className="text-xl font-semibold text-slate-800">
                    Overstock risk (slow-moving)
                </h3>
                {overstock.length === 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                        No clear overstock signals based on current forecast.
                    </p>
                )}
                <ul className="mt-1 space-y-1">
                    {overstock.map((d) => (
                        <li key={d.ingredient} className="text-xs text-slate-800">
                        <span className="font-semibold">{d.ingredient}</span>{" "}
                        — forecast <b>{Math.round(d.forecast_next).toLocaleString()}</b>
                        {d.planned_monthly && (
                            <> vs plan {Math.round(d.planned_monthly).toLocaleString()}</>
                        )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default InventoryInsights;