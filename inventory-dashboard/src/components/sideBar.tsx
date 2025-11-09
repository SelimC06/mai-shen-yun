import React from 'react';
import house from "../images/house.png"
import logo from '../images/logo.png';
import customer from "../images/customer.png";
import delivery from "../images/delivery.png";
import order from "../images/orders.png";
import report from "../images/reports.png";

const SideBar: React.FC = () => {
    return(
        <aside className='w-60 h-full bg-white border-r border-slate-200 px-4 pt-4'>
            <img className='w-54 mb-5 mx-auto' src={logo}/>
            <div 
                id="Inventory Dashboard"
                className="
                    w-52 mb-2
                    inline-flex items-center gap-2 px-3 py-2
                    rounded-2xl
                    border border-transparent
                    hover:bg-slate-200 hover:border-gray-300
                    focus:bg-blue-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-300
                    transition-colors
                    mx-auto
                    outline-none"
                    tabIndex={0}
                >
                <div className="h-9 w-9 rounded-xl bg-black/10 flex items-center justify-center text-lg font-bold">
                    <img className="h-6 " src={house} />
                </div>
                <button>
                    <p className="text-sm font-semibold text-black">Dashboard</p>
                </button>
            </div>
            <div 
                id="Customer"
                className="
                    w-52 mb-2
                    inline-flex items-center gap-2 px-3 py-2
                    rounded-2xl
                    border border-transparent
                    hover:bg-slate-200 hover:border-gray-300
                    focus:bg-blue-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-300
                    transition-colors
                    mx-auto
                    outline-none"
                    tabIndex={0}
                >
                <div className="h-9 w-9 rounded-xl bg-black/10 flex items-center justify-center text-lg font-bold">
                    <img className="h-5 " src={customer} />
                </div>
                <button>
                    <p className="text-sm font-semibold text-black">Customer</p>
                </button>
            </div>
            <div 
                id="Delivery"
                className="
                    w-52 mb-2
                    inline-flex items-center gap-2 px-3 py-2
                    rounded-2xl
                    border border-transparent
                    hover:bg-slate-200 hover:border-gray-300
                    focus:bg-blue-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-300
                    transition-colors
                    mx-auto
                    outline-none"
                    tabIndex={0}
                >
                <div className="h-9 w-9 rounded-xl bg-black/10 flex items-center justify-center text-lg font-bold">
                    <img className="h-6 " src={delivery} />
                </div>
                <button>
                    <p className="text-sm font-semibold text-black">Delivery</p>
                </button>
            </div>
            <div 
                id="Orders"
                className="
                    w-52 mb-2
                    inline-flex items-center gap-2 px-3 py-2
                    rounded-2xl
                    border border-transparent
                    hover:bg-slate-200 hover:border-gray-300
                    focus:bg-blue-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-300
                    transition-colors
                    mx-auto
                    outline-none"
                    tabIndex={0}
                >
                <div className="h-9 w-9 rounded-xl bg-black/10 flex items-center justify-center text-lg font-bold">
                    <img className="h-7" src={order} />
                </div>
                <button>
                    <p className="text-sm font-semibold text-black">Orders</p>
                </button>
            </div>
            <div
                id="Reports"
                className="
                    w-52 mb-2
                    inline-flex items-center gap-2 px-3 py-2
                    rounded-2xl
                    border border-transparent
                    hover:bg-slate-200 hover:border-gray-300
                    focus:bg-blue-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-300
                    transition-colors
                    mx-auto
                    outline-none"
                    tabIndex={0}
                    >
                <div className="h-9 w-9 rounded-xl bg-black/10 flex items-center justify-center text-lg font-bold">
                    <img className="h-5" src={report} />
                </div>
                <button>
                    <p className="text-sm font-semibold text-black">Reports</p>
                </button>
            </div>
        </aside>
    )
};

export default SideBar;