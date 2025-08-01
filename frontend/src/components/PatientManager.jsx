import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PatientForm from './PatientForm';
import PatientList from './PatientList';
import { patientService } from '../services/patientService';

const PatientManager = ({ onViewPatientDetails }) => {
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

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleCreatePatient = async (patientData) => {
    try {
      setLoading(true);
      await patientService.create(patientData);
      showMessage(t('patientCreated'));
      loadPatients();
    } catch (error) {
      showMessage(`${t('errorCreating')}: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePatient = async (patientData) => {
    try {
      setLoading(true);
      await patientService.update(editingPatient.id, patientData);
      showMessage(t('patientUpdated'));
      setEditingPatient(null);
      loadPatients();
    } catch (error) {
      showMessage(`${t('errorUpdating')}: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      setLoading(true);
      await patientService.delete(patientId);
      showMessage(t('patientDeleted'));
      loadPatients();
    } catch (error) {
      showMessage(`${t('errorDeleting')}: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
  };

  const handleCancelEdit = () => {
    setEditingPatient(null);
  };

  return (
    <div className="patient-manager">
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="container">
        <h2>{editingPatient ? t('editPatient') : t('addPatient')}</h2>
        <PatientForm
          patient={editingPatient}
          onSubmit={editingPatient ? handleUpdatePatient : handleCreatePatient}
          onCancel={editingPatient ? handleCancelEdit : null}
          loading={loading}
        />
      </div>

      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{t('patientsList')}</h2>
          <button 
            className="btn btn-secondary" 
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
  );
};

export default PatientManager;
