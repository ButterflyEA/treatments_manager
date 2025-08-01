use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Patient {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub phone_number: String,
    pub description: String,
    pub date: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreatePatientRequest {
    pub name: String,
    pub email: String,
    pub phone_number: String,
    pub description: String,
    pub date: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePatientRequest {
    pub name: Option<String>,
    pub email: Option<String>,
    pub phone_number: Option<String>,
    pub description: Option<String>,
    pub date: Option<DateTime<Utc>>,
}

impl Patient {
    pub fn new(name: String, email: String, phone_number: String, description: String, date: Option<DateTime<Utc>>) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            email,
            phone_number,
            description,
            date: date.unwrap_or_else(Utc::now),
        }
    }

    pub fn update(&mut self, update_req: UpdatePatientRequest) {
        if let Some(name) = update_req.name {
            self.name = name;
        }
        if let Some(email) = update_req.email {
            self.email = email;
        }
        if let Some(phone_number) = update_req.phone_number {
            self.phone_number = phone_number;
        }
        if let Some(description) = update_req.description {
            self.description = description;
        }
        if let Some(date) = update_req.date {
            self.date = date;
        }
    }
}
