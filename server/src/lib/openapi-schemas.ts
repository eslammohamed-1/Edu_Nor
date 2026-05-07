/** مخططات JSON Schema لتوثيق OpenAPI في Fastify (تُستخدم في خاصية `schema` لكل مسار). */

export const errorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    details: { type: 'object', additionalProperties: true }
  },
  additionalProperties: true
} as const;

export const publicUserSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string', enum: ['student', 'admin', 'teacher', 'super_admin'] },
    banned: { type: 'boolean' },
    grade: { type: 'string' },
    phone: { type: 'string' },
    stage: { type: 'string' },
    secondaryTrack: { type: 'string' },
    permissions: { type: 'array', items: { type: 'string' } },
    createdAt: { type: 'string' }
  },
  additionalProperties: true
} as const;

export const authSessionResponse = {
  type: 'object',
  properties: {
    user: publicUserSchema,
    accessToken: { type: 'string' }
  },
  required: ['user', 'accessToken']
} as const;

export const okTrueSchema = {
  type: 'object',
  properties: { ok: { type: 'boolean', const: true } },
  required: ['ok']
} as const;

export const validSchema = {
  type: 'object',
  properties: { valid: { type: 'boolean' } },
  required: ['valid']
} as const;

/** استجابة JSON غير مقيدة — لمسارات إدارة ذات أشكال متغيرة */
export const unsafeJson = { type: 'object', additionalProperties: true } as const;
