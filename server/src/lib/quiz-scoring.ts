/**
 * تصحيح على الخادم — نفس المنطق وظيفيًا مثل `app/src/lib/quizGrade.ts`
 * مع قبول أسئلة كـ JSON عامة (`Record<string, unknown>`).
 */

type JsonQuestion = Record<string, unknown>;

function normalizeAnswerText(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function arr(v: unknown): unknown[] | undefined {
  return Array.isArray(v) ? v : undefined;
}

function readStem(q: JsonQuestion): string {
  return str(q.stem) ?? '';
}

function readType(q: JsonQuestion): string {
  return str(q.type) ?? '';
}

function readChoices(q: JsonQuestion): Array<Record<string, unknown>> {
  const c = arr(q.choices);
  if (!c) return [];
  return c.filter((x): x is Record<string, unknown> => x != null && typeof x === 'object' && !Array.isArray(x));
}

export function gradeAnswerJson(q: JsonQuestion, selected: string | null): boolean {
  if (selected == null || selected === '') return false;

  const t = readType(q);
  switch (t) {
    case 'mcq':
    case 'opinion': {
      const choices = readChoices(q);
      const choice = choices.find((c) => str(c.id) === selected);
      return choice?.isCorrect === true;
    }

    case 'gap': {
      const choices = readChoices(q);
      const correctIds = choices.filter((c) => c.isCorrect === true).map((c) => str(c.id) ?? '');
      const stem = readStem(q);
      const blanks = (stem.match(/@BLANK/g) || []).length;

      if (blanks <= 1) {
        try {
          const a = JSON.parse(selected) as unknown;
          if (Array.isArray(a) && a.length === 1) {
            const id = String(a[0]);
            const choice = choices.find((c) => str(c.id) === id);
            return choice?.isCorrect === true;
          }
        } catch {
          /* legacy */
        }
        const choice = choices.find((c) => str(c.id) === selected);
        return choice?.isCorrect === true;
      }

      try {
        const ar = JSON.parse(selected) as unknown;
        return (
          Array.isArray(ar) &&
          (ar as string[]).length === blanks &&
          correctIds.length === blanks &&
          correctIds.every((id, i) => id === (ar as string[])[i])
        );
      } catch {
        return false;
      }
    }

    case 'mrq': {
      const choices = readChoices(q);
      const correct = new Set(choices.filter((c) => c.isCorrect === true).map((c) => str(c.id) ?? ''));
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
      const choices = readChoices(q);
      try {
        const userOrder = JSON.parse(selected) as string[];
        const correctOrder = choices.map((c) => str(c.id) ?? '');
        return (
          userOrder.length === correctOrder.length &&
          userOrder.every((id, idx) => id === correctOrder[idx])
        );
      } catch {
        const choice = choices.find((c) => str(c.id) === selected);
        return choice?.isCorrect === true;
      }
    }

    case 'string':
    case 'frq':
    case 'input':
    case 'counting': {
      const ans = str(q.answer);
      if (ans == null) return false;
      return normalizeAnswerText(selected) === normalizeAnswerText(ans);
    }

    case 'matching': {
      const pairsRaw = arr(q.pairs);
      if (!pairsRaw) return false;
      try {
        const userPairs = JSON.parse(selected) as Record<string, string>;
        return pairsRaw.every((pr) => {
          const p = pr as Record<string, unknown>;
          const id = str(p.id);
          const right = str(p.right);
          if (!id || right == null) return false;
          return userPairs[id] === right;
        });
      } catch {
        return false;
      }
    }

    case 'puzzle': {
      const sol = arr(q.solution);
      if (!sol) return false;
      try {
        const userSolution = JSON.parse(selected) as string[];
        const want = sol.map((x) => String(x));
        return (
          userSolution.length === want.length &&
          userSolution.every((id, idx) => id === want[idx])
        );
      } catch {
        return false;
      }
    }

    case 'gmrq': {
      const groupsRaw = arr(q.groups);
      if (!groupsRaw) return false;
      try {
        const userSelections = JSON.parse(selected) as Record<string, string>;
        return groupsRaw.every((gr) => {
          const g = gr as Record<string, unknown>;
          const name = str(g.name);
          const chRaw = arr(g.choices);
          if (!name || !chRaw) return false;
          const choices = chRaw.filter(
            (x): x is Record<string, unknown> => x != null && typeof x === 'object'
          );
          const correct = choices.find((c) => c.isCorrect === true);
          const cid = correct != null ? str(correct.id) : undefined;
          return Boolean(cid && userSelections[name] === cid);
        });
      } catch {
        return false;
      }
    }

    case 'multipart': {
      const partsRaw = arr(q.parts);
      if (!partsRaw) return false;
      try {
        const map = JSON.parse(selected) as Record<string, string>;
        return partsRaw.every((pr) => {
          const part = pr as JsonQuestion;
          const pid = str(part.id);
          if (!pid) return false;
          const raw = map[pid];
          if (raw == null) return false;
          return gradeAnswerJson(part, raw);
        });
      } catch {
        return false;
      }
    }

    default:
      return false;
  }
}
