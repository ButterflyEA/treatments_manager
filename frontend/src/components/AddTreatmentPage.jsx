import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TreatmentForm from './TreatmentForm';
import { patientService } from '../services/patientService';
import './AddTreatmentPage.css';

function AddTreatmentPage({ patientId, onTreatmentSaved, onBack }) {
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

  const handleTreatmentSaved = () => {
    setMessage({
      text: t('treatment_created_successfully'),
      type: 'success'
    });
    
    if (onTreatmentSaved) {
      onTreatmentSaved();
    }
    
    // Navigate back after a short delay to show success message
    setTimeout(() => {
      onBack();
    }, 1500);
  };

  const handleCancel = () => {
    onBack();
  };

  if (loading && !patient) {
    return (
      <div className="add-treatment-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!patient && !loading) {
    return (
      <div className="add-treatment-page">
        <div className="error-container">
          <h2>{t('patient_not_found')}</h2>
          <button className="btn btn-primary" onClick={onBack}>
            {t('back_to_patient')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="add-treatment-page">
      <div className="page-header">
        <button className="back-button" onClick={onBack}>
          <span className="back-arrow">←</span>
          {t('back_to_patient')}
        </button>
        <h1>{t('add_treatment')}</h1>
        {patient && (
          <p className="page-description">
            {t('add_treatment_for')} <strong>{patient.name}</strong>
          </p>
        )}
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form-container">
        <div className="form-card">
          <TreatmentForm
            patientId={patientId}
            onSave={handleTreatmentSaved}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}

export default AddTreatmentPage;
