import { useState, useMemo } from 'react';
import SideBar from './components/sideBar';
import TopBar from './components/navBar';
import KPIcards from './components/KPIcards';
import CategoryBarChart from './components/CategoryBarChart';
import IngredientUsageChart from './components/IngredientUsageChart';
import ShipmentVsUsageChart from './components/ShipmentVsUsageChart';
import InventoryInsights from "./components/InventoryInsights";

import menuGroupsJson from "./data/processed/menu_groups.json";
import itemSalesJson from "./data/processed/item_sales.json";
import ingredientUsageJson from "./data/processed/ingredient_usage_timeseries.json";
import shipmentsJson from "./data/processed/ingredient_shipments.json";
import forecastJson from "./data/processed/ingredient_demand_forecast.json";


import {
  type MenuGroup,
  type ItemSale,
  type IngredientUsage,
  type Shipment,
  type ForecastRow,
  buildKpis,
} from "./lib/dashboardData";

const menuGroups = menuGroupsJson as MenuGroup[];
const itemSales = itemSalesJson as ItemSale[];
const ingredientUsage = ingredientUsageJson as IngredientUsage[];
const shipments = shipmentsJson as Shipment[];
const forecastData = forecastJson as ForecastRow[];

function App() {
  const [selectedMonth, setSelectedMonth] = useState("2024-10");

  const forecastForMonth = useMemo(
    () => forecastData.filter((f) => f.month === selectedMonth),
    [selectedMonth]
  );

  const groupsForMonth = useMemo(
    () => menuGroups.filter((g) => g.month === selectedMonth),
    [selectedMonth]
  );

  const itemsForMonth = useMemo(
    () => itemSales.filter((i) => i.month === selectedMonth),
    [selectedMonth]
  );

  const usageForMonth = useMemo(
    () => ingredientUsage.filter((u) => u.month === selectedMonth),
    [selectedMonth]
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
              />
              ))}
            </div>

            <CategoryBarChart data={groupsForMonth}/>

            <IngredientUsageChart data={usageForMonth}/>

            <ShipmentVsUsageChart usage={usageForMonth} shipments={shipments} />

            <InventoryInsights data={forecastForMonth} />
          </main>
        </div>
      </div>
  )
}

export default App
