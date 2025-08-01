import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Navigation from './components/Navigation'
import PatientsPage from './components/PatientsPage'
import AddPatientPage from './components/AddPatientPage'
import TreatmentPage from './components/TreatmentPage'
import PatientDetail from './components/PatientDetail'
import './App.css'

function App() {
  const { i18n, t } = useTranslation();
  const [currentPage, setCurrentPage] = useState('patients');
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  useEffect(() => {
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

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSelectedPatientId(null);
  };

  const handleViewPatientDetails = (patientId) => {
    setSelectedPatientId(patientId);
    setCurrentPage('patient-detail');
  };

  const handleBackToPatients = () => {
    setSelectedPatientId(null);
    setCurrentPage('patients');
  };

  const renderCurrentPage = () => {
    if (currentPage === 'patient-detail' && selectedPatientId) {
      return (
        <PatientDetail
          patientId={selectedPatientId}
          onBack={handleBackToPatients}
          onPatientUpdated={() => {
            // Could refresh patient list if needed
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
          />
        );
    }
  };

  return (
    <div className="App">
      <Navigation 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
      />
      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  )
}

export default App
