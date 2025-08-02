import React from 'react';
import { useTranslation } from 'react-i18next';

const PatientList = ({ patients, onEdit, onDelete, onViewDetails, onToggleStatus, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return <div className="loading">{t('loadingPatients')}</div>;
  }

  if (patients.length === 0) {
    return (
      <div className="empty-state">
        <p>{t('noPatients')}</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="patients-grid">
      {patients.map((patient) => (
        <div key={patient.id} className={`patient-card ${!patient.active ? 'inactive' : ''}`}>
          <div className="patient-header">
            <div className="patient-info">
              <h3>
                {patient.name}
                <span className={`status-badge ${patient.active ? 'active' : 'inactive'}`}>
                  {patient.active ? t('active') : t('inactive')}
                </span>
              </h3>
              <p><strong>{t('email')}:</strong> {patient.email}</p>
              <p><strong>{t('phoneNumber')}:</strong> {patient.phone_number}</p>
              <p><strong>{t('date')}:</strong> {formatDate(patient.date)}</p>
              <p><strong>{t('description')}:</strong> {patient.description}</p>
            </div>
            <div className="patient-actions">
              <button 
                className="btn btn-primary"
                onClick={() => onViewDetails(patient.id)}
              >
                {t('view_details')}
              </button>
              <button 
                className="btn btn-success"
                onClick={() => onEdit(patient)}
              >
                {t('editBtn')}
              </button>
              {patient.active && (
                <button 
                  className="btn btn-warning"
                  onClick={() => onToggleStatus(patient.id)}
                >
                  {t('closeFile')}
                </button>
              )}
              <button 
                className="btn btn-danger"
                onClick={() => onDelete(patient.id)}
              >
                {t('deleteBtn')}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientList;
