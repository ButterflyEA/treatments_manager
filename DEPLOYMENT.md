# Treatment Manager - Production Deployment Guide

## JWT Token Production Considerations

### ✅ What's Already Working
- JWT token creation and verification
- 24-hour token expiration
- Secure password hashing with bcrypt
- Bearer token authentication
- Token storage in localStorage
- Automatic token validation and refresh

### 🔧 Production Requirements

#### 1. JWT Secret Security
**CRITICAL**: Change the JWT secret before deployment!

```bash
# Generate a strong JWT secret
openssl rand -base64 64
```

Update `backend/.env`:
```
JWT_SECRET=your-generated-strong-secret-here
```

#### 2. Environment Variables

**Backend (.env):**
```
DATABASE_URL=sqlite:./patients.db?mode=rwc
JWT_SECRET=your-super-strong-secret-from-openssl
SERVER_HOST=0.0.0.0  # Accept external connections
SERVER_PORT=8080
```

**Frontend (.env):**
```
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

#### 3. CORS Configuration
The current CORS setup (`allow_any_origin()`) is permissive for development.

For production, update `backend/src/main.rs`:
```rust
let cors = Cors::default()
    .allowed_origin("https://your-frontend-domain.com")
    .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
    .allowed_headers(vec!["Content-Type", "Authorization"])
    .max_age(3600);
```

#### 4. HTTPS/TLS
- Deploy backend with HTTPS (use reverse proxy like nginx)
- Deploy frontend with HTTPS
- JWT tokens will work over HTTPS without changes

#### 5. Database Security
- For production, consider PostgreSQL instead of SQLite
- Use connection pooling
- Backup strategy

### 🚀 Deployment Steps

1. **Generate Production JWT Secret:**
   ```bash
   openssl rand -base64 64
   ```

2. **Update Environment Variables:**
   - Backend: Set strong JWT_SECRET
   - Frontend: Set production API URL

3. **Build Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

4. **Deploy Backend:**
   ```bash
   cd backend
   cargo build --release
   ./target/release/backend
   ```

5. **Serve Frontend:**
   - Use nginx, Apache, or CDN
   - Ensure HTTPS is enabled

### 🔒 Security Checklist

- [ ] Strong JWT secret (64+ characters)
- [ ] HTTPS enabled for both frontend and backend
- [ ] CORS properly configured for production domains
- [ ] Environment variables secured (not in source code)
- [ ] Database connection secured
- [ ] Default user password changed

### 📱 Token Behavior in Production

**Token Lifecycle:**
- ✅ 24-hour expiration
- ✅ Automatic logout on expiration
- ✅ Secure storage in localStorage
- ✅ Bearer token authentication
- ✅ Cross-domain support (with proper CORS)

**What works across deployments:**
- Token validation
- Automatic token refresh handling
- Secure authentication flow
- Multi-language support (Hebrew/English)

### 🌐 Platform-Specific Notes

**Vercel/Netlify (Frontend):**
- Set VITE_API_BASE_URL in deployment settings
- No additional JWT configuration needed

**Railway/Heroku/VPS (Backend):**
- Set JWT_SECRET environment variable
- Ensure port binding works with platform requirements
- Configure CORS for your frontend domain

The JWT implementation is production-ready with proper environment configuration!
