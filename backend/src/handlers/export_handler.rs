use actix_web::{web, HttpResponse, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::database::Database;
use crate::models::patient::Patient;
use crate::models::treatment::Treatment;

#[derive(Debug, Serialize, Deserialize)]
pub struct PatientExportData {
    pub patient: Patient,
    pub treatments: Vec<Treatment>,
}

struct FieldNames {
    title: &'static str,
    patient_info: &'static str,
    name: &'static str,
    email: &'static str,
    phone: &'static str,
    registration_date: &'static str,
    status: &'static str,
    active: &'static str,
    inactive: &'static str,
    description: &'static str,
    treatments_history: &'static str,
    no_treatments: &'static str,
    total_treatments: &'static str,
    treatment: &'static str,
    exported_on: &'static str,
}

#[derive(Debug, Deserialize)]
pub struct ExportQuery {
    pub lang: Option<String>,
}

/// Export patient data and treatments to a Word document (RTF format)
pub async fn export_patient_to_word(
    path: web::Path<Uuid>,
    query: web::Query<ExportQuery>,
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    let patient_id = path.into_inner();
    let language = query.lang.as_deref().unwrap_or("en");
    
    // Debug logging
    eprintln!("Export request for patient ID: {} in language: {}", patient_id, language);
    
    // Debug: List all patients to see what exists
    match db.get_all_patients().await {
        Ok(all_patients) => {
            eprintln!("Total patients in database: {}", all_patients.len());
            for p in &all_patients {
                eprintln!("  - {} (ID: {})", p.name, p.id);
            }
        }
        Err(e) => eprintln!("Error fetching all patients: {}", e),
    }

    // Fetch patient data
    let patient = match db.get_patient_by_id(patient_id).await {
        Ok(Some(patient)) => {
            eprintln!("Found patient: {}", patient.name);
            patient
        },
        Ok(None) => {
            eprintln!("Patient not found in database for ID: {}", patient_id);
            return Ok(HttpResponse::NotFound().json(serde_json::json!({
                "error": "Patient not found"
            })));
        }
        Err(e) => {
            eprintln!("Database error when fetching patient {}: {}", patient_id, e);
            return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to load patient"
            })));
        }
    };

    // Fetch treatments for the patient
    let treatments = match db.get_treatments_for_patient(patient_id).await {
        Ok(treatments) => treatments,
        Err(e) => {
            eprintln!("Database error: {}", e);
            return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to load treatments"
            })));
        }
    };

    // Generate RTF document
    let rtf_content = generate_rtf_document(&patient, &treatments, language);
    let filename = format!("patient_{}_export.rtf", sanitize_filename(&patient.name));
    
    Ok(HttpResponse::Ok()
        .content_type("application/rtf")
        .append_header(("Content-Disposition", format!("attachment; filename=\"{}\"", filename)))
        .body(rtf_content))
}

fn get_field_names(language: &str) -> FieldNames {
    match language {
        "he" => FieldNames {
            title: "תיק רפואי למטופל",
            patient_info: "פרטי המטופל",
            name: "שם",
            email: "אימייל",
            phone: "טלפון",
            registration_date: "תאריך רישום",
            status: "סטטוס",
            active: "פעיל",
            inactive: "לא פעיל",
            description: "תיאור",
            treatments_history: "היסטוריית טיפולים",
            no_treatments: "לא נרשמו טיפולים",
            total_treatments: "סה״כ טיפולים",
            treatment: "טיפול",
            exported_on: "המסמך יוצא בתאריך",
        },
        _ => FieldNames {
            title: "Patient Medical Record",
            patient_info: "Patient Information",
            name: "Name",
            email: "Email",
            phone: "Phone Number",
            registration_date: "Registration Date",
            status: "Status",
            active: "Active",
            inactive: "Inactive",
            description: "Description",
            treatments_history: "Treatment History",
            no_treatments: "No treatments recorded",
            total_treatments: "Total treatments",
            treatment: "Treatment",
            exported_on: "Document exported on",
        },
    }
}

fn generate_rtf_document(patient: &Patient, treatments: &Vec<Treatment>, language: &str) -> String {
    let mut rtf = String::new();
    
    // RTF header with enhanced Hebrew support and RTL when needed
    rtf.push_str("{\\rtf1\\ansi\\ansicpg1255\\deff0\\deflang1033\\deflangfe1037 ");
    rtf.push_str("{\\fonttbl{\\f0\\fswiss\\fcharset177\\*\\fname Arial;}{\\f1\\froman\\fcharset0 Times New Roman;}}");
    rtf.push_str("{\\colortbl;\\red0\\green0\\blue0;}");
    
    // Set document direction based on language
    if language == "he" {
        // Hebrew: Right-to-left document
        rtf.push_str("\\uc1\\pard\\rtlpar\\qr\\cf1\\lang1037\\f0\\fs22 ");
    } else {
        // English/Default: Left-to-right document  
        rtf.push_str("\\uc1\\pard\\ltrpar\\cf1\\lang1037\\f0\\fs22 ");
    }
    
    // Get localized field names
    let field_names = get_field_names(language);
    
    // Title with appropriate alignment
    if language == "he" {
        rtf.push_str(&format!("\\rtlpar\\qr\\f1\\fs28\\b {} \\b0\\fs24\\par\\par", escape_rtf_hebrew(field_names.title)));
    } else {
        rtf.push_str(&format!("\\ltrpar\\ql\\f1\\fs28\\b {} \\b0\\fs24\\par\\par", escape_rtf_hebrew(field_names.title)));
    }
    
    // Patient Information Section with appropriate alignment
    if language == "he" {
        rtf.push_str(&format!("\\rtlpar\\qr\\fs20\\b {} \\b0\\fs18\\par", escape_rtf_hebrew(field_names.patient_info)));
    } else {
        rtf.push_str(&format!("\\ltrpar\\ql\\fs20\\b {} \\b0\\fs18\\par", escape_rtf_hebrew(field_names.patient_info)));
    }
    
    // Patient information fields with appropriate alignment
    let field_format = if language == "he" { "\\rtlpar\\qr" } else { "\\ltrpar\\ql" };
    
    rtf.push_str(&format!("{}\\b {}: \\b0 {}\\par", field_format, escape_rtf_hebrew(field_names.name), escape_rtf_hebrew(&patient.name)));
    rtf.push_str(&format!("{}\\b {}: \\b0 {}\\par", field_format, escape_rtf_hebrew(field_names.email), escape_rtf_hebrew(&patient.email)));
    rtf.push_str(&format!("{}\\b {}: \\b0 {}\\par", field_format, escape_rtf_hebrew(field_names.phone), escape_rtf_hebrew(&patient.phone_number)));
    rtf.push_str(&format!("{}\\b {}: \\b0 {}\\par", field_format, escape_rtf_hebrew(field_names.registration_date), format_date(&patient.date)));
    rtf.push_str(&format!("{}\\b {}: \\b0 {}\\par", field_format, escape_rtf_hebrew(field_names.status), escape_rtf_hebrew(if patient.active { field_names.active } else { field_names.inactive })));
    
    if !patient.description.is_empty() {
        rtf.push_str(&format!("{}\\b {}: \\b0 {}\\par", field_format, escape_rtf_hebrew(field_names.description), escape_rtf_hebrew(&patient.description)));
    }
    
    rtf.push_str("\\par");
    
    // Treatments Section with appropriate alignment
    if language == "he" {
        rtf.push_str(&format!("\\rtlpar\\qr\\fs20\\b {} \\b0\\fs18\\par", escape_rtf_hebrew(field_names.treatments_history)));
    } else {
        rtf.push_str(&format!("\\ltrpar\\ql\\fs20\\b {} \\b0\\fs18\\par", escape_rtf_hebrew(field_names.treatments_history)));
    }
    
    if treatments.is_empty() {
        rtf.push_str(&format!("{}\\i {}.\\i0\\par", field_format, escape_rtf_hebrew(field_names.no_treatments)));
    } else {
        rtf.push_str(&format!("{}{}: {}\\par\\par", field_format, escape_rtf_hebrew(field_names.total_treatments), treatments.len()));
        
        for (index, treatment) in treatments.iter().enumerate() {
            // Treatment number and date with appropriate alignment
            rtf.push_str(&format!(
                "{}\\b {} #{} - {}\\b0\\par",
                field_format,
                escape_rtf_hebrew(field_names.treatment),
                treatments.len() - index,
                format_date(&treatment.date)
            ));
            
            // Treatment summary with appropriate alignment
            rtf.push_str(&format!("{}{}\\par\\par", field_format, escape_rtf_hebrew(&treatment.summary)));
        }
    }
    
    // Footer with appropriate alignment
    rtf.push_str("\\par---\\par");
    rtf.push_str(&format!(
        "{}\\fs16\\i {}: {}\\i0\\fs18\\par",
        field_format,
        escape_rtf_hebrew(field_names.exported_on),
        format_date(&Utc::now())
    ));
    
    // RTF footer
    rtf.push_str("}");
    
    rtf
}

fn escape_rtf_hebrew(text: &str) -> String {
    let mut result = String::new();
    
    for ch in text.chars() {
        match ch {
            '\\' => result.push_str("\\\\"),
            '{' => result.push_str("\\{"),
            '}' => result.push_str("\\}"),
            '\n' => result.push_str("\\par "),
            '\r' => {}, // Skip carriage returns
            // Handle Hebrew characters (Unicode range 0x0590-0x05FF) with signed conversion
            c if (c as u32) >= 0x0590 && (c as u32) <= 0x05FF => {
                let unicode_val = c as u32;
                if unicode_val > 32767 {
                    // For values > 32767, use negative representation
                    let signed_val = unicode_val as i32 - 65536;
                    result.push_str(&format!("\\u{}?", signed_val));
                } else {
                    result.push_str(&format!("\\u{}?", unicode_val));
                }
            },
            // Handle other Unicode characters
            c if (c as u32) > 255 => {
                let unicode_val = c as u32;
                if unicode_val > 32767 {
                    let signed_val = unicode_val as i32 - 65536;
                    result.push_str(&format!("\\u{}?", signed_val));
                } else {
                    result.push_str(&format!("\\u{}?", unicode_val));
                }
            },
            // Regular ASCII characters
            c => result.push(c),
        }
    }
    
    result
}

fn format_date(date: &DateTime<Utc>) -> String {
    date.format("%B %d, %Y").to_string()
}

fn sanitize_filename(name: &str) -> String {
    name.chars()
        .map(|c| if c.is_alphanumeric() || c == ' ' || c == '-' || c == '_' { c } else { '_' })
        .collect::<String>()
        .replace(' ', "_")
}
