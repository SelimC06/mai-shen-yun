import os
import json
import pandas as pd

# ============== PATHS ==============

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Raw files (Data_Matrix + MSY Data files)
DATA_DIR = BASE_DIR + "/data/raw"

# Output folder for frontend JSON
OUT_DIR = os.path.join(BASE_DIR, "data", "processed")
os.makedirs(OUT_DIR, exist_ok=True)

ALLOWED_EXT = (".xlsx", ".xls", ".csv")

# ============== HELPERS ==============

def clean_money(x):
    if pd.isna(x):
        return 0.0
    if isinstance(x, (int, float)):
        return float(x)
    s = str(x).replace("$", "").replace(",", "").strip()
    return float(s) if s else 0.0

def clean_int(x):
    if pd.isna(x):
        return 0
    s = str(x).strip()
    if not s:
        return 0
    try:
        return int(float(s.replace(",", "")))
    except ValueError:
        return 0

def dump_json(name, data):
    out_path = os.path.join(OUT_DIR, name)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"Wrote {out_path} ({len(data)} rows)")

def find_file_exact(basename_without_ext):
    """Find a file whose name starts with basename_without_ext and has an allowed extension."""
    for fn in os.listdir(DATA_DIR):
        if fn.startswith(basename_without_ext) and fn.lower().endswith(ALLOWED_EXT):
            return os.path.join(DATA_DIR, fn)
    return None

def read_table(path, sheet_keyword=None):
    """If CSV: read_csv. If Excel: pick sheet containing sheet_keyword, else first sheet."""
    if path.lower().endswith(".csv"):
        return pd.read_csv(path)

    xls = pd.ExcelFile(path)
    if sheet_keyword:
        cands = [s for s in xls.sheet_names if sheet_keyword.lower() in s.lower()]
        if cands:
            return xls.parse(cands[0])
    return xls.parse(xls.sheet_names[0])

# ============== 0) MONTH → FILE BASENAME ==============

MONTH_FILES = {
    "2024-05": "May_Data_Matrix (1)",
    "2024-06": "June_Data_Matrix",
    "2024-07": "July_Data_Matrix (1)",
    "2024-08": "August_Data_Matrix (1)",
    "2024-09": "September_Data_Matrix",
    "2024-10": "October_Data_Matrix",
}

menu_groups_rows = []       # category-level aggregates per month (from data 2)
item_sales_rows = []        # item-level sales per month (from data 3)
item_categories_rows = []   # (month, item, category, count, revenue) from data 3

# =========================================================
# 1) Per month:
#    - data 3 → item_sales + item_categories
#    - data 2 → menu_groups (category totals)
# =========================================================

for month, base in MONTH_FILES.items():
    path = find_file_exact(base)
    if not path:
        print(f"[WARN] No file found for {month} (basename '{base}')")
        continue

    # -------- data 3: item-level sales --------
    try:
        d3 = read_table(path, sheet_keyword="data 3")
    except Exception as e:
        print(f"[WARN] No 'data 3' sheet in {path} for {month}: {e}")
        d3 = None

    if d3 is not None:
        d3.columns = [str(c).strip() for c in d3.columns]

        # detect columns
        item_col_3 = next(
            (c for c in d3.columns if "item" in c.lower() and "name" in c.lower()),
            None,
        )
        if not item_col_3:
            item_col_3 = next(
                (c for c in d3.columns if "item" in c.lower() or "menu" in c.lower()),
                None,
            )

        cat_col_3 = next(
            (c for c in d3.columns if "category" in c.lower()),
            None,
        )

        if not item_col_3 or "Count" not in d3.columns or "Amount" not in d3.columns:
            print(f"[WARN] Missing Item/Count/Amount in data 3 for {month}, skipping item-level.")
        else:
            sales = d3[[item_col_3, "Count", "Amount"] + ([cat_col_3] if cat_col_3 else [])].copy()
            sales[item_col_3] = sales[item_col_3].astype(str).str.strip()
            if cat_col_3:
                sales[cat_col_3] = sales[cat_col_3].astype(str).str.strip()
            sales["Count"] = sales["Count"].apply(clean_int)
            sales["Amount"] = sales["Amount"].apply(clean_money)
            sales = sales[(sales[item_col_3] != "") & (sales["Count"] > 0)]

            # item_sales.json
            for _, r in sales.iterrows():
                item_sales_rows.append(
                    {
                        "month": month,
                        "item": r[item_col_3],
                        "count": int(r["Count"]),
                        "revenue": float(r["Amount"]),
                    }
                )

            # item_categories.json (this is what you wanted: includes revenue)
            if cat_col_3:
                for _, r in sales.iterrows():
                    item_categories_rows.append(
                        {
                            "month": month,
                            "item": r[item_col_3],
                            "category": r[cat_col_3] or "Uncategorized",
                            "count": int(r["Count"]),
                            "revenue": float(r["Amount"]),
                        }
                    )
            else:
                # no category in data 3; still output without category
                for _, r in sales.iterrows():
                    item_categories_rows.append(
                        {
                            "month": month,
                            "item": r[item_col_3],
                            "category": "Uncategorized",
                            "count": int(r["Count"]),
                            "revenue": float(r["Amount"]),
                        }
                    )

    # -------- data 2: category-level summary (your screenshot) --------
    try:
        d2 = read_table(path, sheet_keyword="data 2")
    except Exception as e:
        print(f"[WARN] No 'data 2' sheet in {path} for {month}: {e}")
        d2 = None

    if d2 is not None:
        d2.columns = [str(c).strip() for c in d2.columns]

        # expect columns like: Category, Count, Amount
        cat_col_2 = next(
            (c for c in d2.columns if "category" in c.lower()),
            None,
        )
        count_col_2 = "Count" if "Count" in d2.columns else None
        amount_col_2 = "Amount" if "Amount" in d2.columns else None

        if not cat_col_2 or not count_col_2 or not amount_col_2:
            # if structure is different, we don't crash; just skip with a warning
            print(f"[WARN] data 2 for {month} not in expected [Category, Count, Amount] shape.")
        else:
            cats = d2[[cat_col_2, count_col_2, amount_col_2]].copy()
            cats[cat_col_2] = cats[cat_col_2].astype(str).str.strip()
            cats[count_col_2] = cats[count_col_2].apply(clean_int)
            cats[amount_col_2] = cats[amount_col_2].apply(clean_money)
            cats = cats[cats[cat_col_2] != ""]

            for _, r in cats.iterrows():
                menu_groups_rows.append(
                    {
                        "month": month,
                        "group": r[cat_col_2],
                        "count": int(r[count_col_2]),
                        "revenue": float(r[amount_col_2]),
                    }
                )

# =========================================================
# 2) Ingredient / recipe mapping (MSY Data - Ingredient)
# =========================================================

ing_path = find_file_exact("MSY Data - Ingredient")
if not ing_path:
    raise SystemExit("MSY Data - Ingredient file not found.")

recipes = read_table(ing_path)
recipes.columns = [str(c).strip() for c in recipes.columns]

item_name_col = next(
    (c for c in recipes.columns if "item" in c.lower() and "name" in c.lower()),
    None,
)
if not item_name_col:
    raise SystemExit("Could not find an 'Item name' column in MSY Data - Ingredient.")

ingredient_cols = [c for c in recipes.columns if c != item_name_col]

# =========================================================
# 3) Ingredient usage per month = item_sales × recipe matrix
# =========================================================

ingredient_usage = {}  # (month, ingredient) -> qty

item_df = pd.DataFrame(item_sales_rows)

if not item_df.empty:
    merged_recipes = item_df.merge(
        recipes,
        left_on="item",
        right_on=item_name_col,
        how="left",
    )

    for _, row in merged_recipes.iterrows():
        count = row.get("count", row.get("Count", 0))
        if pd.isna(count) or count == 0:
            continue

        month = row.get("month")
        if not isinstance(month, str):
            continue

        for col in ingredient_cols:
            qty_per_serv = row.get(col)
            if pd.isna(qty_per_serv) or qty_per_serv == 0:
                continue

            ing_name = col.strip()
            total_used = float(qty_per_serv) * float(count)
            key = (month, ing_name)
            ingredient_usage[key] = ingredient_usage.get(key, 0.0) + total_used

ingredient_usage_rows = [
    {
        "month": m,
        "ingredient": ing,
        "used_qty": round(qty, 4),
        "unit": "g",  # tweak if your recipe units differ
    }
    for (m, ing), qty in sorted(ingredient_usage.items())
]

# =========================================================
# 4) Shipments (MSY Data - Shipment)
# =========================================================

ship_path = find_file_exact("MSY Data - Shipment")
if not ship_path:
    print("[WARN] MSY Data - Shipment file not found.")
    shipments_rows = []
else:
    ship = read_table(ship_path)
    ship.columns = [str(c).strip() for c in ship.columns]
    colmap = {c.lower(): c for c in ship.columns}

    def col(name: str):
        return colmap.get(name.lower())

    ing_col = col("ingredient")
    qty_col = col("quantity per shipment")
    unit_col = col("unit of shipment")
    num_col = col("number of shipments")
    freq_col = col("frequency") or col("freq")

    # Map shipment ingredient names -> ingredient_usage names
    NAME_ALIASES = {
        # direct mismatches
        "Bokchoy": ["Boychoy(g)"],
        "Peas + Carrot": ["Peas(g)", "Carrot(g)"],
        # assume bulk chicken/beef shipments feed braised components
        "Chicken": ["Braised Chicken(g)"],
        "Beef": ["Braised Pork(g)"],
    }

    def freq_to_multiplier(freq) -> float | None:
        if freq is None or (isinstance(freq, float) and pd.isna(freq)):
            return None
        s = str(freq).strip().lower()
        if not s:
            return None
        if "biweekly" in s or "bi-weekly" in s:
            return 2.0          # twice a month
        if "weekly" in s:
            return 4.0          # four times a month
        if "monthly" in s:
            return 1.0
        return 1.0              # fallback

    def to_grams(qty: float, unit: str | None) -> float | None:
        if unit is None:
            return None
        u = unit.strip().lower()
        if u in ("lb", "lbs", "pound", "pounds"):
            return qty * 453.592
        # eggs/pieces/etc: don't auto-convert
        return None

    shipments_rows = []

    for _, r in ship.iterrows():
        if not ing_col or pd.isna(r.get(ing_col, None)):
            continue

        ingredient_raw = str(r[ing_col]).strip()
        if not ingredient_raw:
            continue

        # if we know an alias mapping, use those targets; else use the raw name
        target_names = NAME_ALIASES.get(ingredient_raw, [ingredient_raw])

        raw_qty = r.get(qty_col) if qty_col else None
        if pd.isna(raw_qty):
            continue
        try:
            quantity_per_shipment = float(raw_qty)
        except (TypeError, ValueError):
            continue

        unit = str(r.get(unit_col, "")).strip() if unit_col else ""

        num_ship = r.get(num_col) if num_col is not None else None
        freq_raw = r.get(freq_col) if freq_col else None

        freq_mult = freq_to_multiplier(freq_raw)
        if num_ship is not None and not pd.isna(num_ship) and freq_mult is not None:
            shipments_per_month = float(num_ship) * freq_mult
        else:
            shipments_per_month = None

        monthly_quantity = (
            quantity_per_shipment * shipments_per_month
            if shipments_per_month is not None
            else None
        )

        # If one shipment row maps to multiple targets (Peas + Carrot, Beef->Braised Pork, etc),
        # split volume evenly. You can tweak ratios later if you want.
        share = 1.0 / len(target_names)

        for target in target_names:
            tq = monthly_quantity * share if monthly_quantity is not None else None
            tq_grams = to_grams(tq, unit) if tq is not None else None

            shipments_rows.append(
                {
                    "ingredient": target,
                    "quantity_per_shipment": quantity_per_shipment * share
                    if len(target_names) > 1
                    else quantity_per_shipment,
                    "unit": unit or None,
                    "number_of_shipments": float(num_ship)
                    if (num_ship is not None and not pd.isna(num_ship))
                    else None,
                    "frequency": str(freq_raw).strip()
                    if freq_raw not in (None, float("nan"))
                    else None,
                    "shipments_per_month": shipments_per_month,
                    "monthly_quantity": tq,
                    "monthly_quantity_grams": tq_grams,
                }
            )

import math
from collections import defaultdict

# Build: ingredient -> sorted list of (month_index, used_qty)
# Map months like "2024-05", "2024-06", ... to indices 0,1,2,...
all_month_keys = sorted({row["month"] for row in ingredient_usage_rows})
month_index = {m: i for i, m in enumerate(all_month_keys)}

usage_by_ing = defaultdict(list)
for row in ingredient_usage_rows:
    m = row["month"]
    ing = row["ingredient"]
    qty = float(row["used_qty"])
    if m in month_index:
        usage_by_ing[ing].append((month_index[m], qty))

def linear_forecast(points):
    """
    points: list of (x, y)
    returns forecast_y for x = max_x + 1 using simple linear regression.
    falls back to last value if not enough points.
    """
    if len(points) == 0:
        return None
    if len(points) == 1:
        return points[0][1]

    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    n = len(points)
    mean_x = sum(xs) / n
    mean_y = sum(ys) / n

    num = sum((xs[i] - mean_x) * (ys[i] - mean_y) for i in range(n))
    den = sum((xs[i] - mean_x) ** 2 for i in range(n))
    slope = num / den if den != 0 else 0.0
    intercept = mean_y - slope * mean_x

    next_x = max(xs) + 1
    y_hat = slope * next_x + intercept
    # avoid negative forecasts
    return max(y_hat, 0.0)

# Quick lookup for planned shipments (use monthly_quantity_grams if present, else monthly_quantity)
shipment_plan = {}
for s in shipments_rows:
    ing = s["ingredient"]
    planned = (
        s.get("monthly_quantity_grams")
        if s.get("monthly_quantity_grams") is not None
        else s.get("monthly_quantity")
    )
    if planned is None:
        continue
    # if multiple rows for same ingredient, sum them
    shipment_plan[ing] = shipment_plan.get(ing, 0.0) + float(planned)

from collections import defaultdict

# Sorted unique months from usage
all_month_keys = sorted({row["month"] for row in ingredient_usage_rows})
month_index = {m: i for i, m in enumerate(all_month_keys)}

usage_by_ing = defaultdict(list)
for row in ingredient_usage_rows:
    m = row["month"]
    ing = row["ingredient"]
    qty = float(row["used_qty"])
    if m in month_index:
        usage_by_ing[ing].append((month_index[m], qty))

def linear_forecast(points):
    if len(points) == 0:
        return None
    if len(points) == 1:
        return max(points[0][1], 0.0)
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    n = len(points)
    mean_x = sum(xs) / n
    mean_y = sum(ys) / n
    num = sum((xs[i] - mean_x) * (ys[i] - mean_y) for i in range(n))
    den = sum((xs[i] - mean_x) ** 2 for i in range(n))
    slope = num / den if den != 0 else 0
    intercept = mean_y - slope * mean_x
    next_x = max(xs) + 1
    y_hat = slope * next_x + intercept
    return max(y_hat, 0.0)

shipment_plan = {}
for s in shipments_rows:
    ing = s["ingredient"]
    planned = (
        s.get("monthly_quantity_grams")
        if s.get("monthly_quantity_grams") is not None
        else s.get("monthly_quantity")
    )
    if planned is None:
        continue
    shipment_plan[ing] = shipment_plan.get(ing, 0.0) + float(planned)

forecast_rows = []

for base_i, base_month in enumerate(all_month_keys[:-1]):
    target_month = all_month_keys[base_i + 1]
    for ing, series in usage_by_ing.items():
        pts = [(x, y) for (x, y) in series if x <= base_i]
        if not pts:
            continue
        forecast = linear_forecast(pts)
        if forecast is None:
            continue
        first_x, first_y = pts[0]
        last_x, last_y = pts[-1]
        slope_simple = (last_y - first_y) / max(last_x - first_x, 1)
        if first_y > 0 and slope_simple > 0.05 * first_y:
            trend = "increasing"
        elif first_y > 0 and slope_simple < -0.05 * first_y:
            trend = "decreasing"
        else:
            trend = "stable"

        planned = shipment_plan.get(ing)
        if planned and planned > 0:
            ratio = forecast / planned
            if ratio >= 1.2:
                risk = "shortage_risk"
            elif ratio <= 0.67:
                risk = "overstock_risk"
            else:
                risk = "balanced"
        else:
            ratio = None
            risk = "no_plan"

        forecast_rows.append({
            "month": base_month,                 # <-- for filtering
            "forecast_target": target_month,     # next month
            "ingredient": ing,
            "forecast_next": round(forecast, 2),
            "trend": trend,
            "planned_monthly": round(planned, 2) if planned is not None else None,
            "forecast_to_plan_ratio": round(ratio, 3) if ratio is not None else None,
            "risk": risk,
        })

# =========================================================
# 5) Write JSONs
# =========================================================

dump_json("ingredient_demand_forecast.json", forecast_rows)
dump_json("menu_groups.json", menu_groups_rows)
dump_json("item_sales.json", item_sales_rows)
dump_json("item_categories.json", item_categories_rows)
dump_json("ingredient_usage_timeseries.json", ingredient_usage_rows)
dump_json("ingredient_shipments.json", shipments_rows)

print("All processed JSONs written.")
