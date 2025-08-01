mod models;
mod handlers;
mod routes;
mod database;

use actix_web::{web, App, HttpServer, middleware::Logger};
use actix_cors::Cors;
use env_logger;

use database::Database;
use routes::configure_routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logger
    env_logger::init();

    // Initialize database
    let database_url = "sqlite:./patients.db?mode=rwc";
    let db = Database::new(database_url).await
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
    
    let db_data = web::Data::new(db);

    println!("🚀 Starting Treatment Manager Backend Server on http://127.0.0.1:8080");
    println!("📊 Database: SQLite (patients.db)");

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
            .route("/", web::get().to(|| async { "Treatment Manager API is running!" }))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
