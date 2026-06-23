// Mock window.fetch interceptor for local API simulation
// Bypasses Next.js backend server and NextAuth server routes entirely

import { mockDbManager } from './mockDatabase'

// Setup default mock session in localStorage if not exists
if (typeof window !== 'undefined') {
  if (!localStorage.getItem('mock_user_session')) {
    localStorage.setItem(
      'mock_user_session',
      JSON.stringify({
        user: {
          id: 'u1-uuid-admin',
          email: 'admin@atolyeakis.com',
          name: 'Ahmet Yılmaz',
          role: 'admin'
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
    )
  }
}

// Function to initialize fetch override
export function initMockFetch() {
  if (typeof window === 'undefined') return

  const originalFetch = window.fetch

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const urlString = typeof input === 'string' ? input : (input as Request).url || input.toString()
    
    // Check if this is an API call
    if (urlString.startsWith('/api') || urlString.includes('/api/')) {
      try {
        const parsedUrl = new URL(urlString, window.location.origin)
        const path = parsedUrl.pathname
        const method = init?.method?.toUpperCase() || 'GET'
        const queryParams = Object.fromEntries(parsedUrl.searchParams.entries())
        
        let body: any = null
        if (init?.body) {
          try {
            body = JSON.parse(init.body as string)
          } catch (e) {
            // body is not json, ignore
          }
        }

        let responseData: any = null
        let status = 200

        // Helper to format mock Response
        const makeResponse = (data: any, code: number = 200) => {
          return new Response(JSON.stringify({ success: code >= 200 && code < 300, data }), {
            status: code,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        // Mock NextAuth Session Endpoint
        if (path.includes('/api/auth/session')) {
          const session = localStorage.getItem('mock_user_session')
          return new Response(session || 'null', {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        // Mock NextAuth Login Sign-in / Sign-out Simulation
        if (path.includes('/api/auth/signin') || path.includes('/api/auth/callback')) {
          // Just return success with session
          const defaultSession = {
            user: {
              id: 'u1-uuid-admin',
              email: 'admin@atolyeakis.com',
              name: 'Ahmet Yılmaz',
              role: 'admin'
            },
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
          localStorage.setItem('mock_user_session', JSON.stringify(defaultSession))
          return makeResponse(defaultSession)
        }

        if (path.includes('/api/auth/signout')) {
          localStorage.removeItem('mock_user_session')
          return makeResponse({ success: true })
        }

        // Route: /api/projects
        if (path === '/api/projects') {
          if (method === 'GET') {
            const projects = mockDbManager.getTable('projects')
            responseData = projects
          } else if (method === 'POST') {
            responseData = mockDbManager.insertRecord('projects', body)
          } else if (method === 'PUT') {
            const id = queryParams.id
            if (!id) throw new Error('Project ID required for update')
            responseData = mockDbManager.updateRecord('projects', id, body)
          } else if (method === 'DELETE') {
            const id = queryParams.id
            if (!id) throw new Error('Project ID required for delete')
            mockDbManager.deleteRecord('projects', id)
            responseData = { success: true }
          }
          return makeResponse(responseData, status)
        }

        // Route: /api/spools
        if (path === '/api/spools') {
          if (method === 'GET') {
            let spools = mockDbManager.getTable('spools')
            if (queryParams.projectId) {
              spools = spools.filter(s => s.project_id === queryParams.projectId)
            }
            responseData = spools
          } else if (method === 'POST') {
            responseData = mockDbManager.insertRecord('spools', body)
          } else if (method === 'PUT') {
            const id = queryParams.id
            if (!id) throw new Error('Spool ID required for update')
            responseData = mockDbManager.updateRecord('spools', id, body)
          } else if (method === 'DELETE') {
            const id = queryParams.id
            if (!id) throw new Error('Spool ID required for delete')
            mockDbManager.deleteRecord('spools', id)
            responseData = { success: true }
          }
          return makeResponse(responseData, status)
        }

        // Route: /api/personnel
        if (path === '/api/personnel') {
          if (method === 'GET') {
            responseData = mockDbManager.getTable('profiles')
          } else if (method === 'POST') {
            const newPersonnel = {
              name: body.full_name,
              full_name: body.full_name,
              email: body.email,
              phone: body.phone,
              department: body.department,
              position: body.position,
              role: 'user',
              status: 'active'
            }
            responseData = mockDbManager.insertRecord('profiles', newPersonnel)
          } else if (method === 'PUT') {
            const id = queryParams.id
            if (!id) throw new Error('Personnel ID required for update')
            responseData = mockDbManager.updateRecord('profiles', id, body)
          } else if (method === 'DELETE') {
            const id = queryParams.id
            if (!id) throw new Error('Personnel ID required for delete')
            mockDbManager.deleteRecord('profiles', id)
            responseData = { success: true }
          }
          return makeResponse(responseData, status)
        }

        // Route: /api/personnel/password
        if (path === '/api/personnel/password') {
          if (method === 'PUT') {
            responseData = { message: 'Password updated successfully' }
          }
          return makeResponse(responseData, status)
        }

        // Route: /api/shipments
        if (path === '/api/shipments') {
          if (method === 'GET') {
            responseData = mockDbManager.getTable('shipments')
          } else if (method === 'POST') {
            responseData = mockDbManager.insertRecord('shipments', body)
          } else if (method === 'PUT') {
            const id = queryParams.id
            if (!id) throw new Error('Shipment ID required for update')
            responseData = mockDbManager.updateRecord('shipments', id, body)
          } else if (method === 'DELETE') {
            const id = queryParams.id
            if (!id) throw new Error('Shipment ID required for delete')
            mockDbManager.deleteRecord('shipments', id)
            responseData = { success: true }
          }
          return makeResponse(responseData, status)
        }

        // Route: /api/materials
        if (path === '/api/materials') {
          if (method === 'GET') {
            responseData = mockDbManager.getTable('inventory')
          } else if (method === 'POST') {
            responseData = mockDbManager.insertRecord('inventory', body)
          } else if (method === 'PUT') {
            const id = queryParams.id
            if (!id) throw new Error('Material ID required for update')
            responseData = mockDbManager.updateRecord('inventory', id, body)
          } else if (method === 'DELETE') {
            const id = queryParams.id
            if (!id) throw new Error('Material ID required for delete')
            mockDbManager.deleteRecord('inventory', id)
            responseData = { success: true }
          }
          return makeResponse(responseData, status)
        }

        // Route: /api/profile
        if (path === '/api/profile') {
          if (method === 'PUT') {
            // Update logged-in user profile
            const sessionStr = localStorage.getItem('mock_user_session')
            if (sessionStr) {
              const session = JSON.parse(sessionStr)
              const updatedUser = mockDbManager.updateRecord('profiles', session.user.id, body)
              session.user.name = updatedUser.full_name || updatedUser.name
              localStorage.setItem('mock_user_session', JSON.stringify(session))
              responseData = updatedUser
            } else {
              status = 401
              responseData = { message: 'Unauthorized' }
            }
          }
          return makeResponse(responseData, status)
        }

        // Route: /api/auth/register
        if (path === '/api/auth/register') {
          if (method === 'POST') {
            const newUser = {
              name: body.name,
              full_name: body.name,
              email: body.email,
              role: 'user',
              status: 'active'
            }
            const record = mockDbManager.insertRecord('profiles', newUser)
            responseData = record
          }
          return makeResponse(responseData, status)
        }

        // Generic mock response for other API routes
        return makeResponse({ message: 'Mock route not specific but succeeded' })

      } catch (error: any) {
        console.error('Mock fetch interception error:', error)
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    // Call original fetch for static pages, assets, hot reloading, etc.
    return originalFetch.apply(this, [input, init])
  }
}
