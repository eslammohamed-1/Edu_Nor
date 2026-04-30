#!/usr/bin/env python3
"""
Reads data/csv/*.csv, builds nested courses, merges ToC JSON, writes catalog.json.
Run from repo root: python3 scripts/build_catalog_from_csv.py
"""

from __future__ import annotations

import csv
import json
import sys
from collections import defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CSV_DIR = REPO / "data" / "csv"
TOC_PATH = (
    REPO
    / "app"
    / "src"
    / "fixtures"
    / "demo-catalog"
    / "toc"
    / "generated"
    / "coursesFromToc.json"
)
OUT_PATH = (
    REPO
    / "app"
    / "src"
    / "fixtures"
    / "demo-catalog"
    / "generated"
    / "catalog.json"
)
OUT_DIR = OUT_PATH.parent
LEARNERS_PATH = CSV_DIR / "learners_export.csv"


def read_csv(name: str) -> list[dict[str, str]]:
    path = CSV_DIR / name
    if not path.exists():
        print(f"خطأ: ملف مفقود {path}", file=sys.stderr)
        sys.exit(1)
    with path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def split_stages(raw: str) -> list[str]:
    return [s.strip() for s in raw.replace(";", "|").split("|") if s.strip()]


def opt_float(x: str) -> float | None:
    x = (x or "").strip()
    if x == "":
        return None
    try:
        return float(x)
    except ValueError:
        return None


def opt_int(x: str) -> int | None:
    x = (x or "").strip()
    if x == "":
        return None
    try:
        return int(float(x))
    except ValueError:
        return None


def build_manual_courses() -> list[dict]:
    read_csv("subjects.csv")  # validate file exists early

    course_rows = read_csv("courses.csv")
    chapter_rows = read_csv("chapters.csv")
    lesson_rows = read_csv("lessons.csv")

    chapters_by_course: dict[str, list[dict]] = defaultdict(list)
    for row in chapter_rows:
        chapters_by_course[row["course_id"]].append(row)

    lessons_by_chapter: dict[str, list[dict]] = defaultdict(list)
    for row in lesson_rows:
        lessons_by_chapter[row["chapter_id"]].append(row)

    courses_out: list[dict] = []

    for cr in course_rows:
        cid = cr["id"]
        chapters_out: list[dict] = []
        for ch in sorted(chapters_by_course[cid], key=lambda x: int(x["sort_order"] or 0)):
            chid = ch["id"]
            lessons_out: list[dict] = []
            for lr in sorted(lessons_by_chapter[chid], key=lambda x: int(x["sort_order"] or 0)):
                lesson: dict = {
                    "id": lr["id"],
                    "title": lr["title"],
                    "description": lr["description"],
                    "duration": int(lr["duration"] or 0),
                    "type": lr["type"] or "video",
                    "content": lr["content"] or "",
                    "order": int(lr["sort_order"] or 0),
                }
                vu = (lr.get("video_url") or "").strip()
                if vu:
                    lesson["videoUrl"] = vu
                kp = (lr.get("key_points") or "").strip()
                if kp:
                    lesson["keyPoints"] = [p.strip() for p in kp.split("|") if p.strip()]
                lessons_out.append(lesson)

            chapters_out.append(
                {
                    "id": ch["id"],
                    "title": ch["title"],
                    "description": ch["description"],
                    "order": int(ch["sort_order"] or 0),
                    "lessons": lessons_out,
                }
            )

        course: dict = {
            "id": cid,
            "subjectId": cr["subject_id"],
            "title": cr["title"],
            "description": cr["description"],
            "stage": cr["stage"],
            "grade": cr["grade"],
            "instructor": cr["instructor"],
            "duration": int(cr["duration"] or 0),
            "lessonsCount": int(cr["lessons_count"] or 0),
            "studentsCount": int(cr["students_count"] or 0),
            "rating": float(cr["rating"] or 0),
            "chapters": chapters_out,
        }

        oid = (cr.get("offering_id") or "").strip()
        if oid:
            course["offeringId"] = oid

        st = (cr.get("secondary_track") or "").strip()
        if st:
            course["secondaryTrack"] = st

        ay = (cr.get("academic_year") or "").strip()
        if ay:
            course["academicYear"] = ay

        term = opt_int(cr.get("term") or "")
        if term is not None:
            course["term"] = term

        season = opt_int(cr.get("season") or "")
        if season is not None:
            course["season"] = season

        thumb = (cr.get("thumbnail") or "").strip()
        if thumb:
            course["thumbnail"] = thumb

        prog = opt_float(cr.get("progress") or "")
        if prog is not None:
            course["progress"] = prog

        course["lessonsCount"] = lesson_total(course)

        courses_out.append(course)

    return courses_out


def lesson_total(course: dict) -> int:
    n = 0
    for ch in course.get("chapters") or []:
        n += len(ch.get("lessons") or [])
    return n


def compute_subject_stats(
    subjects_rows: list[dict], merged_courses: list[dict]
) -> list[dict]:
    by_sub = defaultdict(list)
    for c in merged_courses:
        by_sub[c["subjectId"]].append(c)

    out: list[dict] = []
    for sr in subjects_rows:
        sid = sr["id"]
        cs = by_sub[sid]
        courses_count = len(cs)
        lessons_count = sum(lesson_total(c) for c in cs)
        out.append(
            {
                "id": sid,
                "name": sr["name"],
                "slug": sr["slug"],
                "icon": sr["icon"],
                "color": sr["color"],
                "stages": split_stages(sr["stages"]),
                "description": sr["description"],
                "lessonsCount": lessons_count,
                "coursesCount": courses_count,
            }
        )
    return out


def load_landing() -> dict:
    features = read_csv("landing_features.csv")
    stages = read_csv("landing_stages.csv")
    stats = read_csv("landing_stats.csv")
    return {
        "features": [
            {"title": r["title"], "desc": r["desc"], "icon": r["icon"], "color": r["color"]}
            for r in features
        ],
        "stages": [
            {
                "name": r["name"],
                "icon": r["icon"],
                "color": r["color"],
                "count": r["count"],
            }
            for r in stages
        ],
        "stats": [
            {"label": r["label"], "value": r["value"], "icon": r["icon"]} for r in stats
        ],
    }


def load_admin_dashboard() -> dict:
    qa = read_csv("admin_quick_actions.csv")
    ct = read_csv("admin_chart_titles.csv")
    rev = read_csv("admin_revenue_demo.csv")[0]
    titles = {r["key"]: r["value"] for r in ct}
    return {
        "quickActions": [
            {
                "label": r["label"],
                "icon": r["icon"],
                "to": r["to"],
                "color": r["color"],
            }
            for r in qa
        ],
        "demoRevenueStat": {
            "title": rev["title"],
            "value": rev["value"],
            "icon": rev["icon"],
            "color": rev["color"],
            "delta": rev["delta"],
            "trend": rev["trend"],
        },
        "chartTitles": {
            "signupsLine": titles.get("signups_line", ""),
            "lessonsBar": titles.get("lessons_bar", ""),
        },
    }


def ensure_learners_header() -> None:
    LEARNERS_PATH.parent.mkdir(parents=True, exist_ok=True)
    header = "id,email,name,phone,stage,grade,secondary_track,registered_at\n"
    if not LEARNERS_PATH.exists() or LEARNERS_PATH.stat().st_size == 0:
        LEARNERS_PATH.write_text(header, encoding="utf-8")


def main() -> int:
    if not CSV_DIR.is_dir():
        print(f"خطأ: مجلد غير موجود {CSV_DIR}", file=sys.stderr)
        return 1

    subjects_rows = read_csv("subjects.csv")
    manual = build_manual_courses()

    ensure_learners_header()

    if not TOC_PATH.exists():
        print(f"خطأ: ملف ToC مفقود {TOC_PATH}", file=sys.stderr)
        return 1

    with TOC_PATH.open(encoding="utf-8") as f:
        toc_courses = json.load(f)

    if not isinstance(toc_courses, list):
        print("خطأ: coursesFromToc.json يجب أن يكون مصفوفة كورسات", file=sys.stderr)
        return 1

    merged = [*manual, *toc_courses]
    subjects_out = compute_subject_stats(subjects_rows, merged)

    catalog = {
        "subjects": subjects_out,
        "courses": merged,
        "landing": load_landing(),
        "adminDashboard": load_admin_dashboard(),
    }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with OUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)
        f.write("\n")

    split_outputs = {
        "subjects.json": subjects_out,
        "courses.json": merged,
        "landing.json": catalog["landing"],
        "adminDashboard.json": catalog["adminDashboard"],
    }
    for filename, payload in split_outputs.items():
        with (OUT_DIR / filename).open("w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
            f.write("\n")

    print(f"تم كتابة {OUT_PATH} ({len(subjects_out)} مادة، {len(merged)} كورس)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
