#!/usr/bin/env python3
"""
يولّد app/src/fixtures/demo-catalog/curriculumOfferings.json من curriculum_matrix.csv
معرّف 12 رقمی: S(1) G(1) T(1) + تسلسل 9 أرقام.
S: 1=ابتدائي 2=إعدادي 3=ثانوي
G: رقم الصف داخل المرحلة (1..6 أو 1..3)
T: 0=عام/كل المسارات، 1=علمي عربي، 2=علمي لغات، 3=أدبي
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path

STAGE_CODE = {"primary": 1, "prep": 2, "secondary": 3}

GRADES = {
    "primary": [
        "الصف الأول الابتدائي",
        "الصف الثاني الابتدائي",
        "الصف الثالث الابتدائي",
        "الصف الرابع الابتدائي",
        "الصف الخامس الابتدائي",
        "الصف السادس الابتدائي",
    ],
    "prep": [
        "الصف الأول الإعدادي",
        "الصف الثاني الإعدادي",
        "الصف الثالث الإعدادي",
    ],
    "secondary": [
        "الصف الأول الثانوي",
        "الصف الثاني الثانوي",
        "الصف الثالث الثانوي",
    ],
}

# يجب أن تطابق slugs في app/src/fixtures/demo-catalog/subjects.ts
ALLOWED_SLUGS = {
    "arabic",
    "english",
    "connect-plus",
    "math",
    "discover",
    "science",
    "social-studies",
    "ict",
    "french",
    "german",
    "italian",
    "spanish",
    "history",
    "philosophy",
    "integrated-science",
    "physics",
    "chemistry",
    "biology",
    "geography",
    "psychology-social",
    "statistics",
}


def track_to_digit(track_raw: str) -> int:
    t = (track_raw or "").strip()
    if t == "":
        return 0
    m = {
        "scientific_ar": 1,
        "scientific_languages": 2,
        "literary": 3,
    }
    if t not in m:
        raise ValueError(f"secondary_track غير معروف: {t!r}")
    return m[t]


def grade_index(stage: str, grade: str) -> int:
    rows = GRADES.get(stage)
    if not rows:
        raise ValueError(f"مرحلة غير معروفة: {stage!r}")
    try:
        return rows.index(grade) + 1
    except ValueError as e:
        raise ValueError(
            f"نص صف غير معروف للمرحلة {stage!r}: {grade!r}. يجب أن يطابق educationTracks"
        ) from e


def build_id(s: int, g: int, t: int, seq: int) -> str:
    if seq < 1 or seq > 999_999_999:
        raise ValueError("التسلسل يجب أن يكون من 1 إلى 999999999")
    return f"{s}{g}{t}{seq:09d}"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        type=Path,
        default=Path(__file__).resolve().parent / "curriculum_matrix.csv",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).resolve().parent.parent
        / "app"
        / "src"
        / "fixtures"
        / "demo-catalog"
        / "curriculumOfferings.json",
    )
    args = parser.parse_args()

    offerings = []
    seen_ids: set[str] = set()
    seq = 0

    with args.input.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            stage = (row.get("stage") or "").strip()
            grade = (row.get("grade") or "").strip()
            slug = (row.get("subject_slug") or "").strip()
            st_raw = (row.get("secondary_track") or "").strip()

            if not stage or not grade or not slug:
                print("تخطي سطر ناقص الحقول", row, file=sys.stderr)
                continue

            if slug not in ALLOWED_SLUGS:
                print(f"خطأ: subject_slug غير معروف في subjects: {slug!r}", file=sys.stderr)
                return 1

            if stage not in STAGE_CODE:
                print(f"خطأ: stage: {stage!r}", file=sys.stderr)
                return 1

            if stage != "secondary" and st_raw:
                print(
                    f"خطأ: secondary_track مسموح فقط لثانوي: {row}",
                    file=sys.stderr,
                )
                return 1

            s = STAGE_CODE[stage]
            g = grade_index(stage, grade)
            t = track_to_digit(st_raw if stage == "secondary" else "")
            seq += 1
            oid = build_id(s, g, t, seq)
            if oid in seen_ids:
                print(f"تصادم معرف: {oid}", file=sys.stderr)
                return 1
            seen_ids.add(oid)

            item: dict = {
                "id": oid,
                "subjectSlug": slug,
                "stage": stage,
                "grade": grade,
            }
            if st_raw and stage == "secondary":
                item["secondaryTrack"] = st_raw

            offerings.append(item)

    out_obj = {"offerings": offerings}
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8") as f:
        json.dump(out_obj, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"تم كتابة {len(offerings)} عرضاً إلى {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
