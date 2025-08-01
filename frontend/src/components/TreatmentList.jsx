import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import treatmentService from '../services/treatmentService';
import { patientService } from '../services/patientService';
import TreatmentForm from './TreatmentForm';
import './TreatmentList.css';

function TreatmentList({ patientId = null, showPatientInfo = true }) {
  const { t } = useTranslation();
  const [treatments, setTreatments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTreatments();
    if (showPatientInfo) {
      loadPatients();
    }
  }, [patientId, showPatientInfo]);

  const loadTreatments = async () => {
    try {
      setLoading(true);
      let data;
      if (patientId) {
        data = await treatmentService.getTreatmentsForPatient(patientId);
      } else {
        data = await treatmentService.getAllTreatments();
      }
      setTreatments(data);
      setError('');
    } catch (err) {
      setError(t('error_loading_treatments'));
      console.error('Error loading treatments:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const data = await patientService.getAll();
      setPatients(data.patients || []);
    } catch (err) {
      console.error('Error loading patients:', err);
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : t('unknown_patient');
  };

  const handleTreatmentSaved = () => {
    loadTreatments();
    setEditingTreatment(null);
    setShowForm(false);
  };

  const handleEditTreatment = (treatment) => {
    setEditingTreatment(treatment);
    setShowForm(true);
  };

  const handleDeleteTreatment = async (treatment) => {
    if (window.confirm(t('confirm_delete_treatment'))) {
      try {
        await treatmentService.deleteTreatment(treatment.patient_id, treatment.id);
        loadTreatments();
      } catch (err) {
        setError(t('error_deleting_treatment'));
        console.error('Error deleting treatment:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="treatment-list">
      <div className="treatment-list-header">
        <h2>
          {patientId ? t('patient_treatments') : t('all_treatments')}
        </h2>
        {patientId && (
          <button
            className="btn-primary"
            onClick={() => {
              setEditingTreatment(null);
              setShowForm(true);
            }}
          >
            {t('add_treatment')}
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <TreatmentForm
              patientId={patientId}
              treatment={editingTreatment}
              onSave={handleTreatmentSaved}
              onCancel={() => {
                setShowForm(false);
                setEditingTreatment(null);
              }}
            />
          </div>
        </div>
      )}

      {treatments.length === 0 ? (
        <div className="no-treatments">
          {t('no_treatments_found')}
        </div>
      ) : (
        <div className="treatments-grid">
          {treatments.map((treatment) => (
            <div key={treatment.id} className="treatment-card">
              <div className="treatment-header">
                {showPatientInfo && (
                  <div className="patient-info">
                    <strong>{t('patient')}: {getPatientName(treatment.patient_id)}</strong>
                  </div>
                )}
                <div className="treatment-date">
                  {formatDate(treatment.date)}
                </div>
              </div>
              <div className="treatment-summary">
                {treatment.summary}
              </div>
              <div className="treatment-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEditTreatment(treatment)}
                >
                  {t('edit')}
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteTreatment(treatment)}
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TreatmentList;
