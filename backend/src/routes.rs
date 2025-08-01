use actix_web::web;
use crate::handlers::{
    create_patient,
    get_all_patients,
    get_patient_by_id,
    update_patient,
    delete_patient,
};

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1")
            .service(
                web::scope("/patients")
                    .route("", web::post().to(create_patient))
                    .route("", web::get().to(get_all_patients))
                    .route("/{id}", web::get().to(get_patient_by_id))
                    .route("/{id}", web::put().to(update_patient))
                    .route("/{id}", web::delete().to(delete_patient))
            )
    );
}
