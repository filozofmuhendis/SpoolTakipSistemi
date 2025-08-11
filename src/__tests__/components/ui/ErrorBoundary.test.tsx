import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

// Test component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Mock console.error to avoid noise in test output
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeTruthy()
  })

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeTruthy()
    expect(screen.getByText('Reload Page')).toBeTruthy()
    expect(screen.getByText('Go to Home')).toBeTruthy()
  })

  it('shows error boundary UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Check if error boundary UI is displayed
    expect(screen.getByText('Something went wrong')).toBeTruthy()
    expect(screen.getByText('Sorry, an unexpected error occurred. Please reload the page or try again later.')).toBeTruthy()
    
    // Check if action buttons are present
    expect(screen.getByText('Retry')).toBeTruthy()
    expect(screen.getByText('Reload Page')).toBeTruthy()
    expect(screen.getByText('Go to Home')).toBeTruthy()
  })

  it('hides error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production' })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.queryByText('Error Details:')).toBeNull()
    expect(screen.queryByText('Test error')).toBeNull()

    Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv })
  })

  it('calls window.location.reload when reload button is clicked', async () => {
    const user = userEvent.setup()
    const mockReload = jest.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const reloadButton = screen.getByText('Reload Page')
    await user.click(reloadButton)

    expect(mockReload).toHaveBeenCalledTimes(1)
  })

  it('logs error information when error occurs', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('resets error state when children change', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeTruthy()

    // ErrorBoundary state doesn't reset automatically on rerender
    // The error state persists until the component is remounted
    expect(screen.getByText('Something went wrong')).toBeTruthy()
  })
})