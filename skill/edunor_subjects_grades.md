# EduNor — Subjects & Grades Map | خريطة المواد والصفوف

---

## 📊 ملخص سريع

| الفئة | عدد المواد | الصفوف |
|-------|-----------|--------|
| 🌍 Languages | 7 | 1–12 |
| 🔢 Math | 4 | 1–12 |
| 🔬 Science | 6 | 1–12 |
| 💻 Technology | 1 | 4–6 |
| 📜 Social Sciences | 5 | 4–12 |
| **الإجمالي** | **23 مادة** | **12 صف** |

---

## 🌍 Languages — اللغات

| المادة | Subject | الصفوف | عدد الصفوف |
|--------|---------|--------|-----------|
| اللغة العربية | اللغة العربية | 1–12 | 12 |
| الإنجليزية | English | 1–12 | 12 |
| كونكت بلس | Connect Plus | 1–6 | 6 |
| الفرنسية | Français | 7, 10–12 | 4 |
| الألمانية | Deutsch | 10–12 | 3 |
| الإيطالية | Italiano | 10–12 | 3 |
| الإسبانية | Español | 10–12 | 3 |

---

## 🔢 Math — الرياضيات

| المادة | Subject | الصفوف | عدد الصفوف |
|--------|---------|--------|-----------|
| رياضيات | Mathematics | 1–10, 12 | 11 |
| رياضيات (أدبي) | Mathematics • Arts Section | 11 | 1 |
| رياضيات (علمي) | Mathematics • Scientific Section | 11 | 1 |
| إحصاء | Statistics | 12 | 1 |

---

## 🔬 Science — العلوم

| المادة | Subject | الصفوف | عدد الصفوف |
|--------|---------|--------|-----------|
| اكتشف | Discover | 1–3 | 3 |
| علوم | Science | 4–9 | 6 |
| علوم متكاملة | Integrated Science | 10 | 1 |
| فيزياء | Physics | 11–12 | 2 |
| كيمياء | Chemistry | 11–12 | 2 |
| أحياء | Biology | 11–12 | 2 |

---

## 💻 Technology — التكنولوجيا

| المادة | Subject | الصفوف | عدد الصفوف |
|--------|---------|--------|-----------|
| تكنولوجيا المعلومات | ICT | 4–6 | 3 |

---

## 📜 Social Sciences — العلوم الاجتماعية

| المادة | Subject | الصفوف | عدد الصفوف |
|--------|---------|--------|-----------|
| الدراسات الاجتماعية | الدراسات الاجتماعية | 4–9 | 6 |
| التاريخ | التاريخ | 10–12 | 3 |
| الفلسفة والمنطق | الفلسفة والمنطق | 10 | 1 |
| علم النفس والاجتماع | علم النفس والاجتماع | 11 | 1 |
| الجغرافيا | الجغرافيا | 11–12 | 2 |

---

## 🏫 المراحل الدراسية

### ابتدائي (الصفوف 1–6)

| الصف | المواد المتاحة |
|------|---------------|
| **1** | اللغة العربية, English, Connect Plus, Mathematics, Discover |
| **2** | اللغة العربية, English, Connect Plus, Mathematics, Discover |
| **3** | اللغة العربية, English, Connect Plus, Mathematics, Discover |
| **4** | اللغة العربية, English, Connect Plus, Mathematics, Science, ICT, الدراسات الاجتماعية |
| **5** | اللغة العربية, English, Connect Plus, Mathematics, Science, ICT, الدراسات الاجتماعية |
| **6** | اللغة العربية, English, Connect Plus, Mathematics, Science, ICT, الدراسات الاجتماعية |

### إعدادي (الصفوف 7–9)

| الصف | المواد المتاحة |
|------|---------------|
| **7** | اللغة العربية, English, Français, Mathematics, Science, الدراسات الاجتماعية |
| **8** | اللغة العربية, English, Mathematics, Science, الدراسات الاجتماعية |
| **9** | اللغة العربية, English, Mathematics, Science, الدراسات الاجتماعية |

### ثانوي (الصفوف 10–12)

| الصف | المواد المتاحة |
|------|---------------|
| **10** | اللغة العربية, English, Français, Deutsch, Italiano, Español, Mathematics, Integrated Science, التاريخ, الفلسفة والمنطق |
| **11** | اللغة العربية, English, Français, Deutsch, Italiano, Español, Math (Arts), Math (Scientific), Physics, Chemistry, Biology, التاريخ, علم النفس والاجتماع, الجغرافيا |
| **12** | اللغة العربية, English, Français, Deutsch, Italiano, Español, Mathematics, Statistics, Physics, Chemistry, Biology, التاريخ, الجغرافيا |

---

## 💻 Source Code Reference

```typescript
export const SUBJECT_GRADES_MAPPING = {
    "English": {
        category: "Languages",
        grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
    "Connect Plus": {
        category: "Languages",
        grades: [1, 2, 3, 4, 5, 6]
    },
    "Français": {
        category: "Languages",
        grades: [7, 10, 11, 12]
    },
    "Deutsch": {
        category: "Languages",
        grades: [10, 11, 12]
    },
    "Italiano": {
        category: "Languages",
        grades: [10, 11, 12]
    },
    "Español": {
        category: "Languages",
        grades: [10, 11, 12]
    },
    "اللغة العربية": {
        category: "Languages",
        grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
    "Mathematics": {
        category: "Math",
        grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]
    },
    "Mathematics • Arts Section": {
        category: "Math",
        grades: [11]
    },
    "Mathematics • Scientific Section": {
        category: "Math",
        grades: [11]
    },
    "Statistics": {
        category: "Math",
        grades: [12]
    },
    "Integrated Science": {
        category: "Science",
        grades: [10]
    },
    "Physics": {
        category: "Science",
        grades: [11, 12]
    },
    "Chemistry": {
        category: "Science",
        grades: [11, 12]
    },
    "Biology": {
        category: "Science",
        grades: [11, 12]
    },
    "Science": {
        category: "Science",
        grades: [4, 5, 6, 7, 8, 9]
    },
    "Discover": {
        category: "Science",
        grades: [1, 2, 3]
    },
    "ICT": {
        category: "Technology",
        grades: [4, 5, 6]
    },
    "الجغرافيا": {
        category: "Social Sciences",
        grades: [11, 12]
    },
    "التاريخ": {
        category: "Social Sciences",
        grades: [10, 11, 12]
    },
    "الفلسفة والمنطق": {
        category: "Social Sciences",
        grades: [10]
    },
    "علم النفس والاجتماع": {
        category: "Social Sciences",
        grades: [11]
    },
    "الدراسات الاجتماعية": {
        category: "Social Sciences",
        grades: [4, 5, 6, 7, 8, 9]
    }
};

export function getSubjectsByCategory() {
    const grouped: Record<string, string[]> = {};
    for (const [subject, data] of Object.entries(SUBJECT_GRADES_MAPPING)) {
        const category = data.category || 'Other';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(subject);
    }
    return grouped;
}
```

---

> [!IMPORTANT]
> هذا الملف هو المرجع الرسمي للمواد والصفوف في المنصة.
> عند بناء الـ mock data في `src/data/subjects.ts` يجب استخدام هذه البيانات بالظبط.
> أي تعديل على المواد أو الصفوف يجب أن يتم هنا أولاً.
