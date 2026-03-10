# -*- coding: utf-8 -*-
#终端-更新指令：/opt/anaconda3/envs/xbx311/bin/python "/Users/MSI1/Desktop/CFA/单词卡/built_from_excel.py" "/Users/MSI1/Desktop/CFA/单词卡.xlsx" "/Users/MSI1/Desktop/CFA/单词卡"
"""
从 Excel 生成 cards_data.js（只更新普通列表数据，不覆盖 app.js）

Excel 列名（必须匹配，可为空）：
- 单词
- 单词中文
- 英文注释
- 中文注释

用法：
python3 build_from_excel.py "/Users/MSI1/Desktop/CFA/单词卡.xlsx" "/Users/MSI1/Desktop/CFA/单词卡"
"""

from __future__ import annotations
import json
import sys
from pathlib import Path
import pandas as pd

REQUIRED_COLS = ["单词", "单词中文", "英文注释", "中文注释"]

def clean(v) -> str:
    if v is None:
        return ""
    try:
        if pd.isna(v):
            return ""
    except Exception:
        pass
    return str(v).strip()

def read_df_with_required_cols(xlsx_path: Path) -> pd.DataFrame:
    df = pd.read_excel(xlsx_path)
    if set(REQUIRED_COLS).issubset(df.columns):
        return df

    xls = pd.ExcelFile(xlsx_path)
    for sheet in xls.sheet_names:
        tmp = pd.read_excel(xlsx_path, sheet_name=sheet)
        if set(REQUIRED_COLS).issubset(tmp.columns):
            return tmp

    raise ValueError(
        "Excel 里没找到所需列名：\n"
        f"{REQUIRED_COLS}\n"
        f"当前读到的列名：{list(df.columns)}"
    )

def load_cards(xlsx_path: Path) -> list[dict]:
    df = read_df_with_required_cols(xlsx_path)
    cards = []
    for _, r in df.iterrows():
        word = clean(r.get("单词"))
        if not word:
            continue
        cards.append({
            "word": word,
            "zh": clean(r.get("单词中文")),
            "en_note": clean(r.get("英文注释")),
            "zh_note": clean(r.get("中文注释")),
        })
    return cards

def main():
    if len(sys.argv) < 3:
        print("用法：python3 build_from_excel.py <excel_path> <project_dir>")
        sys.exit(1)

    excel_path = Path(sys.argv[1]).expanduser()
    project_dir = Path(sys.argv[2]).expanduser()
    project_dir.mkdir(parents=True, exist_ok=True)

    cards = load_cards(excel_path)
    if not cards:
        raise ValueError("Excel 里没有有效单词：检查“单词”列是否为空。")

    cards_json = json.dumps(cards, ensure_ascii=False, indent=2)
    out_path = (project_dir / "cards_data.js").resolve()

    js = (
        "// 由 build_from_excel.py 自动生成\n"
        f"// 数据来源：{excel_path}\n"
        "window.CARDS = "
        + cards_json
        + ";\n"
    )

    out_path.write_text(js, encoding="utf-8")
    print(f"✅ 已生成：{out_path}")
    print(f"✅ 单词数量：{len(cards)}")

if __name__ == "__main__":
    main()