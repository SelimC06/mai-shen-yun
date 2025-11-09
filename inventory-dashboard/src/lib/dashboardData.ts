export type MenuGroup = {
  month: string;
  group: string;
  count: number;
  revenue: number;
};

export type ItemSale = {
  month: string;
  item: string;
  count: number;
  revenue: number;
};

export type IngredientUsage = {
  month: string;
  ingredient: string;
  used_qty: number;
  unit: string;
};

export type Shipment = {
  ingredient: string;
  quantity_per_shipment: number;
  unit: string | null;
  shipments_per_month: number | null;
  frequency: string | null;
};

export type KPI = {
  title: string;
  value: string;
  change: string;
};

export const MONTH_OPTIONS = [
  { label: "May 2024", value: "2024-05" },
  { label: "June 2024", value: "2024-06" },
  { label: "July 2024", value: "2024-07" },
  { label: "August 2024", value: "2024-08" },
  { label: "September 2024", value: "2024-09" },
  { label: "October 2024", value: "2024-10" },
];

export function buildKpis(
  groups: MenuGroup[],
  items: ItemSale[],
  usage: IngredientUsage[]
): KPI[] {
  const totalOrders = items.reduce((s, r) => s + r.count, 0);
  const totalRevenue = groups.reduce((s, r) => s + r.revenue, 0);
  const uniqueIngredients = new Set(usage.map((u) => u.ingredient)).size;

  return [
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      change: "+0.0%",
    },
    {
      title: "Total Revenue",
      value:
        "$" +
        totalRevenue.toLocaleString(undefined, {
          maximumFractionDigits: 0,
        }),
      change: "+0.0%",
    },
    {
      title: "Active Ingredients Used",
      value: uniqueIngredients.toString(),
      change: "+0.0%",
    },
    {
      title: "Canceled / At-Risk Orders",
      value: "0",
      change: "N/A",
    },
  ];
}

export function buildShipmentUsageMerge(
  usage: IngredientUsage[],
  shipments: Shipment[]
) {
  const shipMap = new Map<string, Shipment>();
  shipments.forEach((s) => {
    shipMap.set(s.ingredient.toLowerCase(), s);
  });

  return usage
    .map((u) => {
      const s = shipMap.get(u.ingredient.toLowerCase());
      const monthlyPlanned =
        s && s.shipments_per_month && s.quantity_per_shipment
          ? s.shipments_per_month * s.quantity_per_shipment
          : 0;
      const utilization =
        monthlyPlanned > 0 ? u.used_qty / monthlyPlanned : null;

      return {
        ingredient: u.ingredient,
        estimated: Number(u.used_qty.toFixed(2)),
        shipment: monthlyPlanned,
        utilization,
      };
    })
    .filter((row) => row.estimated > 0 || row.shipment > 0);
}