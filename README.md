# Treatment Manager - Patient Management System

A web application for managing patient treatments with a Rust backend (Actix-web) and HTML/JavaScript frontend.

## Features

- **Patient Management**: Full CRUD operations for patient records
- **Patient Information**: Store name, email, phone number, and description
- **RESTful API**: Clean API endpoints for all operations
- **Web Interface**: Simple HTML interface for testing and managing patients

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

### Frontend Dependencies

- **React**: UI library
- **Vite**: Build tool and development server
- **Modern JavaScript**: ES6+ features

### Current Implementation Notes

- **Storage**: Currently using in-memory storage (HashMap) for simplicity
- **Authentication**: Not implemented yet
- **Database**: Not connected to a database yet (ready for future integration)
- **Frontend**: Modern React application with Vite for fast development

### Future Enhancements

1. **Database Integration**: Add PostgreSQL or MongoDB support
2. **Authentication**: Implement user authentication and authorization
3. **Treatment Records**: Add treatment history and medical records
4. **Advanced React Features**: Add routing, state management (Redux/Zustand)
5. **API Documentation**: Add Swagger/OpenAPI documentation
6. **Data Validation**: Enhanced input validation and error handling
7. **Testing**: Unit and integration tests for both frontend and backend
8. **PWA Features**: Offline support and push notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the MIT License.
