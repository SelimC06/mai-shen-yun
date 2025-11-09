import os
import json
import pandas as pd

# ============== PATHS ==============

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR = BASE_DIR + "/data/raw"

OUT_DIR = os.path.join(BASE_DIR, "data", "processed")
os.makedirs(OUT_DIR, exist_ok=True)

# ============== HELPERS ==============

ALLOWED_EXT = (".xlsx", ".xls", ".csv")

def clean_money(x):
    if pd.isna(x):
        return 0.0
    if isinstance(x, (int, float)):
        return float(x)
    return float(str(x).replace("$", "").replace(",", "").strip() or 0)

def clean_int(x):
    if pd.isna(x) or str(x).strip() == "":
        return 0
    try:
        return int(float(str(x).replace(",", "").strip()))
    except ValueError:
        return 0

def dump_json(name, data):
    out_path = os.path.join(OUT_DIR, name)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"Wrote {out_path} ({len(data)} rows)")

def find_file_exact(basename_without_ext):
    """
    For a given base name (e.g. 'May_Data_Matrix (1)' or 'MSY Data - Ingredient'),
    find a file in DATA_DIR that starts exactly with that and has an allowed extension.
    """
    for fn in os.listdir(DATA_DIR):
        if not fn.startswith(basename_without_ext):
            continue
        if fn.lower().endswith(ALLOWED_EXT):
            return os.path.join(DATA_DIR, fn)
    return None

def read_table(path, sheet_keyword=None):
    """
    If CSV: read_csv.
    If Excel: if sheet_keyword is given, pick matching sheet; else first sheet.
    """
    if path.lower().endswith(".csv"):
        return pd.read_csv(path)

    xls = pd.ExcelFile(path)
    if sheet_keyword:
        cands = [s for s in xls.sheet_names if sheet_keyword.lower() in s.lower()]
        if cands:
            return xls.parse(cands[0])
    # fallback
    return xls.parse(xls.sheet_names[0])

# ============== 0) MONTH → FILE BASENAME ==============

# These basenames match exactly what you showed in the screenshot
MONTH_FILES = {
    "2024-05": "May_Data_Matrix (1)",
    "2024-06": "June_Data_Matrix",
    "2024-07": "July_Data_Matrix (1)",
    "2024-08": "August_Data_Matrix (1)",
    "2024-09": "September_Data_Matrix",
    "2024-10": "October_Data_Matrix_20251103_214000",
}

# ============== 1) MENU GROUPS + ITEM SALES PER MONTH ==============

menu_groups_rows = []
item_sales_rows = []

for month, base in MONTH_FILES.items():
    path = find_file_exact(base)
    if not path:
        print(f"[WARN] No file found for {month} (basename '{base}')")
        continue

    # ----- Group-level summary: sheet 'data 1' -----
    g = read_table(path, sheet_keyword="data 1")
    g.columns = [str(c).strip() for c in g.columns]

    if {"Group", "Count", "Amount"} <= set(g.columns):
        for _, r in g.iterrows():
            group = str(r["Group"]).strip()
            if not group or group.lower().startswith("nan"):
                continue
            menu_groups_rows.append({
                "month": month,
                "group": group,
                "count": clean_int(r["Count"]),
                "revenue": clean_money(r["Amount"]),
            })

    # ----- Item-level sales: sheet 'data 3' -----
    try:
        i = read_table(path, sheet_keyword="data 3")
        i.columns = [str(c).strip() for c in i.columns]
    except Exception:
        # some months might not have this; that's fine
        continue

    name_col = None
    for c in i.columns:
        if "item" in c.lower() and "name" in c.lower():
            name_col = c
            break

    if name_col and "Count" in i.columns and "Amount" in i.columns:
        for _, r in i.iterrows():
            item = str(r[name_col]).strip()
            if not item or item.lower().startswith("nan"):
                continue
            item_sales_rows.append({
                "month": month,
                "item": item,
                "count": clean_int(r["Count"]),
                "revenue": clean_money(r["Amount"]),
            })

# ============== 2) INGREDIENT / RECIPE MAPPING ==============

ing_path = find_file_exact("MSY Data - Ingredient")
if not ing_path:
    raise SystemExit("MSY Data - Ingredient file not found next to preprocess.py")

recipes = read_table(ing_path)
recipes.columns = [str(c).strip() for c in recipes.columns]

item_name_col = None
for c in recipes.columns:
    if "item" in c.lower() and "name" in c.lower():
        item_name_col = c
        break
if not item_name_col:
    raise SystemExit("Could not find an 'Item name' column in MSY Data - Ingredient.")

ingredient_cols = [c for c in recipes.columns if c != item_name_col]

# ============== 3) INGREDIENT USAGE PER MONTH (FROM SALES + RECIPES) ==============

ingredient_usage = {}  # (month, ingredient) -> total qty
item_df = pd.DataFrame(item_sales_rows)

if not item_df.empty:
    merged = item_df.merge(
        recipes,
        left_on="item",
        right_on=item_name_col,
        how="left",
    )

    for _, row in merged.iterrows():
        count = row.get("count", 0)
        if pd.isna(count) or count == 0:
            continue

        for col in ingredient_cols:
            qty_per_serv = row.get(col)
            if pd.isna(qty_per_serv) or qty_per_serv == 0:
                continue

            ing_name = col.strip()
            total_used = float(qty_per_serv) * float(count)
            key = (row["month"], ing_name)
            ingredient_usage[key] = ingredient_usage.get(key, 0.0) + total_used

ingredient_usage_rows = [
    {
        "month": m,
        "ingredient": ing,
        "used_qty": round(qty, 4),
        "unit": "g",  # adjust if your ingredient sheet uses other units
    }
    for (m, ing), qty in sorted(ingredient_usage.items())
]

# ============== 4) SHIPMENTS ==============

ship_path = find_file_exact("MSY Data - Shipment")
if not ship_path:
    print("[WARN] MSY Data - Shipment file not found.")
    shipments_rows = []
else:
    ship = read_table(ship_path)
    ship.columns = [str(c).strip() for c in ship.columns]

    # map columns by lowercase name
    colmap = {c.lower(): c for c in ship.columns}

    def col(name):
        return colmap.get(name.lower())

    ing_col = col("ingredient")
    qty_col = col("quantity per shipment")
    unit_col = col("unit of shipment")
    num_col = col("number of shipments")
    freq_col = col("frequency") or col("freq")

    shipments_rows = []
    for _, r in ship.iterrows():
        if not ing_col or pd.isna(r.get(ing_col, None)):
            continue

        ingredient = str(r[ing_col]).strip()
        if not ingredient:
            continue

        qty = r.get(qty_col) if qty_col else None
        if pd.isna(qty):
            continue

        unit = str(r.get(unit_col, "")).strip() if unit_col else ""
        num_ship = r.get(num_col) if num_col else None
        freq = str(r.get(freq_col, "")).strip() if freq_col else ""

        shipments_rows.append({
            "ingredient": ingredient,
            "quantity_per_shipment": float(qty),
            "unit": unit or None,
            "shipments_per_month": float(num_ship) if (num_ship is not None and not pd.isna(num_ship)) else None,
            "frequency": freq or None,
        })

# ============== 5) WRITE JSONS ==============

dump_json("menu_groups.json", menu_groups_rows)
dump_json("item_sales.json", item_sales_rows)
dump_json("ingredient_usage_timeseries.json", ingredient_usage_rows)
dump_json("ingredient_shipments.json", shipments_rows)

print("Done.")
