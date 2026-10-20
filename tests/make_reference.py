"""用正式版 Python 引擎生成参考结果，供 compare.js 逐条比对。
运行（在 liuri-widget 目录）：python3 tests/make_reference.py"""
import json, os, random, sys
from datetime import datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", ".."))
from engine import chart, connections  # noqa: E402
from timeline import now_view  # noqa: E402

random.seed(42)
ms = lambda d: int(d.timestamp() * 1000)
start = datetime(1950, 1, 1, tzinfo=timezone.utc)
charts = []
for _ in range(300):
    moment = start + timedelta(seconds=random.randint(0, 100 * 365 * 86400))
    c = chart(moment)
    charts.append({"ms": ms(moment), "designMs": ms(datetime.fromisoformat(c["designTimeUtc"])),
                   **{k: {n: [p["lon"], p["gl"]["gate"], p["gl"]["line"]] for n, p in c[k].items()}
                      for k in ("personality", "design")}})
views = []
for _ in range(12):
    birth = start + timedelta(seconds=random.randint(0, 55 * 365 * 86400))
    now = datetime(2026, 1, 1, tzinfo=timezone.utc) + timedelta(seconds=random.randint(0, 365 * 86400))
    v = now_view(birth, now)
    views.append({"birthMs": ms(birth), "nowMs": ms(now), "view": v})
# 月历：每天中午 12:00（北京时间）接通的通道，与正式版 /api/month 相同。
months = []
for _ in range(3):
    birth = start + timedelta(seconds=random.randint(0, 55 * 365 * 86400))
    birth_chart = chart(birth)
    days = [[c["channel"] for c in connections(birth_chart, chart(datetime(2026, 10, d, 4, tzinfo=timezone.utc)))]
            for d in range(1, 32)]
    months.append({"birthMs": ms(birth), "days": days})
json.dump({"charts": charts, "views": views, "months": months}, open(os.path.join(HERE, "reference.json"), "w"), ensure_ascii=False)
print("charts", len(charts), "views", len(views), "months", len(months))
