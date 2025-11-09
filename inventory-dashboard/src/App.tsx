import { useState, useMemo } from 'react';
import reactLogo from './assets/react.svg';
import SideBar from './components/sideBar';
import TopBar from './components/navBar';
import KPIcards from './components/KPIcards';
import CategoryBarChart from './components/CategoryBarChart';
import IngredientUsageChart from './components/IngredientUsageChart';
import ShipmentVsUsageChart from './components/ShipmentVsUsageChart';

import menuGroupsJson from "./data/processed/menu_groups.json";
import itemSalesJson from "./data/processed/item_sales.json";
import ingredientUsageJson from "./data/processed/ingredient_usage_timeseries.json";
import shipmentsJson from "./data/processed/ingredient_shipments.json";

import {
  type MenuGroup,
  type ItemSale,
  type IngredientUsage,
  type Shipment,
  MONTH_OPTIONS,
  buildKpis,
} from "./lib/dashboardData";

function App() {
  const [selectedMonth, setSelectedMonth] = useState("2024-10");

  const menuGroups = menuGroupsJson as MenuGroup[];
  const itemSales = itemSalesJson as ItemSale[];
  const ingredientUsage = ingredientUsageJson as IngredientUsage[];
  const shipments = shipmentsJson as Shipment[];

  const groupsForMonth = useMemo(
    () => menuGroups.filter((g) => g.month === selectedMonth),
    [menuGroups, selectedMonth]
  );

  const itemsForMonth = useMemo(
    () => itemSales.filter((i) => i.month === selectedMonth),
    [itemSales, selectedMonth]
  );

  const usageForMonth = useMemo(
    () => ingredientUsage.filter((u) => u.month === selectedMonth),
    [ingredientUsage, selectedMonth]
  );

  const kpis = useMemo(
    () => buildKpis(groupsForMonth, itemsForMonth, usageForMonth),
    [groupsForMonth, itemsForMonth, usageForMonth]
  );

  return (
      <div className='flex h-screen bg-slate-50'>
        <SideBar />
        <div className="flex-1 flex flex-col">
          <TopBar 
            month={selectedMonth}
            onMonthChange={setSelectedMonth}
          />

          <main className='flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8faff]'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {kpis.map((kpi) => (
                <KPIcards
                  key={kpi.title}
                  title={kpi.title}
                  value={kpi.value}
                  change={kpi.change}
                  color=""
                />
              ))}
            </div>

            <CategoryBarChart
              data={groupsForMonth.map((g) => ({
                category: g.group,
                count: g.count,
              }))}
            />

            <IngredientUsageChart
              data={usageForMonth
                .slice()
                .sort((a, b) => b.used_qty - a.used_qty)
                .slice(0, 15)
                .map((u) => ({
                  ingredient: u.ingredient,
                  usage: u.used_qty,
                }))}
            />

            <ShipmentVsUsageChart usage={usageForMonth} shipments={shipments}/>
          </main>
        </div>
      </div>
  )
}

export default App
