# CP5: Content Features | ميزات المحتوى

## 🎯 الهدف
دعم المحتوى الغني: رموز رياضية, صور, HTML sanitization, RTL/LTR.

---

## 📦 المهام

### CP5.1 — Math Rendering
- Integrate MathField/KaTeX for inline math (`$x^2$`)
- Parse `math-field` custom elements from stem HTML
- Render math expressions correctly in Arabic/English
- Responsive math sizing

### CP5.2 — HTML Sanitization
- Sanitize HTML from stem/choices/explanations (DOMPurify or similar)
- Whitelist safe tags: p, span, div, img, math-field, strong, em, br, ul, ol, li
- Strip dangerous attributes (onclick, onerror, etc.)
- Preserve `dir`, `style`, `class`, `src`, `alt` attributes

### CP5.3 — RTL/LTR Mixed Content
- Detect direction from stem `dir` attribute
- Support mixed RTL/LTR content in same question
- Proper alignment for Arabic and English content
- BiDi-aware layout for choices and answers

### CP5.4 — Image Handling
- Display embedded images from stem (external URLs)
- Responsive image sizing (max-width: 100%)
- Image loading states (skeleton)
- Alt text for accessibility
- Lightbox/zoom on click (optional)

### CP5.5 — Rich Text Utilities
**File:** `src/utils/richText.ts`
- `sanitizeHTML(html: string): string` — sanitize content
- `extractText(html: string): string` — strip HTML for comparison
- `parseBlankSlots(html: string): BlankSlot[]` — parse gap fill blanks
- `detectDirection(html: string): 'rtl' | 'ltr'` — detect text direction

---

## ✅ Acceptance Criteria
- [ ] Math expressions render inline and block correctly
- [ ] HTML is sanitized without breaking layout
- [ ] Mixed RTL/LTR content displays correctly
- [ ] Images load responsively with alt text
- [ ] Utility functions work for all question types
