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
      edit: "Edit",
      delete: "Delete",
      cancelBtn: "Cancel",
      cancel: "Cancel",
      refreshBtn: "Refresh",
      saveBtn: "Save",
      clearFilterBtn: "Clear Filter",
      
      // Search and Filter
      searchPatients: "Search patients by name...",
      filterByName: "Filter by Name",
      noMatchingPatients: "No patients found matching your search.",
      searchTreatments: "Search by patient name or treatment details...",
      filterTreatments: "Filter Treatments",
      dateRange: "Date Range",
      fromDate: "From Date",
      toDate: "To Date",
      noMatchingTreatments: "No treatments found matching your filters.",
      allTreatments: "All Treatments",
      clearFilters: "Clear Filters",
      
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
      edit_patient_description: "Update patient information for {{name}}",
      
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
      treatment_created_successfully: "Treatment created successfully",
      add_treatment_for: "Add treatment for",
      back_to_patient: "Back to Patient",
      
      // Treatment Errors
      error_loading_treatments: "Error loading treatments",
      error_creating_treatment: "Error creating treatment",
      error_updating_treatment: "Error updating treatment",
      error_deleting_treatment: "Error deleting treatment",
      
      // Login
      loginTitle: "Treatment Manager Login",
      email: "Email",
      password: "Password",
      emailPlaceholder: "Enter your email",
      passwordPlaceholder: "Enter your password",
      login: "Login",
      loggingIn: "Logging in...",
      loginError: "Invalid email or password",
      logout: "Logout",
      
      // User Management
      user_management: "User Management",
      users: "Users",
      add_user: "Add User",
      create_new_user: "Create New User",
      create_user: "Create User",
      creating: "Creating...",
      current_user: "Current User",
      change_password: "Change Password",
      change_password_for: "Change password for {{name}}",
      current_password: "Current Password",
      new_password: "New Password",
      confirm_new_password: "Confirm New Password",
      password_min_length: "Password must be at least 6 characters",
      passwords_do_not_match: "Passwords do not match",
      save: "Save",
      back: "Back",
      
      // User Management Messages
      user_created_successfully: "User created successfully",
      user_updated_successfully: "User updated successfully",
      user_deleted_successfully: "User deleted successfully",
      password_changed_successfully: "Password changed successfully",
      no_changes_made: "No changes were made",
      confirm_delete_user: "Are you sure you want to delete {{name}}?",
      
      // User Management Errors
      error_loading_users: "Error loading users",
      error_creating_user: "Error creating user",
      error_updating_user: "Error updating user",
      error_deleting_user: "Error deleting user",
      error_changing_password: "Error changing password"
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
      edit: "ערוך",
      delete: "מחק",
      cancelBtn: "בטל",
      cancel: "בטל",
      refreshBtn: "רענן",
      saveBtn: "שמור",
      clearFilterBtn: "נקה סינון",
      
      // Search and Filter
      searchPatients: "חפש מטופלים לפי שם...",
      filterByName: "סנן לפי שם",
      noMatchingPatients: "לא נמצאו מטופלים התואמים לחיפוש שלך.",
      searchTreatments: "חפש לפי שם מטופל או פרטי טיפול...",
      filterTreatments: "סנן טיפולים",
      dateRange: "טווח תאריכים",
      fromDate: "מתאריך",
      toDate: "עד תאריך",
      noMatchingTreatments: "לא נמצאו טיפולים התואמים למסננים שלך.",
      allTreatments: "כל הטיפולים",
      clearFilters: "נקה מסננים",
      
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
      edit_patient_description: "עדכן מידע מטופל עבור {{name}}",
      
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
      treatment_created_successfully: "הטיפול נוצר בהצלחה",
      add_treatment_for: "הוסף טיפול עבור",
      back_to_patient: "חזור למטופל",
      
      // Treatment Errors
      error_loading_treatments: "שגיאה בטעינת טיפולים",
      error_creating_treatment: "שגיאה ביצירת טיפול",
      error_updating_treatment: "שגיאה בעדכון טיפול",
      error_deleting_treatment: "שגיאה במחיקת טיפול",
      
      // Login
      loginTitle: "התחברות למנהל הטיפולים",
      email: "אימייל",
      password: "סיסמה",
      emailPlaceholder: "הכנס את האימייל שלך",
      passwordPlaceholder: "הכנס את הסיסמה שלך",
      login: "התחבר",
      loggingIn: "מתחבר...",
      loginError: "אימייל או סיסמה לא נכונים",
      logout: "התנתק",
      
      // User Management
      user_management: "ניהול משתמשים",
      users: "משתמשים",
      add_user: "הוסף משתמש",
      create_new_user: "צור משתמש חדש",
      create_user: "צור משתמש",
      creating: "יוצר...",
      current_user: "משתמש נוכחי",
      change_password: "שנה סיסמה",
      change_password_for: "שנה סיסמה עבור {{name}}",
      current_password: "סיסמה נוכחית",
      new_password: "סיסמה חדשה",
      confirm_new_password: "אשר סיסמה חדשה",
      password_min_length: "הסיסמה חייבת להכיל לפחות 6 תווים",
      passwords_do_not_match: "הסיסמאות אינן תואמות",
      save: "שמור",
      back: "חזור",
      
      // User Management Messages
      user_created_successfully: "המשתמש נוצר בהצלחה",
      user_updated_successfully: "המשתמש עודכן בהצלחה",
      user_deleted_successfully: "המשתמש נמחק בהצלחה",
      password_changed_successfully: "הסיסמה שונתה בהצלחה",
      no_changes_made: "לא בוצעו שינויים",
      confirm_delete_user: "האם אתה בטוח שברצונך למחוק את {{name}}?",
      
      // User Management Errors
      error_loading_users: "שגיאה בטעינת משתמשים",
      error_creating_user: "שגיאה ביצירת משתמש",
      error_updating_user: "שגיאה בעדכון משתמש",
      error_deleting_user: "שגיאה במחיקת משתמש",
      error_changing_password: "שגיאה בשינוי סיסמה"
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

// Handle direction change on language change
i18n.on('languageChanged', (lng) => {
  const isRTL = lng === 'he';
  document.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  
  // Add class to body for additional styling hooks
  document.body.className = document.body.className.replace(/\b(rtl|ltr)\b/g, '');
  document.body.classList.add(isRTL ? 'rtl' : 'ltr');
});

// Set initial direction
const setInitialDirection = () => {
  const currentLang = i18n.language || 'en';
  const isRTL = currentLang === 'he';
  document.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLang;
  document.body.classList.add(isRTL ? 'rtl' : 'ltr');
};

// Set direction when i18n is ready
if (i18n.isInitialized) {
  setInitialDirection();
} else {
  i18n.on('initialized', setInitialDirection);
}

export default i18n;
