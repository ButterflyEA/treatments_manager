import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TreatmentForm from './TreatmentForm';
import treatmentService from '../services/treatmentService';
import { patientService } from '../services/patientService';
import './EditTreatmentPage.css';

function EditTreatmentPage({ patientId, treatmentId, onBack, onTreatmentUpdated }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [patient, setPatient] = useState(null);
  const [treatment, setTreatment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (patientId && treatmentId) {
      loadPatientAndTreatment();
    }
  }, [patientId, treatmentId]);

  const loadPatientAndTreatment = async () => {
    try {
      setLoading(true);
      
      // Load patient and treatment data in parallel
      const [patientData, treatmentData] = await Promise.all([
        patientService.getById(patientId),
        treatmentService.getTreatmentById(patientId, treatmentId)
      ]);
      
      setPatient(patientData);
      setTreatment(treatmentData);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({
        text: t('error_loading_treatment'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTreatmentSaved = () => {
    setMessage({
      text: t('treatment_updated_successfully'),
      type: 'success'
    });
    
    if (onTreatmentUpdated) {
      onTreatmentUpdated();
    }
    
    // Navigate back after a short delay to show success message
    setTimeout(() => {
      onBack();
    }, 1500);
  };

  const handleCancel = () => {
    onBack();
  };

  if (loading && !treatment) {
    return (
      <div className={`edit-treatment-page ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!patient || !treatment) {
    return (
      <div className={`edit-treatment-page ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="error-container">
          <h2>{t('treatment_not_found')}</h2>
          <button className="btn btn-primary" onClick={onBack}>
            {t('back_to_patient')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`edit-treatment-page ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="page-header">
        <button className="back-button" onClick={onBack}>
          <span className="back-arrow">{isRTL ? '→' : '←'}</span>
          {t('back_to_patient')}
        </button>
        <h1>{t('edit_treatment')}</h1>
        {patient && (
          <p className="page-description">
            {t('edit_treatment_for')} <strong>{patient.name}</strong>
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
            treatment={treatment}
            onSave={handleTreatmentSaved}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}

export default EditTreatmentPage;
