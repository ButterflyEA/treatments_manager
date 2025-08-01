use actix_web::{web, HttpResponse, Result};
use serde_json::json;
use uuid::Uuid;

use crate::models::{Patient, CreatePatientRequest, UpdatePatientRequest};
use crate::database::Database;

pub async fn create_patient(
    data: web::Json<CreatePatientRequest>,
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    let patient = Patient::new(
        data.name.clone(),
        data.email.clone(),
        data.phone_number.clone(),
        data.description.clone(),
        data.date,
    );

    match db.create_patient(&patient).await {
        Ok(_) => Ok(HttpResponse::Created().json(json!({
            "message": "Patient created successfully",
            "patient": patient
        }))),
        Err(e) => {
            eprintln!("Database error: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Failed to create patient"
            })))
        }
    }
}

pub async fn get_all_patients(
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    match db.get_all_patients().await {
        Ok(patients) => Ok(HttpResponse::Ok().json(json!({
            "patients": patients,
            "count": patients.len()
        }))),
        Err(e) => {
            eprintln!("Database error: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Failed to fetch patients"
            })))
        }
    }
}

pub async fn get_patient_by_id(
    path: web::Path<Uuid>,
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    let patient_id = path.into_inner();

    match db.get_patient_by_id(patient_id).await {
        Ok(Some(patient)) => Ok(HttpResponse::Ok().json(patient)),
        Ok(None) => Ok(HttpResponse::NotFound().json(json!({
            "error": "Patient not found"
        }))),
        Err(e) => {
            eprintln!("Database error: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Failed to fetch patient"
            })))
        }
    }
}

pub async fn update_patient(
    path: web::Path<Uuid>,
    data: web::Json<UpdatePatientRequest>,
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    let patient_id = path.into_inner();

    // First, get the existing patient
    let existing_patient = match db.get_patient_by_id(patient_id).await {
        Ok(Some(patient)) => patient,
        Ok(None) => return Ok(HttpResponse::NotFound().json(json!({
            "error": "Patient not found"
        }))),
        Err(e) => {
            eprintln!("Database error: {}", e);
            return Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Failed to fetch patient"
            })));
        }
    };

    // Create updated patient
    let mut updated_patient = existing_patient;
    updated_patient.update(data.into_inner());

    match db.update_patient(patient_id, &updated_patient).await {
        Ok(true) => Ok(HttpResponse::Ok().json(json!({
            "message": "Patient updated successfully",
            "patient": updated_patient
        }))),
        Ok(false) => Ok(HttpResponse::NotFound().json(json!({
            "error": "Patient not found"
        }))),
        Err(e) => {
            eprintln!("Database error: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Failed to update patient"
            })))
        }
    }
}

pub async fn delete_patient(
    path: web::Path<Uuid>,
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    let patient_id = path.into_inner();

    match db.delete_patient(patient_id).await {
        Ok(true) => Ok(HttpResponse::Ok().json(json!({
            "message": "Patient deleted successfully"
        }))),
        Ok(false) => Ok(HttpResponse::NotFound().json(json!({
            "error": "Patient not found"
        }))),
        Err(e) => {
            eprintln!("Database error: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Failed to delete patient"
            })))
        }
    }
}
