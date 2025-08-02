use actix_web::{web, HttpResponse, Result as ActixResult};
use uuid::Uuid;

use crate::database::Database;
use crate::models::treatment::{Treatment, CreateTreatmentRequest, UpdateTreatmentRequest};

pub async fn create_treatment(
    path: web::Path<Uuid>,
    body: web::Json<CreateTreatmentRequest>,
    data: web::Data<Database>,
) -> ActixResult<HttpResponse> {
    let patient_id = path.into_inner();

    // Check if patient exists
    match data.get_patient_by_id(patient_id).await {
        Ok(Some(_)) => {
            // Patient exists, proceed with treatment creation
            let new_treatment = Treatment {
                id: Uuid::new_v4(),
                patient_id,
                summary: body.summary.clone(),
                date: body.date.unwrap_or_else(chrono::Utc::now),
            };

            match data.create_treatment(&new_treatment).await {
                Ok(_) => Ok(HttpResponse::Created().json(&new_treatment)),
                Err(e) => {
                    eprintln!("Failed to create treatment: {e}");
                    Ok(HttpResponse::InternalServerError().json("Failed to create treatment"))
                }
            }
        }
        Ok(None) => Ok(HttpResponse::NotFound().json("Patient not found")),
        Err(e) => {
            eprintln!("Failed to check patient: {e}");
            Ok(HttpResponse::InternalServerError().json("Failed to check patient"))
        }
    }
}

pub async fn get_treatments_for_patient(
    path: web::Path<Uuid>,
    data: web::Data<Database>,
) -> ActixResult<HttpResponse> {
    let patient_id = path.into_inner();

    match data.get_treatments_for_patient(patient_id).await {
        Ok(treatments) => Ok(HttpResponse::Ok().json(treatments)),
        Err(e) => {
            eprintln!("Failed to fetch treatments: {e}");
            Ok(HttpResponse::InternalServerError().json("Failed to fetch treatments"))
        }
    }
}

pub async fn get_all_treatments(data: web::Data<Database>) -> ActixResult<HttpResponse> {
    match data.get_all_treatments().await {
        Ok(treatments) => Ok(HttpResponse::Ok().json(treatments)),
        Err(e) => {
            eprintln!("Failed to fetch treatments: {e}");
            Ok(HttpResponse::InternalServerError().json("Failed to fetch treatments"))
        }
    }
}

pub async fn get_treatment_by_id(
    path: web::Path<(Uuid, Uuid)>,
    data: web::Data<Database>,
) -> ActixResult<HttpResponse> {
    let (patient_id, treatment_id) = path.into_inner();

    match data.get_treatment_by_id(treatment_id).await {
        Ok(Some(treatment)) => {
            // Verify that the treatment belongs to the specified patient
            if treatment.patient_id == patient_id {
                Ok(HttpResponse::Ok().json(treatment))
            } else {
                Ok(HttpResponse::NotFound().json("Treatment not found for this patient"))
            }
        }
        Ok(None) => Ok(HttpResponse::NotFound().json("Treatment not found")),
        Err(e) => {
            eprintln!("Failed to fetch treatment: {e}");
            Ok(HttpResponse::InternalServerError().json("Failed to fetch treatment"))
        }
    }
}

pub async fn update_treatment(
    path: web::Path<(Uuid, Uuid)>,
    body: web::Json<UpdateTreatmentRequest>,
    data: web::Data<Database>,
) -> ActixResult<HttpResponse> {
    let (patient_id, treatment_id) = path.into_inner();

    // First, check if the treatment exists and belongs to the patient
    match data.get_treatment_by_id(treatment_id).await {
        Ok(Some(existing_treatment)) => {
            if existing_treatment.patient_id != patient_id {
                return Ok(HttpResponse::NotFound().json("Treatment not found for this patient"));
            }

            let updated_treatment = Treatment {
                id: treatment_id,
                patient_id,
                summary: body.summary.clone().unwrap_or(existing_treatment.summary),
                date: body.date.unwrap_or(existing_treatment.date),
            };

            match data.update_treatment(treatment_id, &updated_treatment).await {
                Ok(true) => Ok(HttpResponse::Ok().json(&updated_treatment)),
                Ok(false) => Ok(HttpResponse::NotFound().json("Treatment not found")),
                Err(e) => {
                    eprintln!("Failed to update treatment: {e}");
                    Ok(HttpResponse::InternalServerError().json("Failed to update treatment"))
                }
            }
        }
        Ok(None) => Ok(HttpResponse::NotFound().json("Treatment not found")),
        Err(e) => {
            eprintln!("Failed to fetch treatment: {e}");
            Ok(HttpResponse::InternalServerError().json("Failed to fetch treatment"))
        }
    }
}

pub async fn delete_treatment(
    path: web::Path<(Uuid, Uuid)>,
    data: web::Data<Database>,
) -> ActixResult<HttpResponse> {
    let (patient_id, treatment_id) = path.into_inner();

    // First, check if the treatment exists and belongs to the patient
    match data.get_treatment_by_id(treatment_id).await {
        Ok(Some(treatment)) => {
            if treatment.patient_id != patient_id {
                return Ok(HttpResponse::NotFound().json("Treatment not found for this patient"));
            }

            match data.delete_treatment(treatment_id).await {
                Ok(true) => Ok(HttpResponse::NoContent().finish()),
                Ok(false) => Ok(HttpResponse::NotFound().json("Treatment not found")),
                Err(e) => {
                    eprintln!("Failed to delete treatment: {e}");
                    Ok(HttpResponse::InternalServerError().json("Failed to delete treatment"))
                }
            }
        }
        Ok(None) => Ok(HttpResponse::NotFound().json("Treatment not found")),
        Err(e) => {
            eprintln!("Failed to fetch treatment: {e}");
            Ok(HttpResponse::InternalServerError().json("Failed to fetch treatment"))
        }
    }
}
