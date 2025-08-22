use sqlx::{SqlitePool, Row};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use anyhow::Result;

use crate::models::{Patient, Treatment};

#[derive(Clone)]
pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self> {
        let pool = SqlitePool::connect(database_url).await?;
        
        // Run migrations
        sqlx::migrate!("./migrations").run(&pool).await?;
        
        Ok(Database { pool })
    }

    pub fn pool(&self) -> &SqlitePool {
        &self.pool
    }

    pub async fn create_patient(&self, patient: &Patient) -> Result<()> {
        sqlx::query(
            r#"
            INSERT INTO patients (id, name, email, phone_number, description, date, active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            "#
        )
        .bind(patient.id.to_string())
        .bind(&patient.name)
        .bind(&patient.email)
        .bind(&patient.phone_number)
        .bind(&patient.description)
        .bind(patient.date.to_rfc3339())
        .bind(patient.active)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_all_patients(&self) -> Result<Vec<Patient>> {
        let rows = sqlx::query(
            "SELECT id, name, email, phone_number, description, date, active FROM patients ORDER BY date DESC"
        )
        .fetch_all(&self.pool)
        .await?;

        let mut patients = Vec::new();
        for row in rows {
            let id_str: String = row.get("id");
            let name: String = row.get("name");
            let email: Option<String> = row.try_get("email").ok();
            let phone_number: String = row.get("phone_number");
            let description: String = row.get("description");
            let date_str: String = row.get("date");
            let active: bool = row.get("active");

            let patient = Patient {
                id: Uuid::parse_str(&id_str)?,
                name,
                email,
                phone_number,
                description,
                date: DateTime::parse_from_rfc3339(&date_str)?.with_timezone(&Utc),
                active,
            };
            patients.push(patient);
        }

        Ok(patients)
    }

    pub async fn get_patient_by_id(&self, id: Uuid) -> Result<Option<Patient>> {
        let row = sqlx::query(
            "SELECT id, name, email, phone_number, description, date, active FROM patients WHERE id = ?"
        )
        .bind(id.to_string())
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            let id_str: String = row.get("id");
            let name: String = row.get("name");
            let email: String = row.get("email");
            let phone_number: String = row.get("phone_number");
            let description: String = row.get("description");
            let date_str: String = row.get("date");
            let active: bool = row.get("active");

            let patient = Patient {
                id: Uuid::parse_str(&id_str)?,
                name,
                email: Some(email),
                phone_number,
                description,
                date: DateTime::parse_from_rfc3339(&date_str)?.with_timezone(&Utc),
                active,
            };
            Ok(Some(patient))
        } else {
            Ok(None)
        }
    }

    pub async fn update_patient(&self, id: Uuid, patient: &Patient) -> Result<bool> {
        let result = sqlx::query(
            r#"
            UPDATE patients 
            SET name = ?, email = ?, phone_number = ?, description = ?, date = ?, active = ?
            WHERE id = ?
            "#
        )
        .bind(&patient.name)
        .bind(&patient.email)
        .bind(&patient.phone_number)
        .bind(&patient.description)
        .bind(patient.date.to_rfc3339())
        .bind(patient.active)
        .bind(id.to_string())
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }

    pub async fn delete_patient(&self, id: Uuid) -> Result<bool> {
        let result = sqlx::query(
            "DELETE FROM patients WHERE id = ?"
        )
        .bind(id.to_string())
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }

    // Treatment methods
    pub async fn create_treatment(&self, treatment: &Treatment) -> Result<()> {
        sqlx::query(
            r#"
            INSERT INTO treatments (id, patient_id, summary, date)
            VALUES (?, ?, ?, ?)
            "#
        )
        .bind(treatment.id.to_string())
        .bind(treatment.patient_id.to_string())
        .bind(&treatment.summary)
        .bind(treatment.date.to_rfc3339())
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_treatments_for_patient(&self, patient_id: Uuid) -> Result<Vec<Treatment>> {
        let rows = sqlx::query(
            "SELECT id, patient_id, summary, date FROM treatments WHERE patient_id = ? ORDER BY date DESC"
        )
        .bind(patient_id.to_string())
        .fetch_all(&self.pool)
        .await?;

        let mut treatments = Vec::new();
        for row in rows {
            let id_str: String = row.get("id");
            let patient_id_str: String = row.get("patient_id");
            let summary: String = row.get("summary");
            let date_str: String = row.get("date");

            let treatment = Treatment {
                id: Uuid::parse_str(&id_str)?,
                patient_id: Uuid::parse_str(&patient_id_str)?,
                summary,
                date: DateTime::parse_from_rfc3339(&date_str)?.with_timezone(&Utc),
            };
            treatments.push(treatment);
        }

        Ok(treatments)
    }

    pub async fn get_all_treatments(&self) -> Result<Vec<Treatment>> {
        let rows = sqlx::query(
            "SELECT id, patient_id, summary, date FROM treatments ORDER BY date DESC"
        )
        .fetch_all(&self.pool)
        .await?;

        let mut treatments = Vec::new();
        for row in rows {
            let id_str: String = row.get("id");
            let patient_id_str: String = row.get("patient_id");
            let summary: String = row.get("summary");
            let date_str: String = row.get("date");

            let treatment = Treatment {
                id: Uuid::parse_str(&id_str)?,
                patient_id: Uuid::parse_str(&patient_id_str)?,
                summary,
                date: DateTime::parse_from_rfc3339(&date_str)?.with_timezone(&Utc),
            };
            treatments.push(treatment);
        }

        Ok(treatments)
    }

    pub async fn get_treatment_by_id(&self, id: Uuid) -> Result<Option<Treatment>> {
        let row = sqlx::query(
            "SELECT id, patient_id, summary, date FROM treatments WHERE id = ?"
        )
        .bind(id.to_string())
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            let id_str: String = row.get("id");
            let patient_id_str: String = row.get("patient_id");
            let summary: String = row.get("summary");
            let date_str: String = row.get("date");

            let treatment = Treatment {
                id: Uuid::parse_str(&id_str)?,
                patient_id: Uuid::parse_str(&patient_id_str)?,
                summary,
                date: DateTime::parse_from_rfc3339(&date_str)?.with_timezone(&Utc),
            };
            Ok(Some(treatment))
        } else {
            Ok(None)
        }
    }

    pub async fn update_treatment(&self, id: Uuid, treatment: &Treatment) -> Result<bool> {
        let result = sqlx::query(
            r#"
            UPDATE treatments 
            SET summary = ?, date = ?
            WHERE id = ?
            "#
        )
        .bind(&treatment.summary)
        .bind(treatment.date.to_rfc3339())
        .bind(id.to_string())
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }

    pub async fn delete_treatment(&self, id: Uuid) -> Result<bool> {
        let result = sqlx::query(
            "DELETE FROM treatments WHERE id = ?"
        )
        .bind(id.to_string())
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }
}
