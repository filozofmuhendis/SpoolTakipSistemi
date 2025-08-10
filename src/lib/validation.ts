import { z } from 'zod'

// Common validation schemas
export const emailSchema = z
  .string()
  .email('Geçerli bir e-posta adresi giriniz')
  .min(1, 'E-posta adresi gereklidir')

export const passwordSchema = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalıdır')
  .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
  .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
  .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir')
  .regex(/[^A-Za-z0-9]/, 'Şifre en az bir özel karakter içermelidir')

export const phoneSchema = z
  .string()
  .regex(/^[+]?[0-9\s\-\(\)]{10,}$/, 'Geçerli bir telefon numarası giriniz')
  .optional()
  .or(z.literal(''))

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih YYYY-MM-DD formatında olmalıdır')
  .refine((date) => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }, 'Geçerli bir tarih giriniz')

export const positiveNumberSchema = z
  .number()
  .positive('Değer pozitif olmalıdır')
  .finite('Geçerli bir sayı giriniz')

export const nonNegativeNumberSchema = z
  .number()
  .nonnegative('Değer negatif olamaz')
  .finite('Geçerli bir sayı giriniz')

export const stringSchema = (minLength = 1, maxLength = 255) =>
  z
    .string()
    .min(minLength, `En az ${minLength} karakter olmalıdır`)
    .max(maxLength, `En fazla ${maxLength} karakter olabilir`)
    .trim()

export const optionalStringSchema = (maxLength = 255) =>
  z
    .string()
    .max(maxLength, `En fazla ${maxLength} karakter olabilir`)
    .trim()
    .optional()
    .or(z.literal(''))

// Project validation schemas
export const projectStatusSchema = z.enum([
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled',
])

export const projectSchema = z.object({
  name: stringSchema(2, 100),
  description: optionalStringSchema(500),
  status: projectStatusSchema,
  start_date: dateSchema,
  end_date: dateSchema,
  manager_id: stringSchema(1, 50),
}).refine(
  (data) => new Date(data.start_date) <= new Date(data.end_date),
  {
    message: 'Başlangıç tarihi bitiş tarihinden önce olmalıdır',
    path: ['end_date'],
  }
)

// Spool validation schemas
export const spoolStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'welding',
  'testing',
  'completed',
  'shipped',
])

export const spoolSchema = z.object({
  spool_number: stringSchema(1, 50),
  project_id: stringSchema(1, 50),
  diameter: positiveNumberSchema,
  length: positiveNumberSchema,
  material: stringSchema(1, 100),
  status: spoolStatusSchema,
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  description: optionalStringSchema(500),
  drawing_number: optionalStringSchema(100),
  revision: optionalStringSchema(10),
})

// Personnel validation schemas
export const personnelRoleSchema = z.enum([
  'admin',
  'manager',
  'supervisor',
  'welder',
  'inspector',
  'operator',
  'user',
])

export const personnelSchema = z.object({
  first_name: stringSchema(2, 50),
  last_name: stringSchema(2, 50),
  email: emailSchema,
  phone: phoneSchema,
  role: personnelRoleSchema,
  department: stringSchema(1, 100),
  hire_date: dateSchema,
  is_active: z.boolean(),
  employee_id: optionalStringSchema(20),
  skills: z.array(stringSchema(1, 50)).optional(),
})

// Work Order validation schemas
export const workOrderStatusSchema = z.enum([
  'pending',
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
])

export const workOrderSchema = z.object({
  work_order_number: stringSchema(1, 50),
  spool_id: stringSchema(1, 50),
  assigned_to: stringSchema(1, 50),
  work_type: stringSchema(1, 100),
  status: workOrderStatusSchema,
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  estimated_hours: positiveNumberSchema,
  actual_hours: nonNegativeNumberSchema.optional(),
  start_date: dateSchema.optional(),
  end_date: dateSchema.optional(),
  description: optionalStringSchema(500),
  notes: optionalStringSchema(1000),
}).refine(
  (data) => {
    if (data.start_date && data.end_date) {
      return new Date(data.start_date) <= new Date(data.end_date)
    }
    return true
  },
  {
    message: 'Başlangıç tarihi bitiş tarihinden önce olmalıdır',
    path: ['end_date'],
  }
)

// Shipment validation schemas
export const shipmentStatusSchema = z.enum([
  'preparing',
  'ready',
  'shipped',
  'delivered',
  'cancelled',
])

export const shipmentSchema = z.object({
  shipment_number: stringSchema(1, 50),
  project_id: stringSchema(1, 50),
  customer_name: stringSchema(1, 100),
  destination: stringSchema(1, 200),
  status: shipmentStatusSchema,
  ship_date: dateSchema.optional(),
  delivery_date: dateSchema.optional(),
  tracking_number: optionalStringSchema(100),
  notes: optionalStringSchema(500),
  total_weight: positiveNumberSchema.optional(),
  total_pieces: positiveNumberSchema.optional(),
}).refine(
  (data) => {
    if (data.ship_date && data.delivery_date) {
      return new Date(data.ship_date) <= new Date(data.delivery_date)
    }
    return true
  },
  {
    message: 'Sevkiyat tarihi teslim tarihinden önce olmalıdır',
    path: ['delivery_date'],
  }
)

// Material validation schemas
export const materialSchema = z.object({
  material_code: stringSchema(1, 50),
  name: stringSchema(1, 100),
  description: optionalStringSchema(500),
  unit: stringSchema(1, 20),
  unit_price: positiveNumberSchema,
  stock_quantity: nonNegativeNumberSchema,
  minimum_stock: nonNegativeNumberSchema,
  supplier: optionalStringSchema(100),
  category: stringSchema(1, 50),
})

// Quality Control validation schemas
export const qualityStatusSchema = z.enum([
  'pending',
  'in_progress',
  'passed',
  'failed',
  'rework_required',
])

export const qualityControlSchema = z.object({
  spool_id: stringSchema(1, 50),
  inspector_id: stringSchema(1, 50),
  inspection_type: stringSchema(1, 100),
  status: qualityStatusSchema,
  inspection_date: dateSchema,
  notes: optionalStringSchema(1000),
  defects_found: z.array(stringSchema(1, 200)).optional(),
  corrective_actions: optionalStringSchema(1000),
})

// Equipment validation schemas
export const equipmentStatusSchema = z.enum([
  'available',
  'in_use',
  'maintenance',
  'out_of_order',
  'retired',
])

export const equipmentSchema = z.object({
  equipment_code: stringSchema(1, 50),
  name: stringSchema(1, 100),
  type: stringSchema(1, 50),
  status: equipmentStatusSchema,
  location: stringSchema(1, 100),
  purchase_date: dateSchema.optional(),
  last_maintenance: dateSchema.optional(),
  next_maintenance: dateSchema.optional(),
  notes: optionalStringSchema(500),
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(10 * 1024 * 1024), // 10MB default
  allowedTypes: z.array(z.string()).default([
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]),
}).refine(
  (data) => data.file.size <= data.maxSize,
  {
    message: `Dosya boyutu ${10}MB'dan küçük olmalıdır`,
    path: ['file'],
  }
).refine(
  (data) => data.allowedTypes.includes(data.file.type),
  {
    message: 'Desteklenmeyen dosya türü',
    path: ['file'],
  }
)

// Utility functions for validation
export function validateRequired<T>(value: T, fieldName: string): T {
  if (value === null || value === undefined || value === '') {
    throw new Error(`${fieldName} gereklidir`)
  }
  return value
}

export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
    .substring(0, 1000) // Limit length
}

export function sanitizeNumber(input: unknown): number | null {
  if (typeof input === 'number' && !isNaN(input) && isFinite(input)) {
    return input
  }
  if (typeof input === 'string') {
    const parsed = parseFloat(input)
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed
    }
  }
  return null
}

export function validateDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return start <= end
}

export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success
}

export function isValidPassword(password: string): boolean {
  return passwordSchema.safeParse(password).success
}

// Custom validation error class
export class ValidationError extends Error {
  public field: string
  public code: string

  constructor(message: string, field: string, code = 'VALIDATION_ERROR') {
    super(message)
    this.name = 'ValidationError'
    this.field = field
    this.code = code
  }
}

// Validation result type
export type ValidationResult<T> = {
  success: boolean
  data?: T
  errors?: Array<{
    field: string
    message: string
    code: string
  }>
}

// Generic validation function
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.parse(data)
    return {
      success: true,
      data: result,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      }
    }
    return {
      success: false,
      errors: [
        {
          field: 'unknown',
          message: 'Bilinmeyen doğrulama hatası',
          code: 'UNKNOWN_ERROR',
        },
      ],
    }
  }
}