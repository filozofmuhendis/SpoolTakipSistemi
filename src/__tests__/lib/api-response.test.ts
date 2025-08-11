import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createDatabaseErrorResponse,
  createAuthErrorResponse,
  createForbiddenErrorResponse,
  createNotFoundErrorResponse,
  createRateLimitErrorResponse,
  handleApiError,
  withErrorHandling,
} from '@/lib/api-response'
import { ZodError } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

describe('API Response Utilities', () => {
  describe('Success Response', () => {
    it('creates success response with data', () => {
      const data = { id: 1, name: 'Test' }
      const response = createSuccessResponse(data)

      expect(response.success).toBe(true)
      expect(response.data).toEqual(data)
      expect(response.message).toBeUndefined()
      expect(response.timestamp).toEqual(expect.any(String))
    })

    it('creates success response with custom message', () => {
      const data = { id: 1 }
      const message = 'Custom success message'
      const response = createSuccessResponse(data, message)

      expect(response.success).toBe(true)
      expect(response.data).toEqual(data)
      expect(response.message).toBe(message)
      expect(response.timestamp).toEqual(expect.any(String))
    })
  })

  describe('Error Responses', () => {
    it('creates generic error response', () => {
      const message = 'Something went wrong'
      const response = createErrorResponse(message)

      expect(response.response.success).toBe(false)
      expect(response.response.error).toBe(message)
      expect(response.response.message).toBe('Bir hata oluştu')
      expect(response.status).toBe(500)
    })

    it('creates validation error response', () => {
      const errors = { name: ['Required'] }
      const response = createValidationErrorResponse(errors)

      expect(response.response.success).toBe(false)
      expect(response.response.error).toEqual(errors)
      expect(response.response.message).toBe('Doğrulama hatası')
      expect(response.status).toBe(400)
    })

    it('creates database error response', () => {
      const message = 'Database connection failed'
      
      // Set NODE_ENV to development to get the actual error message
      const originalEnv = process.env.NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' })
      
      const response = createDatabaseErrorResponse({ message })
      
      expect(response.response.success).toBe(false)
      expect(response.response.error).toBe('Veritabanı hatası')
      expect(response.response.message).toBe('Veritabanı işlemi başarısız')
      expect(response.status).toBe(500)
      
      // Restore original NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv })
    })

    it('creates auth error response', () => {
      const response = createAuthErrorResponse()

      expect(response.response.success).toBe(false)
      expect(response.response.error).toBe('Yetkilendirme hatası')
      expect(response.response.message).toBe('Giriş yapmanız gerekiyor')
      expect(response.status).toBe(401)
    })

    it('creates forbidden error response', () => {
      const response = createForbiddenErrorResponse()

      expect(response.response.success).toBe(false)
      expect(response.response.error).toBe('Bu işlem için yetkiniz yok')
      expect(response.response.message).toBe('Erişim reddedildi')
      expect(response.status).toBe(403)
    })

    it('creates not found error response', () => {
      const resource = 'Project'
      const response = createNotFoundErrorResponse(resource)

      expect(response.response.success).toBe(false)
      expect(response.response.error).toBe(`${resource} bulunamadı`)
      expect(response.response.message).toBe('Kaynak bulunamadı')
      expect(response.status).toBe(404)
    })

    it('creates rate limit error response', () => {
      const response = createRateLimitErrorResponse()

      expect(response.response.success).toBe(false)
      expect(response.response.error).toBe('Çok fazla istek gönderildi')
      expect(response.response.message).toBe('Lütfen daha sonra tekrar deneyin')
      expect(response.status).toBe(429)
    })
  })

  describe('handleApiError', () => {
    it('handles Supabase errors', () => {
      const supabaseError = {
        message: 'Database error',
        code: '23505',
        details: 'Duplicate key',
      }

      const response = handleApiError(supabaseError)

      expect(response.status).toBe(409)
      expect(response.response.success).toBe(false)
      expect(response.response.error).toBe('Bu kayıt zaten mevcut')
      expect(response.response.message).toBe('Çakışma hatası')
    })

    it('handles Zod validation errors', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number',
        },
      ])

      const response = handleApiError(zodError)

      expect(response.status).toBe(400)
      expect(response.response.success).toBe(false)
      expect(response.response.error).toEqual({ 'name': ['Expected string, received number'] })
      expect(response.response.message).toBe('Doğrulama hatası')
    })

    it('handles network errors', () => {
      const networkError = {
        message: 'Network error',
        code: 'ECONNREFUSED',
        name: 'Error'
      }
      const response = handleApiError(networkError)

      expect(response.status).toBe(503)
      expect(response.response.success).toBe(false)
      expect(response.response.error).toBe('Bağlantı hatası')
      expect(response.response.message).toBe('Servis şu anda kullanılamıyor')
    })

    it('handles generic errors', () => {
      const originalEnv = process.env.NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' })
      
      const genericError = new Error('Something went wrong')
      const response = handleApiError(genericError)

      expect(response.status).toBe(500)
      expect(response.response.success).toBe(false)
      expect(response.response.error).toBe('Beklenmeyen bir hata oluştu')
      expect(response.response.message).toBe('Sunucu hatası')
      
      Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv })
    })

    it('handles unknown error types', () => {
      const unknownError = 'String error'

      const response = handleApiError(unknownError)

      expect(response.status).toBe(500)
      expect(response.response.success).toBe(false)
      expect(response.response.error).toBe('Beklenmeyen bir hata oluştu')
      expect(response.response.message).toBe('Sunucu hatası')
    })
  })

  describe('withErrorHandling', () => {
    it('wraps handler and returns success response', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ id: 1, name: 'Test' })
      const wrappedHandler = withErrorHandling(mockHandler)
      const mockRequest = {} as NextRequest

      const response = await wrappedHandler(mockRequest)
      const responseData = await response.json() as { success: boolean; data: { id: number; name: string } }

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual({ id: 1, name: 'Test' })
      expect(mockHandler).toHaveBeenCalledWith(mockRequest)
    })

    it('wraps handler and handles errors', async () => {
      const error = new Error('Handler error')
      const mockHandler = jest.fn().mockRejectedValue(error)
      const wrappedHandler = withErrorHandling(mockHandler)
      const mockRequest = {} as NextRequest

      const response = await wrappedHandler(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Beklenmeyen bir hata oluştu')
    })

    it('preserves custom status codes from handler', async () => {
      const mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ message: 'Created' }, { status: 201 })
      )
      const wrappedHandler = withErrorHandling(mockHandler)
      const mockRequest = {} as NextRequest

      const response = await wrappedHandler(mockRequest)

      expect(response.status).toBe(201)
    })
  })
})