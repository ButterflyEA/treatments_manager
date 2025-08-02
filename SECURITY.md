# Production Deployment Security Checklist

## 🔒 Essential Security Steps for Production

### 1. **Change Default Admin Credentials**
```bash
# Set these environment variables in production:
export DEFAULT_ADMIN_EMAIL="your-admin@yourcompany.com"
export DEFAULT_ADMIN_PASSWORD="a-very-secure-password-123!"
export DEFAULT_ADMIN_NAME="Your Admin Name"
```

### 2. **Set JWT Secret**
```bash
# Generate a strong JWT secret (32+ characters)
export JWT_SECRET="your-production-jwt-secret-key-very-long-and-random"
```

### 3. **Database Security**
- Use a proper database (PostgreSQL/MySQL) instead of SQLite for production
- Configure database with authentication and encryption
- Regular backups with encryption

### 4. **Network Security**
- Use HTTPS/TLS in production
- Configure CORS properly (remove `allow_any_origin()`)
- Use a reverse proxy (nginx/Apache)

### 5. **After First Deploy**
- Login with default credentials
- **Immediately change the admin password** via the user management interface
- Create additional admin users if needed
- Delete or disable the default user if not needed

## 🚨 Security Warnings

1. **Never commit `.env` file with real credentials**
2. **Always change default credentials before going live**
3. **Use environment variables for sensitive configuration**
4. **Monitor failed login attempts**
5. **Regularly update dependencies**

## ✅ Current Security Features

- ✅ JWT tokens with 24-hour expiration
- ✅ Password hashing with bcrypt
- ✅ Environment variable support
- ✅ User management system
- ✅ Conditional default user creation
