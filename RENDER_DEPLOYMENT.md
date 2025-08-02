# Render.com Deployment Checklist for Treatment Manager

## Pre-Deployment Setup

### 1. **Repository Preparation**
- [ ] Push all code to GitHub repository
- [ ] Ensure `.env` files are in `.gitignore`
- [ ] Verify `render.yaml` is committed
- [ ] Test build script locally: `chmod +x render-build.sh && ./render-build.sh`

### 2. **Security Configuration**
- [ ] Generate strong JWT secret: `openssl rand -base64 64`
- [ ] Create secure admin password
- [ ] Obtain GitHub Personal Access Token (if using issues feature)
- [ ] Review all environment variables in `render.env`

### 3. **Code Verification**
- [ ] Frontend builds successfully: `cd frontend && npm run build`
- [ ] Backend compiles: `cd backend && cargo build --release`
- [ ] Static files are generated in `backend/static/`

## Render.com Deployment Steps

### 1. **Create New Web Service**
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository: `ButterflyEA/treatments_manager`
4. Configure deployment settings:

### 2. **Basic Settings**
```
Name: treatments-manager
Environment: Rust
Region: Choose closest to your users
Branch: main
```

### 3. **Build & Deploy Settings**
```
Build Command:
chmod +x render-build.sh && ./render-build.sh

Start Command:
cd backend && ./target/release/backend

Root Directory: (leave empty)
```

### 4. **Environment Variables** (Add these in Render dashboard)
```
ENVIRONMENT=production
RUST_LOG=info
SERVER_HOST=0.0.0.0
DATABASE_URL=sqlite:/data/patients.db?mode=rwc

# CRITICAL: Generate new values for production
JWT_SECRET=[Generate with: openssl rand -base64 64]

# Default Admin User - CHANGE THESE!
DEFAULT_ADMIN_EMAIL=your-email@company.com
DEFAULT_ADMIN_PASSWORD=[Generate secure password]
DEFAULT_ADMIN_NAME=Your Name

# Optional: GitHub Integration
GITHUB_TOKEN=[Your GitHub Personal Access Token]
GITHUB_REPO=ButterflyEA/treatments_manager
```

### 5. **Advanced Settings**
```
Auto-Deploy: Yes
Health Check Path: /api/v1/github/health
```

### 6. **Persistent Storage** (Configured for /data)
- Database disk already configured in render.yaml:
  - Name: `treatments-data`
  - Mount Path: `/data` 
  - Size: 5 GB
- Database will be created at: `/data/patients.db`

## Post-Deployment Verification

### 1. **Application Health**
- [ ] Service builds and deploys successfully
- [ ] Application starts without errors
- [ ] Health check endpoint responds: `https://your-app.onrender.com/api/v1/github/health`

### 2. **Functionality Tests**
- [ ] Homepage loads: `https://your-app.onrender.com`
- [ ] Login works with admin credentials
- [ ] Can create/edit patients
- [ ] Can create/edit treatments
- [ ] User management functions
- [ ] GitHub issue reporting (if configured)

### 3. **Security Verification**
- [ ] HTTPS is enabled (automatic on Render)
- [ ] Admin password changed from default
- [ ] JWT secret is unique and secure
- [ ] No sensitive data in logs

## Troubleshooting

### Common Issues:

1. **"Invalid email or password" on first login**
   - **Cause**: Default user not created or environment variables not set correctly
   - **Debug Steps**: 
     1. Check Render deployment logs for user creation messages
     2. Visit `https://your-app.onrender.com/api/auth/debug/env` to verify environment variables
     3. Visit `https://your-app.onrender.com/api/auth/debug/users` to see if any users exist
     4. If needed, force create user: `POST https://your-app.onrender.com/api/auth/debug/force-create`
   - **Solution**: 
     - Verify environment variables are set correctly in Render dashboard
     - Ensure `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD` match what you're trying to login with
     - Check that variables don't have extra spaces or special characters

2. **No styles visible (CSS not loading)**
   - **Cause**: Static files not being served correctly
   - **Solution**: 
     - Check that frontend built correctly in build logs
     - Verify `/assets/` files are accessible
     - Check browser dev tools for 404 errors on CSS/JS files

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify Rust version requirements
   - Review build logs in Render dashboard

4. **Runtime Errors**
   - Check environment variables
   - Review application logs
   - Verify database permissions

5. **Frontend Not Loading**
   - Ensure static files are built correctly
   - Check file paths in build output

### Useful Commands:
```bash
# Local testing
npm run build  # In frontend/
cargo build --release  # In backend/

# Generate secrets
openssl rand -base64 64  # JWT secret
openssl rand -base64 32  # Admin password
```

## Production Maintenance

### Regular Tasks:
- [ ] Monitor application logs
- [ ] Update dependencies monthly
- [ ] Backup database (if using persistent storage)
- [ ] Review and rotate secrets quarterly
- [ ] Monitor GitHub token expiration

### Scaling Considerations:
- [ ] Consider PostgreSQL for high traffic
- [ ] Monitor memory and CPU usage
- [ ] Set up monitoring/alerting
- [ ] Consider CDN for static assets

## Support Resources
- [Render Documentation](https://render.com/docs)
- [Rust on Render Guide](https://render.com/docs/deploy-rust)
- [GitHub Repository](https://github.com/ButterflyEA/treatments_manager)
