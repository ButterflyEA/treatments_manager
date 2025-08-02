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
            // Auto-detect environment
            if env::var("RUST_LOG").unwrap_or_default() == "debug" || 
               env::var("NODE_ENV").unwrap_or_default() == "development" ||
               env::var("ENVIRONMENT").unwrap_or_default() == "development" {
                "127.0.0.1".to_string()  // Development: localhost only
            } else {
                "0.0.0.0".to_string()    // Production: accept external connections
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
    println!("🏠 Environment: {}", if host == "127.0.0.1" { "Development (localhost only)" } else { "Production (external access)" });
    println!("📝 GitHub Issues: {}", if std::env::var("GITHUB_TOKEN").is_ok() { "✅ Configured" } else { "❌ Not configured" });

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
            .configure(configure_routes)
            // Serve static files (frontend)
            .service(Files::new("/", "./static").index_file("index.html"))
            // Fallback route for SPA (Single Page Application)
            .default_service(
                web::route()
                    .guard(actix_web::guard::Not(actix_web::guard::Header("content-type", "application/json")))
                    .to(|| async {
                        actix_files::NamedFile::open("./static/index.html")
                    })
            )
    })
    .bind(&bind_address)?
    .run()
    .await
}
