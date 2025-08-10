// Standart API Response formatları

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string | Record<string, string[]>
  message?: string
  timestamp?: string
  requestId?: string
}

export interface ApiError {
  message: string
  code?: string
  statusCode: number
  details?: any
  timestamp: string
  path?: string
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }
  
  if (message !== undefined) {
    response.message = message
  }
  
  return response
}

// Error response helper
export function createErrorResponse(
  error: string | Record<string, string[]>,
  statusCode: number = 500,
  message?: string
): { response: ApiResponse; status: number } {
  return {
    response: {
      success: false,
      error,
      message: message || 'Bir hata oluştu',
      timestamp: new Date().toISOString()
    },
    status: statusCode
  }
}

// Validation error helper
export function createValidationErrorResponse(
  validationErrors: Record<string, string[]>
): { response: ApiResponse; status: number } {
  return createErrorResponse(
    validationErrors,
    400,
    'Doğrulama hatası'
  )
}

// Database error helper
export function createDatabaseErrorResponse(
  error: any
): { response: ApiResponse; status: number } {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  return createErrorResponse(
    isDevelopment ? error.message : 'Veritabanı hatası',
    500,
    'Veritabanı işlemi başarısız'
  )
}

// Authentication error helper
export function createAuthErrorResponse(
  message: string = 'Yetkilendirme hatası'
): { response: ApiResponse; status: number } {
  return createErrorResponse(
    message,
    401,
    'Giriş yapmanız gerekiyor'
  )
}

// Authorization error helper
export function createForbiddenErrorResponse(
  message: string = 'Bu işlem için yetkiniz yok'
): { response: ApiResponse; status: number } {
  return createErrorResponse(
    message,
    403,
    'Erişim reddedildi'
  )
}

// Not found error helper
export function createNotFoundErrorResponse(
  resource: string = 'Kaynak'
): { response: ApiResponse; status: number } {
  return createErrorResponse(
    `${resource} bulunamadı`,
    404,
    'Kaynak bulunamadı'
  )
}

// Rate limit error helper
export function createRateLimitErrorResponse(): { response: ApiResponse; status: number } {
  return createErrorResponse(
    'Çok fazla istek gönderildi',
    429,
    'Lütfen daha sonra tekrar deneyin'
  )
}

// Generic error handler for API routes
export function handleApiError(error: any): { response: ApiResponse; status: number } {
  console.error('API Error:', error)
  
  // Network errors (check before Supabase errors)
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return createErrorResponse(
      'Bağlantı hatası',
      503,
      'Servis şu anda kullanılamıyor'
    )
  }
  
  // Supabase errors
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation
        return createErrorResponse(
          'Bu kayıt zaten mevcut',
          409,
          'Çakışma hatası'
        )
      case '23503': // Foreign key violation
        return createErrorResponse(
          'İlişkili kayıtlar nedeniyle işlem gerçekleştirilemedi',
          409,
          'Bağımlılık hatası'
        )
      case '42P01': // Table does not exist
        return createErrorResponse(
          'Tablo bulunamadı',
          500,
          'Veritabanı yapılandırma hatası'
        )
      default:
        return createDatabaseErrorResponse(error)
    }
  }
  
  // Validation errors (Zod)
  if (error.name === 'ZodError') {
    const validationErrors: Record<string, string[]> = {}
    error.errors.forEach((err: any) => {
      const path = err.path.join('.')
      if (!validationErrors[path]) {
        validationErrors[path] = []
      }
      validationErrors[path].push(err.message)
    })
    return createValidationErrorResponse(validationErrors)
  }
  
  // Network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return createErrorResponse(
      'Bağlantı hatası',
      503,
      'Servis şu anda kullanılamıyor'
    )
  }
  
  // Default error
  const isDevelopment = process.env.NODE_ENV === 'development'
  return createErrorResponse(
    isDevelopment ? error.message : 'Beklenmeyen bir hata oluştu',
    500,
    'Sunucu hatası'
  )
}

// Async wrapper for API routes
export function withErrorHandling<T>(
  handler: (request: any) => Promise<T>
) {
  return async (request: any) => {
    try {
      const result = await handler(request)
      
      // If handler returns a Response object, return it as is
      if (result && typeof result === 'object' && 'status' in result && 'json' in result) {
        return result
      }
      
      // Otherwise wrap the data in a success response
      return {
        json: async () => createSuccessResponse(result),
        status: 200
      }
    } catch (error) {
      const errorResult = handleApiError(error)
      return {
        json: async () => errorResult.response,
        status: errorResult.status
      }
    }
  }
}