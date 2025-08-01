import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Navigation from './components/Navigation'
import PatientsPage from './components/PatientsPage'
import AddPatientPage from './components/AddPatientPage'
import EditPatientPage from './components/EditPatientPage'
import AddTreatmentPage from './components/AddTreatmentPage'
import TreatmentPage from './components/TreatmentPage'
import PatientDetail from './components/PatientDetail'
import Login from './components/Login'
import AuthService from './services/AuthService'
import './App.css'

function App() {
  const { i18n, t } = useTranslation();
  const [currentPage, setCurrentPage] = useState('patients');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on app load
    const checkAuth = () => {
      const authenticated = AuthService.isAuthenticated();
      const userData = AuthService.getUser();
      setIsAuthenticated(authenticated);
      setUser(userData);
      setLoading(false);
    };

    checkAuth();

    // Set initial document direction based on language
    const updateDirection = () => {
      document.dir = i18n.language === 'he' ? 'rtl' : 'ltr';
      document.documentElement.lang = i18n.language;
      document.title = t('pageTitle');
    };

    updateDirection();
    
    // Listen for language changes
    i18n.on('languageChanged', updateDirection);

    return () => {
      i18n.off('languageChanged', updateDirection);
    };
  }, [i18n, t]);

  const handleLogin = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('patients');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSelectedPatientId(null);
  };

  const handleViewPatientDetails = (patientId) => {
    setSelectedPatientId(patientId);
    setCurrentPage('patient-detail');
  };

  const handleEditPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setCurrentPage('edit-patient');
  };

  const handleAddTreatment = (patientId) => {
    setSelectedPatientId(patientId);
    setCurrentPage('add-treatment');
  };

  const handleBackToPatients = () => {
    setSelectedPatientId(null);
    setCurrentPage('patients');
  };

  const handleBackToPatientDetail = () => {
    setCurrentPage('patient-detail');
  };

  const renderCurrentPage = () => {
    if (currentPage === 'patient-detail' && selectedPatientId) {
      return (
        <PatientDetail
          patientId={selectedPatientId}
          onBack={handleBackToPatients}
          onEditPatient={handleEditPatient}
          onAddTreatment={handleAddTreatment}
          onPatientUpdated={() => {
            // Could refresh patient list if needed
          }}
        />
      );
    }

    if (currentPage === 'edit-patient' && selectedPatientId) {
      return (
        <EditPatientPage
          patientId={selectedPatientId}
          onBack={handleBackToPatients}
          onPatientUpdated={() => {
            // Patient was updated, could refresh patient list if needed
          }}
        />
      );
    }

    if (currentPage === 'add-treatment' && selectedPatientId) {
      return (
        <AddTreatmentPage
          patientId={selectedPatientId}
          onBack={handleBackToPatientDetail}
          onTreatmentSaved={() => {
            // Treatment was saved, could refresh if needed
          }}
        />
      );
    }

    switch (currentPage) {
      case 'add-patient':
        return (
          <AddPatientPage 
            onPatientAdded={() => {
              // Patient was added, could navigate back to patients list
            }}
          />
        );
      case 'treatments':
        return <TreatmentPage />;
      case 'patients':
      default:
        return (
          <PatientsPage 
            onViewPatientDetails={handleViewPatientDetails}
            onEditPatient={handleEditPatient}
          />
        );
    }
  };

  return (
    <div className="App">
      <Navigation 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      />
      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  )
}

export default App
