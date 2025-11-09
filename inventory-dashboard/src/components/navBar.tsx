import React from "react";

type TopBarProps = {
  month: string;
  onMonthChange: (value: string) => void;
};

const TopBar: React.FC<TopBarProps> = ({ month, onMonthChange }) => {
  return (
    <header className="w-full h-16 bg-white flex items-center justify-between px-6 border-b border-slate-200 shadow-sm">
      {/* Left - Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
        <div className="relative">
        <select
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
            className="
                appearance-none
                h-8
                text-xs pl-4 pr-8 rounded-full
                bg-slate-50 border border-slate-200
                text-slate-700
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                cursor-pointer
            "
        >
            <option>January</option>
            <option>February</option>
            <option>March</option>
            <option>April</option>
            <option>May</option>
            <option>June</option>
            <option>July</option>
            <option>August</option>
            <option>September</option>
            <option>October</option>
            <option>November</option>
            <option>December</option>
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-base">
            ▾
        </span>
        </div>
      </div>

      {/* Center - Search */}
      <div className="relative w-80">
        <input
          type="text"
          placeholder="Search Order ID"
          className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300 transition"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
          />
        </svg>
      </div>

      {/* Right - Icons + Profile */}
      <div className="flex items-center gap-4">
        <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-300">
          <img
            src="https://media.tenor.com/Xcxyu8a6ITYAAAAM/mcdonalds.gif"
            alt="Profile"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
