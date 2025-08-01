import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PatientList from './PatientList';
import PatientForm from './PatientForm';
import { patientService } from '../services/patientService';
import './PatientsPage.css';

function PatientsPage({ onViewPatientDetails }) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getAll();
      setPatients(data.patients || []);
    } catch (error) {
      showMessage(`${t('errorLoading')}: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleUpdatePatient = async (patientData) => {
    try {
      setLoading(true);
      await patientService.update(editingPatient.id, patientData);
      showMessage(t('patientUpdated'), 'success');
      loadPatients();
      setEditingPatient(null);
    } catch (error) {
      showMessage(`${t('errorUpdating')}: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm(t('deleteConfirm'))) {
      try {
        setLoading(true);
        await patientService.delete(patientId);
        showMessage(t('patientDeleted'), 'success');
        loadPatients();
      } catch (error) {
        showMessage(`${t('errorDeleting')}: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
  };

  const handleCancelEdit = () => {
    setEditingPatient(null);
  };

  return (
    <div className="patients-page">
      <div className="page-header">
        <h1>{t('patients')}</h1>
        <p className="page-description">{t('patients_page_description')}</p>
      </div>

      <div className="patients-container">
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Edit Patient Modal */}
        {editingPatient && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{t('editPatient')}</h2>
              <PatientForm
                patient={editingPatient}
                onSubmit={handleUpdatePatient}
                onCancel={handleCancelEdit}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Patients List */}
        <div className="patients-list-section">
          <div className="list-header">
            <h2>{t('patientsList')}</h2>
            <button 
              className="btn-refresh" 
              onClick={loadPatients}
              disabled={loading}
            >
              {loading ? t('loading') : t('refreshBtn')}
            </button>
          </div>
          
          <PatientList
            patients={patients}
            onEdit={handleEditPatient}
            onDelete={handleDeletePatient}
            onViewDetails={onViewPatientDetails}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default PatientsPage;
