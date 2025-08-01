import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PatientForm from './PatientForm';
import { patientService } from '../services/patientService';
import './EditPatientPage.css';

function EditPatientPage({ patientId, onPatientUpdated, onBack }) {
  const { t } = useTranslation();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (patientId) {
      loadPatient();
    }
  }, [patientId]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      const patientData = await patientService.getById(patientId);
      setPatient(patientData);
    } catch (error) {
      console.error('Error loading patient:', error);
      setMessage({
        text: t('error_loading_patient'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePatient = async (patientData) => {
    try {
      setLoading(true);
      await patientService.update(patientId, patientData);
      
      setMessage({
        text: t('patientUpdated'),
        type: 'success'
      });
      
      if (onPatientUpdated) {
        onPatientUpdated();
      }
      
      // Navigate back after a short delay to show success message
      setTimeout(() => {
        onBack();
      }, 1500);
      
    } catch (error) {
      console.error('Error updating patient:', error);
      setMessage({
        text: t('errorUpdating'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onBack();
  };

  if (loading && !patient) {
    return (
      <div className="edit-patient-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!patient && !loading) {
    return (
      <div className="edit-patient-page">
        <div className="error-container">
          <h2>{t('patient_not_found')}</h2>
          <button className="btn btn-primary" onClick={onBack}>
            {t('back_to_patients')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-patient-page">
      <div className="page-header">
        <button className="back-button" onClick={onBack}>
          <span className="back-arrow">←</span>
          {t('back_to_patients')}
        </button>
        <h1>{t('editPatient')}</h1>
        <p className="page-description">
          {t('edit_patient_description', { name: patient?.name })}
        </p>
      </div>

      <div className="edit-patient-container">
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="patient-form-container">
          <PatientForm
            patient={patient}
            onSubmit={handleUpdatePatient}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default EditPatientPage;
