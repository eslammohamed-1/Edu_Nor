# EduNor — Content Plan: Question System | خطة المحتوى: نظام الأسئلة

## 🎯 Overview

خطة بناء نظام الأسئلة التفاعلي لمنصة EduNor — يدعم **13 نوع سؤال** مع rich content (HTML, رموز رياضية, صور).

---

## 📊 Question Types Summary

| # | Type | الاسم العربي | التعقيد | الأولوية |
|---|------|-------------|---------|---------|
| 1 | `mcq` | اختيار من متعدد | 🟢 بسيط | P1 — Critical |
| 2 | `mrq` | إجابات متعددة | 🟢 بسيط | P1 — Critical |
| 3 | `ordering` | ترتيب | 🟡 متوسط | P2 — High |
| 4 | `matching` | توصيل | 🟡 متوسط | P2 — High |
| 5 | `gap` | إكمال الفراغات | 🟡 متوسط | P2 — High |
| 6 | `input` | إدخال رقمي | 🟢 بسيط | P1 — Critical |
| 7 | `string` | إجابة قصيرة | 🟢 بسيط | P1 — Critical |
| 8 | `frq` | إجابة حرة / مقال | 🟡 متوسط | P3 — Medium |
| 9 | `counting` | عدّ | 🟡 متوسط | P3 — Medium |
| 10 | `puzzle` | لغز صور | 🔴 معقد | P4 — Low |
| 11 | `opinion` | استطلاع رأي | 🟢 بسيط | P1 — Critical |
| 12 | `gmrq` | مجموعات اختيارات | 🟡 متوسط | P3 — Medium |
| 13 | `multipart` | سؤال متعدد الأجزاء | 🔴 معقد | P4 — Low |

---

## 🏗️ JSON Data Structure (Common Fields)

كل سؤال بيحتوي على الـ metadata دي:

```json
{
  "question_id": "string",
  "parent_id": "string",
  "language_code": "ar | en",
  "language": "Arabic | English",
  "country_code": "eg",
  "country": "Egypt",
  "grade": "1-12",
  "grade_id": "string",
  "subject": "string",
  "subject_id": "string",
  "source": "human | ai | nagwa",
  "section_id": "string",
  "number_of_parts": 1,
  "content": {
    "parts": [
      {
        "n": 1,
        "type": "mcq | mrq | ordering | ...",
        "stem": "<html>",
        "explanation": "<html> | null",
        // ... type-specific fields
      }
    ]
  }
}
```

---

## 📋 Type-Specific Structures

### 1. MCQ — اختيار من متعدد
```json
{
  "type": "mcq",
  "stem": "<html>",
  "choices": [
    { "label": "A", "value": "<html>", "is_correct": false },
    { "label": "B", "value": "<html>", "is_correct": false },
    { "label": "C", "value": "<html>", "is_correct": false },
    { "label": "D", "value": "<html>", "is_correct": true }
  ],
  "correct_answer": { "label": "D", "value": "<html>" },
  "explanation": "<html>"
}
```
**UI:** Radio buttons, single selection, correct answer highlight.

### 2. MRQ — إجابات متعددة
```json
{
  "type": "mrq",
  "stem": "<html>",
  "choices": [
    { "label": "A", "value": "<html>", "is_correct": true },
    { "label": "B", "value": "<html>", "is_correct": true },
    { "label": "C", "value": "<html>", "is_correct": false }
  ],
  "correct_answer": [ { "label": "A", "value": "<html>" }, ... ],
  "explanation": "<html>"
}
```
**UI:** Checkboxes, multiple selection, partial scoring.

### 3. Ordering — ترتيب
```json
{
  "type": "ordering",
  "stem": "<html>",
  "direction": "horizontal | vertical",
  "items": [
    { "value": "<html>", "display_order": 1, "correct_order": 4 },
    ...
  ],
  "correct_answer": ["<html>", ...],
  "explanation": "<html>"
}
```
**UI:** Drag & drop reordering, horizontal or vertical layout.

### 4. Matching — توصيل
```json
{
  "type": "matching",
  "stem": "<html>",
  "items": {
    "A": [ { "value": "<html>", "label": "A1" }, ... ],
    "B": [ { "value": "<html>", "label": "B1", "matches": "A1" }, ... ]
  },
  "correct_answer": [ { "A": "<html>", "B": "<html>" }, ... ],
  "explanation": "<html>"
}
```
**UI:** Two columns with drag-to-connect or dropdown matching.

### 5. Gap Fill — إكمال الفراغات
```json
{
  "type": "gap",
  "stem": "<html with blank-line spans>",
  "gap_keys": [
    { "value": "word", "correct_order": 1, "display_order": 1 },
    { "value": "distractor", "display_order": 5 }
  ],
  "correct_answer": "<html>",
  "explanation": "<html>"
}
```
**UI:** Text with blank slots, draggable word bank below. Items without `correct_order` are distractors.

### 6. Input — إدخال رقمي
```json
{
  "type": "input",
  "stem": "<html>",
  "correct_answer": {
    "value": 12,
    "constraints": {
      "type": "decimal",
      "answer_format": { "number_format": "Arabic", "contains_thousand_separator": true },
      "allow_leading_zeros": false,
      "allow_trailing_zeros": false,
      "sign": "canBeExplicitOrImplicit",
      "must_have_exactly_ndp": null
    }
  },
  "explanation": "<html>"
}
```
**UI:** Numeric input field with validation constraints.

### 7. String — إجابة قصيرة
```json
{
  "type": "string",
  "stem": "<html>",
  "acceptable_answers": ["Answer1", "Answer2"],
  "guidelines": [
    { "student_answer": "Answer1", "mark": 1, "comment": "إجابة صحيحة!" }
  ],
  "explanation": "<html>"
}
```
**UI:** Text input, compared against acceptable answers (case-insensitive).

### 8. FRQ — إجابة حرة / مقال
```json
{
  "type": "frq",
  "stem": "<html>",
  "ai_template_id": "string",
  "acceptable_answers": ["<html>"],
  "explanation": "<html>"
}
```
**UI:** Textarea for long text, AI-assisted grading reference.

### 9. Counting — عدّ
```json
{
  "type": "counting",
  "stem": "<html with image>",
  "grid": { "rows": 2, "columns": 5 },
  "correct_answer": 4,
  "explanation": "<html>"
}
```
**UI:** Interactive grid with clickable cells + image display.

### 10. Puzzle — لغز صور
```json
{
  "type": "puzzle",
  "stem": "<html>",
  "rows": "3",
  "columns": "3",
  "pieces": [
    { "correct_order": 1, "display_order": 1, "src": "url", "alt": "text" },
    ...
  ],
  "correct_answer": { "src": "url", "alt": "text" }
}
```
**UI:** Drag & drop puzzle grid, show completed image on success.

### 11. Opinion — استطلاع رأي
```json
{
  "type": "opinion",
  "stem": "<html>",
  "choices": [
    { "label": "ا", "value": "<html>" },
    { "label": "ب", "value": "<html>" }
  ]
}
```
**UI:** Radio/buttons, no correct answer, collect response only.

### 12. GMRQ — مجموعات اختيارات
```json
{
  "type": "gmrq",
  "stem": "<html>",
  "items": {
    "A": [ { "label": "A", "value": "<html>", "is_correct": true }, ... ],
    "B": [ { "label": "X", "value": "<html>", "is_correct": false }, ... ]
  },
  "correct_answer": { "A": "<html>", "B": "<html>" },
  "explanation": "<html>"
}
```
**UI:** Two separate choice groups, one selection per group.

### 13. Multipart — سؤال متعدد الأجزاء
```json
{
  "type": "multipart",
  "statement": "<html - long passage>",
  "parts": [
    { "type": "mcq", "stem": "...", "choices": [...] },
    { "type": "string", "stem": "...", "acceptable_answers": [...] }
  ]
}
```
**UI:** Shared passage/statement at top, separate questions below. Each part uses its own type renderer.

---

## 🏗️ Phases

| Phase | الاسم | المحتوى | الأولوية |
|-------|-------|---------|---------|
| **CP1** | Core Question Engine | TypeScript types + renderer architecture + MCQ/MRQ/Input/String/Opinion | 🔴 Critical |
| **CP2** | Interactive Questions | Ordering (drag&drop) + Matching + Gap Fill | 🟡 High |
| **CP3** | Advanced Questions | FRQ + Counting + GMRQ | 🟢 Medium |
| **CP4** | Complex Questions | Puzzle (drag&drop grid) + Multipart (nested rendering) | 🔵 Low |
| **CP5** | Content Features | Math rendering (MathField/KaTeX) + RTL/LTR + Image handling + HTML sanitization | 🔴 Critical |
| **CP6** | Scoring & Feedback | Auto-grading + partial scoring + explanation display + attempt tracking | 🟡 High |

---

## 🔗 Sub Plans & Tickets

| Phase | Sub Plan | Tickets |
|-------|----------|---------|
| CP1 | [CP1_core_engine.md](./sub_plans/CP1_core_engine.md) | [CP1_tickets.csv](./tickets/CP1_tickets.csv) |
| CP2 | [CP2_interactive.md](./sub_plans/CP2_interactive.md) | [CP2_tickets.csv](./tickets/CP2_tickets.csv) |
| CP3 | [CP3_advanced.md](./sub_plans/CP3_advanced.md) | [CP3_tickets.csv](./tickets/CP3_tickets.csv) |
| CP4 | [CP4_complex.md](./sub_plans/CP4_complex.md) | [CP4_tickets.csv](./tickets/CP4_tickets.csv) |
| CP5 | [CP5_content_features.md](./sub_plans/CP5_content_features.md) | [CP5_tickets.csv](./tickets/CP5_tickets.csv) |
| CP6 | [CP6_scoring_feedback.md](./sub_plans/CP6_scoring_feedback.md) | [CP6_tickets.csv](./tickets/CP6_tickets.csv) |

---

## 📁 Source Files Reference
- Question structure definitions: `skill/question_structures.md` (copied from user)
- JSON samples: `skill/question_samples/` (12 JSON files)
