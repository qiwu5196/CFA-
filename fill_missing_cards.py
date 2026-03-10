# -*- coding: utf-8 -*-
from __future__ import annotations
import json
import math
import subprocess
import sys
from pathlib import Path
import pandas as pd

REQUIRED_COLS = ["单词", "单词中文", "英文注释", "中文注释"]
BATCH_SIZE = 20
AGENT = "xiaobai-web"

SYSTEM_RULES = """你是CFA/经济学术语单词卡编辑助手。
任务：根据给定术语，补全缺失字段。
要求：
1. 输出必须是 JSON 数组，不要输出 markdown，不要解释。
2. 每个对象必须包含：word, zh, en_note, zh_note 四个键。
3. 保留原有正确内容；只在缺失时补全。
4. 中文尽量准确、简洁、适合单词卡学习。
5. 如果英文注释缺失，补一个简洁准确的英文定义。
6. 如果中文注释缺失，给出简洁准确的中文解释。
7. 不要留空字符串，除非该字段确实不适合填写（通常都应填写）。
"""


def clean(v) -> str:
    if v is None:
        return ""
    try:
        if pd.isna(v):
            return ""
    except Exception:
        pass
    return str(v).strip()


def chunked(items, size):
    for i in range(0, len(items), size):
        yield items[i:i+size]


def load_df(xlsx_path: Path):
    xls = pd.ExcelFile(xlsx_path)
    for sheet in xls.sheet_names:
        df = pd.read_excel(xlsx_path, sheet_name=sheet)
        if set(REQUIRED_COLS).issubset(df.columns):
            return sheet, df
    raise ValueError("Excel 中未找到所需列")


def call_agent(batch):
    prompt = SYSTEM_RULES + "\n输入数据：\n" + json.dumps(batch, ensure_ascii=False, indent=2)
    result = subprocess.run(
        [
            "openclaw", "agent",
            "--agent", AGENT,
            "--message", prompt,
            "--json",
            "--timeout", "90",
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    payload = json.loads(result.stdout)
    texts = []
    for item in payload.get("result", {}).get("payloads", []):
        text = item.get("text")
        if isinstance(text, str) and text.strip():
            texts.append(text.strip())
    raw = "\n".join(texts).strip()
    start = raw.find("[")
    end = raw.rfind("]")
    if start == -1 or end == -1:
        raise ValueError(f"无法解析模型输出: {raw[:500]}")
    return json.loads(raw[start:end+1])


def main():
    if len(sys.argv) < 2:
        print("用法: python fill_missing_cards.py <excel_path>")
        sys.exit(1)

    xlsx_path = Path(sys.argv[1]).expanduser().resolve()
    sheet, df = load_df(xlsx_path)

    for col in REQUIRED_COLS:
        df[col] = df[col].map(clean)

    mask = (df["单词中文"] == "") | (df["英文注释"] == "") | (df["中文注释"] == "")
    missing_df = df.loc[mask, REQUIRED_COLS].copy()
    rows = missing_df.to_dict(orient="records")

    print(f"需要补全 {len(rows)} 行")
    completed = []
    for idx, batch in enumerate(chunked(rows, BATCH_SIZE), start=1):
        print(f"处理批次 {idx}/{math.ceil(len(rows)/BATCH_SIZE)} ...", flush=True)
        enriched = call_agent(batch)
        completed.extend(enriched)

    by_word = {item["word"]: item for item in completed if item.get("word")}

    for i, row in df.iterrows():
        word = row["单词"]
        if word in by_word:
            item = by_word[word]
            for src, dst in [("zh", "单词中文"), ("en_note", "英文注释"), ("zh_note", "中文注释")]:
                value = clean(item.get(src))
                if value:
                    df.at[i, dst] = value

    backup = xlsx_path.with_suffix(".backup-before-fill.xlsx")
    if not backup.exists():
        backup.write_bytes(xlsx_path.read_bytes())

    with pd.ExcelWriter(xlsx_path, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name=sheet)

    print(f"已写回 Excel: {xlsx_path}")
    print(f"已备份原文件: {backup}")


if __name__ == "__main__":
    main()
