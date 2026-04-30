const ALLOWED_TAGS = new Set([
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'h2',
  'h3',
  'h4',
  'hr',
  'i',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul'
]);

const ALLOWED_ATTRS = new Map<string, Set<string>>([
  ['a', new Set(['href', 'title', 'target', 'rel'])],
  ['td', new Set(['colspan', 'rowspan'])],
  ['th', new Set(['colspan', 'rowspan'])]
]);

function isSafeHref(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  return (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:')
  );
}

function cleanElement(el: Element): void {
  const tag = el.tagName.toLowerCase();
  if (!ALLOWED_TAGS.has(tag)) {
    el.replaceWith(...Array.from(el.childNodes));
    return;
  }

  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase();
    const allowed = ALLOWED_ATTRS.get(tag)?.has(name) ?? false;
    if (!allowed || name.startsWith('on')) {
      el.removeAttribute(attr.name);
      continue;
    }
    if (name === 'href' && !isSafeHref(attr.value)) {
      el.removeAttribute(attr.name);
    }
  }

  if (tag === 'a') {
    el.setAttribute('rel', 'noopener noreferrer');
  }
}

export function sanitizeHtml(input: string): string {
  const template = document.createElement('template');
  template.innerHTML = input;

  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT);
  const elements: Element[] = [];
  while (walker.nextNode()) {
    elements.push(walker.currentNode as Element);
  }
  for (const el of elements.reverse()) cleanElement(el);

  return template.innerHTML;
}
