import type { AnyQuestion } from '@/types/quiz';

export function normalizeAnswerText(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** تقييم إجابة واحدة (يشمل المركّب المتداخل عبر JSON لكل جزء فرعي). */
export function gradeAnswer(q: AnyQuestion, selected: string | null): boolean {
  if (selected == null || selected === '') return false;

  switch (q.type) {
    case 'mcq':
    case 'opinion': {
      if (!('choices' in q) || !Array.isArray(q.choices)) return false;
      const choice = q.choices.find((c) => c.id === selected);
      return choice?.isCorrect === true;
    }

    case 'gap': {
      if (!('choices' in q) || !Array.isArray(q.choices)) return false;
      const correctIds = q.choices.filter((c) => c.isCorrect === true).map((c) => c.id);
      const blanks = (q.stem.match(/@BLANK/g) || []).length;

      if (blanks <= 1) {
        try {
          const a = JSON.parse(selected) as unknown;
          if (Array.isArray(a) && a.length === 1) {
            const id = String(a[0]);
            const choice = q.choices.find((c) => c.id === id);
            return choice?.isCorrect === true;
          }
        } catch {
          /* legacy single id */
        }
        const choice = q.choices.find((c) => c.id === selected);
        return choice?.isCorrect === true;
      }

      try {
        const arr = JSON.parse(selected) as unknown;
        return (
          Array.isArray(arr) &&
          (arr as string[]).length === blanks &&
          correctIds.length === blanks &&
          correctIds.every((id, i) => id === (arr as string[])[i])
        );
      } catch {
        return false;
      }
    }

    case 'mrq': {
      if (!('choices' in q) || !Array.isArray(q.choices)) return false;
      const correct = new Set(q.choices.filter((c) => c.isCorrect).map((c) => c.id));
      let picked = new Set<string>();
      try {
        const a = JSON.parse(selected) as unknown;
        if (Array.isArray(a)) picked = new Set(a.map((x) => String(x)));
      } catch {
        return false;
      }
      return correct.size === picked.size && [...correct].every((id) => picked.has(id));
    }

    case 'ordering': {
      if (!('choices' in q) || !Array.isArray(q.choices)) return false;
      try {
        const userOrder = JSON.parse(selected) as string[];
        const correctOrder = q.choices.map((c) => c.id);
        return (
          userOrder.length === correctOrder.length &&
          userOrder.every((id, idx) => id === correctOrder[idx])
        );
      } catch {
        const choice = q.choices.find((c) => c.id === selected);
        return choice?.isCorrect === true;
      }
    }

    case 'string':
    case 'frq':
    case 'input':
    case 'counting': {
      if (!('answer' in q)) return false;
      return normalizeAnswerText(selected) === normalizeAnswerText(q.answer);
    }

    case 'matching': {
      if (!('pairs' in q)) return false;
      try {
        const userPairs = JSON.parse(selected) as Record<string, string>;
        return q.pairs.every((p) => userPairs[p.id] === p.right);
      } catch {
        return false;
      }
    }

    case 'puzzle': {
      if (!('solution' in q)) return false;
      try {
        const userSolution = JSON.parse(selected) as string[];
        return (
          userSolution.length === q.solution.length &&
          userSolution.every((id, idx) => id === q.solution[idx])
        );
      } catch {
        return false;
      }
    }

    case 'gmrq': {
      if (!('groups' in q)) return false;
      try {
        const userSelections = JSON.parse(selected) as Record<string, string>;
        return q.groups.every((g) => {
          const correct = g.choices.find((c) => c.isCorrect);
          return Boolean(correct && userSelections[g.name] === correct.id);
        });
      } catch {
        return false;
      }
    }

    case 'multipart': {
      try {
        const map = JSON.parse(selected) as Record<string, string>;
        return q.parts.every((part) => {
          const raw = map[part.id];
          if (raw == null) return false;
          return gradeAnswer(part, raw);
        });
      } catch {
        return false;
      }
    }

    default:
      return false;
  }
}

/** هل تمّت تعبئة الإجابة بما يكفي لاعتبار السؤال «مجاباً» في شريط التقدم. */
export function isAnswerComplete(q: AnyQuestion, selected: string | null | undefined): boolean {
  if (selected == null || selected === undefined) return false;
  const t = String(selected).trim();
  if (t === '') return false;

  switch (q.type) {
    case 'gap': {
      const blanks = (q.stem.match(/@BLANK/g) || []).length;
      if (blanks <= 0) return t.length > 0;
      try {
        const a = JSON.parse(t) as unknown;
        if (Array.isArray(a)) {
          return (
            a.length === blanks && a.every((x) => x != null && String(x).trim() !== '')
          );
        }
      } catch {
        /* single slot */
      }
      return blanks === 1 && t.length > 0;
    }

    case 'mrq': {
      try {
        const a = JSON.parse(t) as unknown;
        if (!Array.isArray(a) || a.length === 0) return false;
        return a.every((x) => x != null && String(x).trim() !== '');
      } catch {
        return false;
      }
    }

    case 'ordering':
    case 'puzzle': {
      try {
        const a = JSON.parse(t) as unknown;
        if (!Array.isArray(a)) return false;
        const n = q.type === 'ordering' ? q.choices.length : q.solution.length;
        return a.length === n && a.every((x) => x != null && String(x).trim() !== '');
      } catch {
        return false;
      }
    }

    case 'matching': {
      if (t === '{}') return false;
      try {
        const o = JSON.parse(t) as Record<string, string>;
        if (typeof o !== 'object' || o === null) return false;
        return q.pairs.every((p) => {
          const v = o[p.id];
          return v != null && String(v).trim() !== '';
        });
      } catch {
        return false;
      }
    }

    case 'gmrq': {
      if (t === '{}') return false;
      try {
        const o = JSON.parse(t) as Record<string, string>;
        return q.groups.every((g) => {
          const v = o[g.name];
          return v != null && String(v).trim() !== '';
        });
      } catch {
        return false;
      }
    }

    case 'multipart': {
      if (t === '{}') return false;
      try {
        const o = JSON.parse(t) as Record<string, string>;
        return q.parts.every((part) => isAnswerComplete(part, o[part.id] ?? null));
      } catch {
        return false;
      }
    }

    default: {
      if (t === '[]' || t === '{}') return false;
      if (t.startsWith('[')) {
        try {
          const a = JSON.parse(t) as unknown[];
          if (Array.isArray(a)) {
            return (
              a.length > 0 && a.every((x) => x != null && String(x).trim().length > 0)
            );
          }
        } catch {
          return false;
        }
      }
      return true;
    }
  }
}
