import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Page titles and headers
      pageTitle: "Patient Management System",
      addPatient: "Add New Patient",
      editPatient: "Edit Patient",
      patientsList: "Patients List",
      
      // Form labels
      name: "Name",
      email: "Email",
      phoneNumber: "Phone Number",
      date: "Date",
      description: "Description",
      
      // Buttons
      addPatientBtn: "Add Patient",
      updatePatientBtn: "Update Patient",
      editBtn: "Edit",
      deleteBtn: "Delete",
      cancelBtn: "Cancel",
      refreshBtn: "Refresh",
      saveBtn: "Save",
      
      // Messages
      patientCreated: "Patient created successfully!",
      patientUpdated: "Patient updated successfully!",
      patientDeleted: "Patient deleted successfully!",
      deleteConfirm: "Are you sure you want to delete this patient?",
      loadingPatients: "Loading patients...",
      savingPatient: "Saving...",
      loading: "Loading...",
      
      // Errors
      errorCreating: "Error creating patient",
      errorUpdating: "Error updating patient",
      errorDeleting: "Error deleting patient",
      errorLoading: "Error loading patients",
      
      // Empty states
      noPatients: "No patients found. Add your first patient using the form above.",
      
      // Language
      language: "Language",
      english: "English",
      hebrew: "Hebrew",
      
      // Navigation
      treatments_manager: "Treatments Manager",
      patients: "Patients",
      treatments: "Treatments",
      add_patient: "Add Patient",
      
      // Page descriptions
      patients_page_description: "View and manage all registered patients",
      add_patient_page: "Add New Patient",
      add_patient_description: "Register a new patient in the system",
      
      // Patient Details
      view_details: "View Details",
      back_to_patients: "Back to Patients",
      edit_patient: "Edit Patient",
      registrationDate: "Registration Date",
      patient_not_found: "Patient not found",
      error_loading_patient: "Error loading patient",
      
      // Treatments
      patient_treatments: "Patient Treatments",
      all_treatments: "All Treatments",
      add_treatment: "Add Treatment",
      edit_treatment: "Edit Treatment",
      treatment_summary: "Treatment Summary",
      treatment_date: "Treatment Date",
      treatment_summary_placeholder: "Enter treatment details, diagnosis, medications, notes...",
      patient: "Patient",
      unknown_patient: "Unknown Patient",
      no_treatments_found: "No treatments found",
      treatments_page_description: "View and manage all patient treatments",
      
      // Treatment Actions
      create: "Create",
      update: "Update",
      saving: "Saving...",
      confirm_delete_treatment: "Are you sure you want to delete this treatment?",
      
      // Treatment Errors
      error_loading_treatments: "Error loading treatments",
      error_creating_treatment: "Error creating treatment",
      error_updating_treatment: "Error updating treatment",
      error_deleting_treatment: "Error deleting treatment"
    }
  },
  he: {
    translation: {
      // Page titles and headers
      pageTitle: "מערכת ניהול מטופלים",
      addPatient: "הוסף מטופל חדש",
      editPatient: "ערוך מטופל",
      patientsList: "רשימת מטופלים",
      
      // Form labels
      name: "שם",
      email: "אימייל",
      phoneNumber: "מספר טלפון",
      date: "תאריך",
      description: "תיאור",
      
      // Buttons
      addPatientBtn: "הוסף מטופל",
      updatePatientBtn: "עדכן מטופל",
      editBtn: "ערוך",
      deleteBtn: "מחק",
      cancelBtn: "בטל",
      refreshBtn: "רענן",
      saveBtn: "שמור",
      
      // Messages
      patientCreated: "המטופל נוצר בהצלחה!",
      patientUpdated: "המטופל עודכן בהצלחה!",
      patientDeleted: "המטופל נמחק בהצלחה!",
      deleteConfirm: "האם אתה בטוח שברצונך למחוק את המטופל הזה?",
      loadingPatients: "טוען מטופלים...",
      savingPatient: "שומר...",
      loading: "טוען...",
      
      // Errors
      errorCreating: "שגיאה ביצירת מטופל",
      errorUpdating: "שגיאה בעדכון מטופל",
      errorDeleting: "שגיאה במחיקת מטופל",
      errorLoading: "שגיאה בטעינת מטופלים",
      
      // Empty states
      noPatients: "לא נמצאו מטופלים. הוסף את המטופל הראשון שלך באמצעות הטופס למעלה.",
      
      // Language
      language: "שפה",
      english: "אנגלית",
      hebrew: "עברית",
      
      // Navigation
      treatments_manager: "מנהל הטיפולים",
      patients: "מטופלים",
      treatments: "טיפולים",
      add_patient: "הוסף מטופל",
      
      // Page descriptions
      patients_page_description: "צפה ונהל את כל המטופלים הרשומים",
      add_patient_page: "הוסף מטופל חדש",
      add_patient_description: "רשום מטופל חדש במערכת",
      
      // Patient Details
      view_details: "צפה בפרטים",
      back_to_patients: "חזור למטופלים",
      edit_patient: "ערוך מטופל",
      registrationDate: "תאריך רישום",
      patient_not_found: "מטופל לא נמצא",
      error_loading_patient: "שגיאה בטעינת מטופל",
      
      // Treatments
      patient_treatments: "טיפולי המטופל",
      all_treatments: "כל הטיפולים",
      add_treatment: "הוסף טיפול",
      edit_treatment: "ערוך טיפול",
      treatment_summary: "תקציר הטיפול",
      treatment_date: "תאריך הטיפול",
      treatment_summary_placeholder: "הזן פרטי טיפול, אבחנה, תרופות, הערות...",
      patient: "מטופל",
      unknown_patient: "מטופל לא ידוע",
      no_treatments_found: "לא נמצאו טיפולים",
      treatments_page_description: "צפה ונהל את כל טיפולי המטופלים",
      
      // Treatment Actions
      create: "צור",
      update: "עדכן",
      saving: "שומר...",
      confirm_delete_treatment: "האם אתה בטוח שברצונך למחוק את הטיפול הזה?",
      
      // Treatment Errors
      error_loading_treatments: "שגיאה בטעינת טיפולים",
      error_creating_treatment: "שגיאה ביצירת טיפול",
      error_updating_treatment: "שגיאה בעדכון טיפול",
      error_deleting_treatment: "שגיאה במחיקת טיפול"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;
