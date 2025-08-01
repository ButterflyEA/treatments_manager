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

impl Treatment {
    pub fn new(patient_id: Uuid, summary: String, date: Option<DateTime<Utc>>) -> Self {
        Self {
            id: Uuid::new_v4(),
            patient_id,
            summary,
            date: date.unwrap_or_else(|| Utc::now()),
        }
    }

    pub fn update(&mut self, update_req: UpdateTreatmentRequest) {
        if let Some(summary) = update_req.summary {
            self.summary = summary;
        }
        if let Some(date) = update_req.date {
            self.date = date;
        }
    }
}