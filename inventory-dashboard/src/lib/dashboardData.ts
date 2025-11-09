// src/lib/dashboardData.ts

export type MenuGroup = {
  month: string;
  group: string;
  count: number;
  revenue: number;
};

export type ItemCategory = {
  month: string;
  item: string;
  category: string;
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
  number_of_shipments: number | null;
  frequency: string | null;
  shipments_per_month: number | null;
  monthly_quantity: number | null;
  monthly_quantity_grams: number | null;
};

export type ForecastRow = {
  month: string;
  forecast_target: string;
  ingredient: string;
  forecast_next: number;
  trend: string;
  planned_monthly: number | null;
  forecast_to_plan_ratio: number | null;
  risk: string;
};

export function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")     // drop stuff in parentheses: (g), (count)
    .replace(/[^a-z]+/g, "")     // keep only letters
    .trim();
}

export const MONTH_OPTIONS = [
  { label: "May", value: "2024-05" },
  { label: "June", value: "2024-06" },
  { label: "July", value: "2024-07" },
  { label: "August", value: "2024-08" },
  { label: "September", value: "2024-09" },
  { label: "October", value: "2024-10" },
];

export function buildKpis(
  groups: MenuGroup[],
  items: ItemSale[],
  usage: IngredientUsage[]
) {
  const totalOrders = items.reduce((s, r) => s + r.count, 0);
  const totalRevenue = groups.reduce((s, r) => s + r.revenue, 0);
  const uniqueIngredients = new Set(usage.map((u) => u.ingredient)).size;

  return [
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      change: "", // plug in MoM later
    },
    {
      title: "Total Revenue",
      value:
        "$" +
        totalRevenue.toLocaleString(undefined, {
          maximumFractionDigits: 0,
        }),
      change: "",
    },
    {
      title: "Active Ingredients Used",
      value: uniqueIngredients.toString(),
      change: "",
    },
  ];
}

export function buildShipmentUsageMerge(
  usage: IngredientUsage[],
  shipments: Shipment[]
) {
  const shipmentIndex = new Map<
    string,
    { shipment: number; rawName: string }
  >();

  shipments.forEach((s) => {
    if (!s.ingredient) return;
    const key = normalizeIngredientName(s.ingredient);
    if (!key) return;

    const shipmentQty =
      s.monthly_quantity_grams ??
      s.monthly_quantity ??
      (s.shipments_per_month && s.quantity_per_shipment
        ? s.shipments_per_month * s.quantity_per_shipment
        : 0);

    if (!shipmentQty || shipmentQty <= 0) return;

    const existing = shipmentIndex.get(key);
    if (!existing || shipmentQty > existing.shipment) {
      shipmentIndex.set(key, {
        shipment: shipmentQty,
        rawName: s.ingredient,
      });
    }
  });

  return usage
    .map((u) => {
      const key = normalizeIngredientName(u.ingredient);
      if (!key) return null;

      const match = shipmentIndex.get(key);

      const shipment = match?.shipment ?? 0;
      const utilization =
        shipment > 0 ? u.used_qty / shipment : null;

      return {
        ingredient: u.ingredient,
        usage: u.used_qty,
        shipment,
        utilization,
      };
    })
    .filter(
      (row): row is NonNullable<typeof row> =>
        !!row && (row.usage > 0 || row.shipment > 0)
    );
}