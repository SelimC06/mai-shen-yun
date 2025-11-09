import React from "react";

type Props = {
  title: string;
  value: string;
  change?: string;
};


const KPIcards: React.FC<Props> = ({ title, value, change }) => {
    return (
    <div className="bg-white shadow-sm rounded-2xl p-4 border border-slate-100">
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-xl font-bold text-slate-800 mt-1">{value}</p>
      {change && (
        <p className="mt-0.5 text-[10px] text-emerald-500">{change}</p>
        )}
    </div>
  );
};

export default KPIcards