// Setup for integration tests (Node environment)
// Load environment variables is handled by next/jest
const { config } = require('dotenv');
const path = require('path');

// Explicitly load .env.local for integration tests just in case 
config({ path: path.resolve(__dirname, '.env.local') });

// Polyfill fetch (force node-fetch over undici for tests)
const nodeFetch = require('node-fetch');
global.fetch = nodeFetch;
global.Headers = nodeFetch.Headers;
global.Request = nodeFetch.Request;
global.Response = nodeFetch.Response;

// Global timeout for integration tests (real DB calls can be slow)
jest.setTimeout(30000); // 30 seconds
