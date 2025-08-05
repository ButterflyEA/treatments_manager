# Treatment Manager - AI Coding Assistant Instructions

## Project Architecture

This is a **monolithic Rust backend serving a React SPA**. The frontend is built by Vite and served as static files from `backend/dist/` by Actix-web.

### Key Architecture Patterns

- **Single Binary Deployment**: Frontend builds into `backend/dist/`, served by Rust backend
- **JWT Authentication**: All `/api/v1/*` routes (except auth) require Bearer token via `AuthMiddleware`
- **SQLite Auto-Setup**: Database file auto-creates on startup with migrations in `database.rs`
- **Handler-Model Pattern**: Controllers in `handlers/`, data models in `models/`, routes in `routes.rs`

## Development Workflow

### Essential Commands

```bash
# Full build (frontend → backend)
./build.bat          # Windows
./build.sh           # Linux/macOS

# Development servers
./start-dev.bat      # Backend only (port 8080)
cd frontend && npm run dev  # Frontend dev server (port 5173)

# Production deployment
./start-prod.bat     # Single binary serving everything
```

### Critical Files to Understand

- `routes.rs`: API route definitions with auth middleware wrapping
- `main.rs`: Server setup, database init, static file serving from `dist/`
- `frontend/src/App.jsx`: Single-page router with manual page state management
- `backend/src/handlers/`: REST API controllers (patient, treatment, auth, github)

## Project-Specific Conventions

### Backend Patterns

- **Authentication**: Use `AuthMiddleware` wrapper in `routes.rs` for protected routes
- **Database**: SQLx with compile-time query checking, auto-migrations on startup
- **Error Handling**: Return `HttpResponse::InternalServerError()` for user-facing errors
- **Environment**: Use `.env` file, fallback to sensible defaults (see `main.rs`)

### Frontend Patterns

- **Routing**: Manual page state in `App.jsx` (`currentPage` state), no React Router
- **API Calls**: Use `AuthService.makeAuthenticatedRequest()` for authenticated endpoints
- **i18n**: React-i18next with RTL support (Hebrew/English), translations in `src/i18n/`
- **Styling**: Component-specific CSS files, global styles in `App.css`

### GitHub Integration

- **Issue Creation**: `handlers/github.rs` creates GitHub issues with labels/metadata
- **Authentication**: Requires `GITHUB_TOKEN` and `GITHUB_REPO` env vars
- **Frontend**: `IssuesPage.jsx` has issue creation form + open issues display

## Critical Integration Points

### Frontend ↔ Backend Communication

- **Dev Mode**: Frontend (localhost:5173) → Backend (localhost:8080) via CORS
- **Production**: Frontend served from `/` by backend, APIs at `/api/*`
- **Authentication**: JWT token in localStorage, sent as `Authorization: Bearer {token}`

### Database Schema

Auto-created tables: `users`, `patients`, `treatments`. See `models/` for structure.
No manual migrations needed - handled by SQLx in `database.rs`.

### Environment Dependencies

```bash
# Required for GitHub integration
GITHUB_TOKEN=ghp_xxx...
GITHUB_REPO=owner/repo

# Optional (has defaults)
DATABASE_URL=sqlite:./patients.db?mode=rwc
JWT_SECRET=your-secret-key  # CHANGE IN PRODUCTION
SERVER_HOST=127.0.0.1
SERVER_PORT=8080
```

## Common Patterns for AI Agents

### Adding New API Endpoints

1. Create handler function in appropriate `handlers/*.rs` file
2. Add route in `routes.rs` under correct scope (`/api/v1/...`)
3. Wrap with `AuthMiddleware` if authentication required
4. Update frontend service calls in `services/` or component files

### Adding New Pages

1. Create `Component.jsx` and `Component.css` in `frontend/src/components/`
2. Add page case to `App.jsx` router switch
3. Add navigation link in `Navigation.jsx`
4. Add i18n translations to `frontend/src/i18n/index.js`

### Database Changes

1. Modify model in `models/*.rs`
2. Update SQL queries in handlers
3. Database schema updates automatically on restart (SQLx migrations)

## Debugging Common Issues

- **CORS errors**: Check if frontend dev server is running on different port
- **Auth failures**: Verify JWT token in browser localStorage and `Authorization` header
- **Database locked**: Stop all backend processes, SQLite uses WAL mode
- **Build failures**: Run `npm run build` in frontend first, then `cargo build` in backend
