import { useState } from 'react';
import reactLogo from './assets/react.svg';
import SideBar from './components/sideBar';
import TopBar from './components/navBar';
import KPIcards from './components/KPIcards';
import CategoryBarChart from './components/CategoryBarChart';
import IngredientUsageChart from './components/IngredientUsageChart';
import ShipmentVsUsageChart from './components/ShipmentVsUsageChart';

function App() {
  const [selectedMonth, setSelectedMonth] = useState("October 2024");

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
              <KPIcards title="Total Orders" value="1750" change="+8.56%" color="teal" />
              <KPIcards title="Total Delivered" value="567" change="+9.6%" color="yellow" />
              <KPIcards title="Total Revenue" value="₹1,29,750" change="-9.6%" color="blue" />
              <KPIcards title="Total Canceled" value="125" change="+12.3%" color="rose" />
            </div>

            <CategoryBarChart />

            <IngredientUsageChart />

            <ShipmentVsUsageChart />
          </main>
        </div>
      </div>
  )
}

export default App
