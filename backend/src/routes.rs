use actix_web::web;
use crate::handlers::patient_handler;
use crate::handlers::treatment_handler;
use crate::handlers::auth;
use crate::handlers::github;
use crate::middleware::AuthMiddleware;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .service(
                web::scope("/auth")
                    .route("/login", web::post().to(auth::login))
                    .route("/verify/{token}", web::get().to(auth::verify_token))
            )
            .service(
                web::scope("/v1")
                    .wrap(AuthMiddleware) // Apply auth middleware to protected routes
                    .service(
                        web::scope("/patients")
                            .route("", web::post().to(patient_handler::create_patient))
                            .route("", web::get().to(patient_handler::get_all_patients))
                            .route("/{id}", web::get().to(patient_handler::get_patient_by_id))
                            .route("/{id}", web::put().to(patient_handler::update_patient))
                            .route("/{id}", web::delete().to(patient_handler::delete_patient))
                            
                            // Treatment routes nested under patients
                            .route("/{id}/treatments", web::post().to(treatment_handler::create_treatment))
                            .route("/{id}/treatments", web::get().to(treatment_handler::get_treatments_for_patient))
                            .route("/{patient_id}/treatments/{treatment_id}", web::get().to(treatment_handler::get_treatment_by_id))
                            .route("/{patient_id}/treatments/{treatment_id}", web::put().to(treatment_handler::update_treatment))
                            .route("/{patient_id}/treatments/{treatment_id}", web::delete().to(treatment_handler::delete_treatment))
                    )
                    .service(
                        web::scope("/treatments")
                            .route("", web::get().to(treatment_handler::get_all_treatments))
                    )
                    .service(
                        web::scope("/users")
                            .route("", web::get().to(auth::get_users))
                            .route("", web::post().to(auth::create_user))
                            .route("/{id}", web::put().to(auth::update_user))
                            .route("/{id}/password", web::put().to(auth::change_password))
                            .route("/{id}", web::delete().to(auth::delete_user))
                    )
                    .service(
                        web::scope("/github")
                            .route("/issues", web::post().to(github::create_issue))
                            .route("/health", web::get().to(github::github_health))
                    )
            )
    );
}
