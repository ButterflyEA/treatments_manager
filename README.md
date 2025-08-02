# Treatment Manager 🏥

A comprehensive patient and treatment management system with a React frontend served by a Rust backend.

## Features ✨

- **Patient Management**: Add, edit, view, and delete patient records
- **Treatment Tracking**: Record and manage patient treatments
- **User Management**: Multi-user support with JWT authentication
- **Issue Reporting**: Built-in GitHub integration for bug reports and feature requests
- **Internationalization**: Full support for English and Hebrew (RTL)
- **Single Binary Deployment**: Frontend is served by the backend
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start 🚀

### Prerequisites

- **Node.js** (v16 or higher) - for building frontend
- **Rust** (latest stable) - for backend
- **Git**

### Installation & Build

1. **Clone and setup**:
   ```bash
   git clone https://github.com/ButterflyEA/treatments_manager.git
   cd treatments_manager
   cd frontend && npm install && cd ..
   ```

2. **Configure environment**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env file with your settings
   ```

3. **Build everything**:
   
   **Windows**:
   ```cmd
   build.bat
   ```
   
   **Linux/macOS**:
   ```bash
   chmod +x build.sh && ./build.sh
   ```

4. **Run the application**:
   ```bash
   cd backend
   cargo run --release
   ```

5. **Access at**: http://127.0.0.1:8080
   - **Login**: `admin@treatments.com` / `admin123`

## Architecture 🏗️

The application uses a **single-server architecture** where the Rust backend serves both the API and the built React frontend:

```
Frontend (React) → Build → backend/static/ → Served by Rust backend
                     ↓
API Requests → Rust Backend (Actix-web) → SQLite Database
```

## Project Structure

```
treatments_manager/
├── backend/                 # Rust backend with Actix-web
│   ├── src/
│   │   ├── models/         # Data models
│   │   ├── handlers/       # Request handlers
│   │   ├── routes.rs       # API routes configuration
│   │   └── main.rs         # Main application entry point
│   └── Cargo.toml          # Rust dependencies
└── frontend/               # React frontend with Vite
    ├── src/
    │   ├── components/     # React components
    │   ├── services/       # API services
    │   ├── App.jsx         # Main App component
    │   └── main.jsx        # React entry point
    ├── package.json        # Node.js dependencies
    └── vite.config.js      # Vite configuration
```

## Getting Started

### Prerequisites

- Rust (latest stable version)
- Cargo (comes with Rust)
- A web browser

### Running the Backend

1. Navigate to the backend directory:
   ```powershell
   cd backend
   ```

2. Install dependencies and run the server:
   ```powershell
   cargo run
   ```

   The server will start on `http://127.0.0.1:8080`

### Running the Frontend

1. Navigate to the frontend directory:
   ```powershell
   cd frontend
   ```

2. Install dependencies (first time only):
   ```powershell
   npm install
   ```

3. Start the development server:
   ```powershell
   npm run dev
   ```

   The frontend will start on `http://localhost:5173` and automatically open in your browser.

## API Endpoints

### Base URL: `http://127.0.0.1:8080/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/patients` | Create a new patient |
| GET | `/patients` | Get all patients |
| GET | `/patients/{id}` | Get a specific patient by ID |
| PUT | `/patients/{id}` | Update a patient |
| DELETE | `/patients/{id}` | Delete a patient |

### Patient Data Structure

```json
{
  "id": "uuid-string",
  "name": "Patient Name",
  "email": "patient@example.com",
  "phone_number": "+1234567890",
  "description": "Patient description/notes"
}
```

### Example API Usage

#### Create a Patient
```bash
curl -X POST http://127.0.0.1:8080/api/v1/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone_number": "+1234567890",
    "description": "Regular checkup patient"
  }'
```

#### Get All Patients
```bash
curl http://127.0.0.1:8080/api/v1/patients
```

#### Update a Patient
```bash
curl -X PUT http://127.0.0.1:8080/api/v1/patients/{patient-id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com"
  }'
```

#### Delete a Patient
```bash
curl -X DELETE http://127.0.0.1:8080/api/v1/patients/{patient-id}
```

## Development

### Backend Dependencies

- **actix-web**: Web framework
- **actix-cors**: CORS middleware
- **serde**: Serialization/deserialization
- **uuid**: UUID generation
- **tokio**: Async runtime
- **sqlx**: Async SQL toolkit with SQLite support
- **chrono**: Date and time library
- **anyhow**: Error handling

### Frontend Dependencies

- **React**: UI library
- **Vite**: Build tool and development server
- **Modern JavaScript**: ES6+ features

### Current Implementation Notes

- **Database**: SQLite database for persistent storage (`patients.db`)
- **Migrations**: Automatic database schema setup and migrations
- **Authentication**: Not implemented yet
- **Frontend**: Modern React application with Vite for fast development
- **i18n**: Full internationalization support for English and Hebrew

### Future Enhancements

1. **Database Optimization**: Add connection pooling and query optimization
2. **Authentication**: Implement user authentication and authorization
3. **Treatment Records**: Add treatment history and medical records
4. **Advanced React Features**: Add routing, state management (Redux/Zustand)
5. **API Documentation**: Add Swagger/OpenAPI documentation
6. **Data Validation**: Enhanced input validation and error handling
7. **Testing**: Unit and integration tests for both frontend and backend
8. **PWA Features**: Offline support and push notifications
9. **Database Backup**: Automated backup and restore functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the MIT License.
