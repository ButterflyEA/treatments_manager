mod models;
mod handlers;
mod routes;
mod database;
mod auth;
mod middleware;

use actix_web::{web, App, HttpServer, middleware::Logger};
use actix_cors::Cors;
use actix_files::Files;
use dotenv::dotenv;
use std::env;

use database::Database;
use routes::configure_routes;
use handlers::auth::create_default_user;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load environment variables from .env file
    dotenv().ok();
    
    // Initialize logger
    env_logger::init();

    // Initialize database
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:./patients.db?mode=rwc".to_string());
    
    let db = Database::new(&database_url).await
        .map_err(std::io::Error::other)?;
    
    // Create default user
    if let Err(e) = create_default_user(&db).await {
        eprintln!("Warning: Failed to create default user: {e}");
    }
    
    let db_data = web::Data::new(db);

    // Configure host and port based on environment
    let host = env::var("SERVER_HOST")
        .unwrap_or_else(|_| {
            // Check if we're in debug mode (development) or release mode (production)
            if cfg!(debug_assertions) {
                "127.0.0.1".to_string()  // Debug build: localhost only
            } else {
                "0.0.0.0".to_string()    // Release build: accept external connections
            }
        });
    
    let port = env::var("PORT")  // Render sets this automatically
        .or_else(|_| env::var("SERVER_PORT"))
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .unwrap_or(8080);
    
    let bind_address = format!("{host}:{port}");
    let server_url = if host == "0.0.0.0" {
        format!("http://0.0.0.0:{port} (external access enabled)")
    } else {
        format!("http://{host}:{port}")
    };

    println!("🚀 Starting Treatment Manager Backend Server on {server_url}");
    println!("📊 Database: {database_url}");
    println!("🌐 Frontend: Serving static files from ./static");
    println!("🏠 Environment: {} ({})", 
        if host == "127.0.0.1" { "Development (localhost only)" } else { "Production (external access)" },
        if cfg!(debug_assertions) { "debug build" } else { "release build" }
    );
    println!("📝 GitHub Issues: {}", if std::env::var("GITHUB_TOKEN").is_ok() { "✅ Configured" } else { "❌ Not configured" });
    
    // Show environment variable status for debugging
    println!("🔧 Environment Variables Status:");
    println!("   DEFAULT_ADMIN_EMAIL: {}", if std::env::var("DEFAULT_ADMIN_EMAIL").is_ok() { "✅ Set" } else { "❌ Not set" });
    println!("   DEFAULT_ADMIN_PASSWORD: {}", if std::env::var("DEFAULT_ADMIN_PASSWORD").is_ok() { "✅ Set" } else { "❌ Not set" });
    println!("   DEFAULT_ADMIN_NAME: {}", if std::env::var("DEFAULT_ADMIN_NAME").is_ok() { "✅ Set" } else { "❌ Not set" });
    println!("   JWT_SECRET: {}", if std::env::var("JWT_SECRET").is_ok() { "✅ Set" } else { "❌ Not set" });

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .app_data(db_data.clone())
            .wrap(cors)
            .wrap(Logger::default())
            // Configure API routes FIRST (highest priority)
            .configure(configure_routes)
            // Serve static assets
            .service(Files::new("/assets", "./static/assets"))
            .service(Files::new("/vite.svg", "./static/vite.svg"))
            // Root index file
            .route("/", web::get().to(|| async {
                actix_files::NamedFile::open("./static/index.html")
            }))
            // Fallback route for SPA (Single Page Application) - serves index.html for all other routes
            .default_service(
                web::route().to(|| async {
                    actix_files::NamedFile::open("./static/index.html")
                })
            )
    })
    .bind(&bind_address)?
    .run()
    .await
}
