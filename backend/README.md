# Treatment Manager - Backend

A Rust backend service using Actix-web for managing patient treatment records.

## Features

- RESTful API for patient management
- Treatment records linked to patients
- SQLite database with automatic creation
- Database migrations
- CORS support for frontend integration

## Database Setup

The application uses SQLite for data storage. **No manual database setup is required!**

### Automatic Database Creation

When the application starts:
1. It automatically creates the `patients.db` file if it doesn't exist
2. Runs all database migrations to create the required tables
3. The database is ready to use immediately

### Database Files

The following files are automatically generated and should not be committed to version control:
- `patients.db` - Main SQLite database file
- `patients.db-shm` - Shared memory file (SQLite WAL mode)
- `patients.db-wal` - Write-ahead log file (SQLite WAL mode)

These files are included in `.gitignore`.

### Migrations

Database schema is managed through migrations in the `migrations/` directory:
- `001_initial.sql` - Creates the patients table
- `002_add_treatments.sql` - Creates the treatments table

To add new migrations, create new SQL files with incrementing numbers.

## API Endpoints

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create a new patient
- `GET /api/patients/{id}` - Get a specific patient
- `PUT /api/patients/{id}` - Update a patient
- `DELETE /api/patients/{id}` - Delete a patient

### Treatments
- `GET /api/patients/{patient_id}/treatments` - Get all treatments for a patient
- `POST /api/patients/{patient_id}/treatments` - Create a new treatment
- `PUT /api/treatments/{id}` - Update a treatment
- `DELETE /api/treatments/{id}` - Delete a treatment

## Running the Application

```bash
cargo run
```

The server starts on `http://127.0.0.1:8080`

## Development

### Environment Setup

1. Ensure Rust is installed
2. Clone the repository
3. Run `cargo run` - the database will be created automatically

### Database Reset

If you need to reset the database during development:
1. Stop the server
2. Delete the `patients.db*` files
3. Restart the server - it will recreate the database with migrations

### Adding New Features

1. Update models in `src/models.rs`
2. Add database migrations in `migrations/`
3. Update database operations in `src/database.rs`
4. Add handlers in `src/handlers.rs`
5. Update routes in `src/routes.rs`
