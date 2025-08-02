use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Treatment {
    pub id: Uuid,
    pub patient_id: Uuid,
    pub summary: String,
    pub date: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTreatmentRequest {
    pub summary: String,
    pub date: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTreatmentRequest {
    pub summary: Option<String>,
    pub date: Option<DateTime<Utc>>,
}