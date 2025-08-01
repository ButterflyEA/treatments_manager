import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { patientService } from '../services/patientService';
import TreatmentList from './TreatmentList';
import PatientForm from './PatientForm';
import './PatientDetail.css';

function PatientDetail({ patientId, onBack, onPatientUpdated }) {
  const { t } = useTranslation();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPatient, setEditingPatient] = useState(false);

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

  const handleUpdatePatient = async (updatedPatient) => {
    try {
      await patientService.update(patientId, updatedPatient);
      setPatient(updatedPatient);
      setEditingPatient(false);
      if (onPatientUpdated) onPatientUpdated();
    } catch (err) {
      console.error('Error updating patient:', err);
      throw err;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
          ← {t('back_to_patients')}
        </button>
        <div className="header-actions">
          <button
            className="btn-edit"
            onClick={() => setEditingPatient(true)}
          >
            {t('edit_patient')}
          </button>
        </div>
      </div>

      {editingPatient ? (
        <div className="patient-edit-section">
          <h2>{t('edit_patient')}</h2>
          <PatientForm
            patient={patient}
            onSubmit={handleUpdatePatient}
            onCancel={() => setEditingPatient(false)}
          />
        </div>
      ) : (
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
      )}

      <div className="treatments-section">
        <TreatmentList 
          patientId={patientId} 
          showPatientInfo={false}
        />
      </div>
    </div>
  );
}

export default PatientDetail;
