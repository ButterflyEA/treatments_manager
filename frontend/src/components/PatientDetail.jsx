import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { patientService } from '../services/patientService';
import TreatmentList from './TreatmentList';
import './PatientDetail.css';

function PatientDetail({ patientId, onBack, onEditPatient, onAddTreatment, onEditTreatment, onPatientUpdated }) {
  const { t } = useTranslation();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [treatmentListKey, setTreatmentListKey] = useState(0);
  const [statusLoading, setStatusLoading] = useState(false);

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

  const handleToggleStatus = async () => {
    try {
      setStatusLoading(true);
      await patientService.toggleStatus(patientId);
      // Reload patient data to get updated status
      await loadPatient();
      if (onPatientUpdated) {
        onPatientUpdated();
      }
    } catch (err) {
      setError(t('errorUpdating') + ': ' + err.message);
      console.error('Error toggling patient status:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleExportToWord = async () => {
    try {
      // Use relative path - works in both dev and production
      const API_BASE_URL = '/api';
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError(t('authentication_required'));
        return;
      }

      // Get current language from i18n
      const currentLanguage = i18n.language || 'en';

      const response = await fetch(`${API_BASE_URL}/v1/patients/${patientId}/export?lang=${currentLanguage}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export patient data');
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'patient_export.rtf';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      setError(t('export_error') + ': ' + err.message);
      console.error('Error exporting patient data:', err);
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
            className="btn-export"
            onClick={handleExportToWord}
            title={t('export_to_word')}
          >
            📄 {t('export_to_word')}
          </button>
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
        <div className="patient-header-info">
          <h1 className="patient-name">
            {patient.name}
            <span className={`status-badge ${patient.active ? 'active' : 'inactive'}`}>
              {patient.active ? t('active') : t('inactive')}
            </span>
          </h1>
          {patient.active && (
            <button
              className="btn-close-file"
              onClick={handleToggleStatus}
              disabled={statusLoading}
            >
              {statusLoading ? t('loading') : t('closeFile')}
            </button>
          )}
          {!patient.active && (
            <button
              className="btn-reopen-file"
              onClick={handleToggleStatus}
              disabled={statusLoading}
            >
              {statusLoading ? t('loading') : t('reopenFile')}
            </button>
          )}
        </div>
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
