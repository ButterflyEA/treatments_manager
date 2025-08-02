import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { patientService } from '../services/patientService';
import TreatmentList from './TreatmentList';
import './PatientDetail.css';

function PatientDetail({ patientId, onBack, onEditPatient, onAddTreatment, onEditTreatment, onPatientUpdated }) {
  const { t } = useTranslation();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [treatmentListKey, setTreatmentListKey] = useState(0);

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      const data = await patientService.getById(patientId);
      setPatient(data);
      setError('');
    } catch (err) {
      setError(t('error_loading_patient'));
      console.error('Error loading patient:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleAddTreatment = () => {
    if (onAddTreatment) {
      onAddTreatment(patientId);
    }
  };

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  if (error || !patient) {
    return (
      <div className="error-container">
        <div className="error">{error || t('patient_not_found')}</div>
        <button className="btn-secondary" onClick={onBack}>
          {t('back_to_patients')}
        </button>
      </div>
    );
  }

  return (
    <div className="patient-detail">
      <div className="patient-detail-header">
        <button className="btn-back" onClick={onBack}>
          <span className="back-arrow">←</span>
          <span className="back-text">{t('back_to_patients')}</span>
        </button>
        <div className="header-actions">
          <button
            className="btn-add-treatment"
            onClick={handleAddTreatment}
          >
            {t('add_treatment')}
          </button>
          <button
            className="btn-edit"
            onClick={() => onEditPatient && onEditPatient(patientId)}
          >
            {t('edit_patient')}
          </button>
        </div>
      </div>

      <div className="patient-info-section">
        <h1 className="patient-name">{patient.name}</h1>
        <div className="patient-details-grid">
          <div className="detail-item">
            <label>{t('email')}</label>
            <span>{patient.email}</span>
          </div>
          <div className="detail-item">
            <label>{t('phoneNumber')}</label>
            <span>{patient.phone_number}</span>
          </div>
          <div className="detail-item">
            <label>{t('registrationDate')}</label>
            <span>{formatDate(patient.date)}</span>
          </div>
          {patient.description && (
            <div className="detail-item full-width">
              <label>{t('description')}</label>
              <span className="description">{patient.description}</span>
            </div>
          )}
        </div>
      </div>

      <div className="treatments-section">
        <TreatmentList 
          key={treatmentListKey}
          patientId={patientId} 
          showPatientInfo={false}
          hideAddButton={true}
          onEditTreatment={onEditTreatment}
        />
      </div>
    </div>
  );
}

export default PatientDetail;
