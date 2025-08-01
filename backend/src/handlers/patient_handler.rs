use actix_web::{web, HttpResponse, Result};
use serde_json::json;
use uuid::Uuid;
use std::collections::HashMap;
use std::sync::Mutex;

use crate::models::{Patient, CreatePatientRequest, UpdatePatientRequest};

// In-memory storage for demonstration (in production, use a database)
pub type PatientStorage = Mutex<HashMap<Uuid, Patient>>;

pub async fn create_patient(
    data: web::Json<CreatePatientRequest>,
    storage: web::Data<PatientStorage>,
) -> Result<HttpResponse> {
    let patient = Patient::new(
        data.name.clone(),
        data.email.clone(),
        data.phone_number.clone(),
        data.description.clone(),
        data.date,
    );

    let mut patients = storage.lock().unwrap();
    let patient_id = patient.id;
    patients.insert(patient_id, patient.clone());

    Ok(HttpResponse::Created().json(json!({
        "message": "Patient created successfully",
        "patient": patient
    })))
}

pub async fn get_all_patients(
    storage: web::Data<PatientStorage>,
) -> Result<HttpResponse> {
    let patients = storage.lock().unwrap();
    let patients_list: Vec<Patient> = patients.values().cloned().collect();

    Ok(HttpResponse::Ok().json(json!({
        "patients": patients_list,
        "count": patients_list.len()
    })))
}

pub async fn get_patient_by_id(
    path: web::Path<Uuid>,
    storage: web::Data<PatientStorage>,
) -> Result<HttpResponse> {
    let patient_id = path.into_inner();
    let patients = storage.lock().unwrap();

    match patients.get(&patient_id) {
        Some(patient) => Ok(HttpResponse::Ok().json(patient)),
        None => Ok(HttpResponse::NotFound().json(json!({
            "error": "Patient not found"
        })))
    }
}

pub async fn update_patient(
    path: web::Path<Uuid>,
    data: web::Json<UpdatePatientRequest>,
    storage: web::Data<PatientStorage>,
) -> Result<HttpResponse> {
    let patient_id = path.into_inner();
    let mut patients = storage.lock().unwrap();

    match patients.get_mut(&patient_id) {
        Some(patient) => {
            patient.update(data.into_inner());
            Ok(HttpResponse::Ok().json(json!({
                "message": "Patient updated successfully",
                "patient": patient
            })))
        },
        None => Ok(HttpResponse::NotFound().json(json!({
            "error": "Patient not found"
        })))
    }
}

pub async fn delete_patient(
    path: web::Path<Uuid>,
    storage: web::Data<PatientStorage>,
) -> Result<HttpResponse> {
    let patient_id = path.into_inner();
    let mut patients = storage.lock().unwrap();

    match patients.remove(&patient_id) {
        Some(_) => Ok(HttpResponse::Ok().json(json!({
            "message": "Patient deleted successfully"
        }))),
        None => Ok(HttpResponse::NotFound().json(json!({
            "error": "Patient not found"
        })))
    }
}
