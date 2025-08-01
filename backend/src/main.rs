mod models;
mod handlers;
mod routes;

use actix_web::{web, App, HttpServer, middleware::Logger};
use actix_cors::Cors;
use std::collections::HashMap;
use std::sync::Mutex;
use env_logger;

use handlers::PatientStorage;
use routes::configure_routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logger
    env_logger::init();

    // Initialize in-memory storage
    let patient_storage = web::Data::new(PatientStorage::new(HashMap::new()));

    println!("🚀 Starting Treatment Manager Backend Server on http://127.0.0.1:8080");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .app_data(patient_storage.clone())
            .wrap(cors)
            .wrap(Logger::default())
            .configure(configure_routes)
            .route("/", web::get().to(|| async { "Treatment Manager API is running!" }))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
