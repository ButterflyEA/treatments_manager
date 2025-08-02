# Dockerfile for Treatment Manager on Render
FROM node:18-alpine AS frontend-builder

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# Rust backend
FROM rust:1.75-slim AS backend-builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy backend source
COPY backend/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist ./static

# Build backend
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd -m -u 1000 app

# Set working directory
WORKDIR /app

# Copy binary and static files
COPY --from=backend-builder /app/target/release/backend ./
COPY --from=backend-builder /app/static ./static

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R app:app /app

# Switch to app user
USER app

# Expose port
EXPOSE 8080

# Environment variables
ENV RUST_LOG=info
ENV ENVIRONMENT=production
ENV DATABASE_URL=sqlite:./data/patients.db?mode=rwc

# Start the application
CMD ["./backend"]
