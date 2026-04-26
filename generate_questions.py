import json
import random
import string

def generate_id(length=12):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

questions = [
    {
        "id": generate_id(),
        "type": "mcq",
        "stem": "ما هي عاصمة مصر؟",
        "explanation": "القاهرة هي عاصمة مصر وأكبر مدنها.",
        "points": 1,
        "choices": [
            {"id": generate_id(), "label": "القاهرة", "isCorrect": True},
            {"id": generate_id(), "label": "الإسكندرية", "isCorrect": False},
            {"id": generate_id(), "label": "الأقصر", "isCorrect": False},
            {"id": generate_id(), "label": "أسوان", "isCorrect": False}
        ]
    },
    {
        "id": generate_id(),
        "type": "mrq",
        "stem": "اختر المدن الساحلية مما يلي:",
        "explanation": "الإسكندرية ومطروح تقعان على ساحل البحر المتوسط.",
        "points": 2,
        "choices": [
            {"id": generate_id(), "label": "الإسكندرية", "isCorrect": True},
            {"id": generate_id(), "label": "القاهرة", "isCorrect": False},
            {"id": generate_id(), "label": "مطروح", "isCorrect": True},
            {"id": generate_id(), "label": "أسيوط", "isCorrect": False}
        ]
    },
    {
        "id": generate_id(),
        "type": "ordering",
        "stem": "رتب الخلفاء الراشدين حسب توليهم الخلافة:",
        "points": 2,
        "choices": [
            {"id": generate_id(), "label": "أبو بكر الصديق"},
            {"id": generate_id(), "label": "عمر بن الخطاب"},
            {"id": generate_id(), "label": "عثمان بن عفان"},
            {"id": generate_id(), "label": "علي بن أبي طالب"}
        ]
    },
    {
        "id": generate_id(),
        "type": "matching",
        "stem": "صل كل دولة بعاصمتها:",
        "points": 2,
        "pairs": [
            {"id": generate_id(), "left": "مصر", "right": "القاهرة"},
            {"id": generate_id(), "left": "فرنسا", "right": "باريس"},
            {"id": generate_id(), "left": "اليابان", "right": "طوكيو"}
        ]
    },
    {
        "id": generate_id(),
        "type": "gap",
        "stem": "تعتبر @BLANK عاصمة مصر، بينما تعتبر @BLANK عاصمة فرنسا.",
        "points": 2,
        "choices": [
            {"id": generate_id(), "label": "القاهرة", "isCorrect": True},
            {"id": generate_id(), "label": "الجيزة", "isCorrect": False},
            {"id": generate_id(), "label": "باريس", "isCorrect": True},
            {"id": generate_id(), "label": "لندن", "isCorrect": False}
        ]
    },
    {
        "id": generate_id(),
        "type": "string",
        "stem": "ما هو اسم الكوكب الأحمر؟",
        "answer": "المريخ",
        "points": 1
    },
    {
        "id": generate_id(),
        "type": "input",
        "stem": "احسب: 5 + 10",
        "answer": "15",
        "unit": "سم",
        "points": 1
    },
    {
        "id": generate_id(),
        "type": "frq",
        "stem": "اكتب فقرة قصيرة عن أهمية القراءة.",
        "answer": "تعتبر القراءة غذاء العقل وتساعد في توسيع المدارك وتحسين المهارات اللغوية...",
        "points": 5
    },
    {
        "id": generate_id(),
        "type": "counting",
        "stem": "كم عدد البرتقالات في الصورة؟",
        "answer": "5",
        "unit": "برتقالات",
        "points": 1
    },
    {
        "id": generate_id(),
        "type": "puzzle",
        "stem": "رتب قطع الصورة لتكوين الشكل الصحيح.",
        "pieces": [
            {"id": "p1", "url": "piece1.png"},
            {"id": "p2", "url": "piece2.png"}
        ],
        "solution": ["p2", "p1"],
        "completeImage": "complete.png",
        "points": 2
    },
    {
        "id": generate_id(),
        "type": "opinion",
        "stem": "ما هو تقييمك لمستوى صعوبة هذا الدرس؟",
        "choices": [
            {"id": generate_id(), "label": "سهل جداً"},
            {"id": generate_id(), "label": "متوسط"},
            {"id": generate_id(), "label": "صعب"}
        ]
    },
    {
        "id": generate_id(),
        "type": "gmrq",
        "stem": "اختر الإجابات الصحيحة للجملة التالية:",
        "groups": [
            {
                "name": "Group A",
                "choices": [
                    {"id": generate_id(), "label": "Choice 1A", "isCorrect": True},
                    {"id": generate_id(), "label": "Choice 2A", "isCorrect": False}
                ]
            },
            {
                "name": "Group B",
                "choices": [
                    {"id": generate_id(), "label": "Choice 1B", "isCorrect": False},
                    {"id": generate_id(), "label": "Choice 2B", "isCorrect": True}
                ]
            }
        ],
        "points": 2
    },
    {
        "id": generate_id(),
        "type": "multipart",
        "stem": "سؤال متعدد الأجزاء يندرج تحته عدة أسئلة",
        "statement": "اقرأ النص التالي ثم أجب عن الأسئلة المرفقة...",
        "parts": [
            {
                "id": generate_id(),
                "type": "mcq",
                "stem": "السؤال الأول المتعلق بالقطعة؟",
                "choices": [
                    {"id": generate_id(), "label": "الإجابة الصحيحة", "isCorrect": True},
                    {"id": generate_id(), "label": "إجابة خاطئة", "isCorrect": False}
                ]
            },
            {
                "id": generate_id(),
                "type": "string",
                "stem": "السؤال الثاني المتعلق بالقطعة؟",
                "answer": "الإجابة النموذجية"
            }
        ]
    }
]

with open('app/src/data/dataQuestions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print("تم إنشاء ملف dataQuestions.json بنجاح!")
