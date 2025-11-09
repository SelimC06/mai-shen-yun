import React from "react";

type KPICardProps = {
  title: string;
  value: string;
  change: string;
  color: string;
};


const KPIcards: React.FC<KPICardProps> = ({ title, value, change }) => {
    return (
    <div className="bg-white shadow-sm rounded-2xl p-4 border border-slate-100">
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h2 className="text-xl font-bold text-slate-800 mt-1">{value}</h2>
      <p
        className={`text-xs mt-1 ${
          change.startsWith("-") ? "text-red-500" : "text-green-500"
        }`}
      >
        {change}
      </p>
    </div>
  );
};

export default KPIcards