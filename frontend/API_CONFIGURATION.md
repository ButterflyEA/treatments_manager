# Frontend API Configuration - Environment Setup

## Current Configuration Status: ✅ FIXED

### Issues Found & Fixed:

1. **❌ Inconsistent API Configuration in IssuesPage.jsx**
   - **Problem**: Used hardcoded `/api/v1/github/issues` instead of environment-based URL
   - **Fix**: Updated to use `API_BASE_URL` constant like other services

2. **❌ No Environment-Specific Configuration**
   - **Problem**: Single `.env` file for both development and production
   - **Fix**: Created separate `.env.development` and `.env.production` files

### Current Setup:

#### Development Environment (`.env.development`):
```
VITE_API_BASE_URL=http://127.0.0.1:8080/api
```

#### Production Environment (`.env.production`):
```
VITE_API_BASE_URL=https://treatments-manager.onrender.com/api
```

#### Default Environment (`.env`):
```
# Set to development by default
VITE_API_BASE_URL=http://127.0.0.1:8080/api
```

### How It Works:

#### Development Mode (`npm run dev`):
- Uses Vite dev server with proxy configuration
- API calls go to `http://127.0.0.1:8080/api`
- Proxy forwards `/api` requests to local backend
- Falls back to localhost if env var not set

#### Production Build (`npm run build`):
- Uses production environment variables
- API calls go to `https://treatments-manager.onrender.com/api`
- No proxy needed, direct API calls to deployed backend

### Service Files Configuration:

All service files now consistently use:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '/api/v1') || 'http://127.0.0.1:8080/api/v1';
```

This ensures:
- ✅ Environment variable takes precedence
- ✅ Automatic fallback to localhost for development
- ✅ Consistent URL transformation for v1 endpoints
- ✅ Works in both development and production

### Deployment Instructions:

#### For Local Development:
1. Ensure backend is running on `http://127.0.0.1:8080`
2. Run `npm run dev` in frontend directory
3. API calls will be proxied to local backend

#### For Production Deployment:
1. Environment will automatically use `.env.production`
2. Run `npm run build` to create production build
3. Build output goes to `../backend/static` for integrated deployment
4. API calls will go directly to production URL

### Testing the Configuration:

#### Test Development:
```bash
cd frontend
npm run dev
# Check browser console for: "🌐 Frontend API Base URL: http://127.0.0.1:8080/api/v1"
```

#### Test Production Build:
```bash
cd frontend
npm run build
# Check built files use production API URL
```

## Status: ✅ COMPLETE

The frontend now consistently:
- Uses localhost API in development (`127.0.0.1:8080`)
- Uses production API on the server (`treatments-manager.onrender.com`)
- Has proper environment-specific configuration
- All service files use consistent API configuration
- No hardcoded API URLs remain
