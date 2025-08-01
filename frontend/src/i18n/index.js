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
      hebrew: "Hebrew"
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
      hebrew: "עברית"
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
