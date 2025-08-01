import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PatientForm from './PatientForm';
import { patientService } from '../services/patientService';
import './AddPatientPage.css';

function AddPatientPage({ onPatientAdded }) {
  const { t } = useTranslation();
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleCreatePatient = async (patientData) => {
    try {
      setLoading(true);
      await patientService.create(patientData);
      showMessage(t('patientCreated'), 'success');
      if (onPatientAdded) onPatientAdded();
      
      // Clear form by resetting component (could be improved with form reset)
      setTimeout(() => {
        window.location.reload(); // Simple way to reset form
      }, 1500);
    } catch (error) {
      showMessage(`${t('errorCreating')}: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-patient-page">
      <div className="page-header">
        <h1>{t('add_patient_page')}</h1>
        <p className="page-description">{t('add_patient_description')}</p>
      </div>

      <div className="form-container">
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="form-card">
          <h2>{t('addPatient')}</h2>
          <PatientForm
            onSubmit={handleCreatePatient}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default AddPatientPage;
