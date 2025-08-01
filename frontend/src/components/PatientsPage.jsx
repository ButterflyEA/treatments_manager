import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PatientList from './PatientList';
import { patientService } from '../services/patientService';
import './PatientsPage.css';

function PatientsPage({ onViewPatientDetails, onEditPatient }) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  // Filter patients when search term or patients list changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [patients, searchTerm]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getAll();
      const patientsList = data.patients || [];
      setPatients(patientsList);
      // The useEffect will handle filtering
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
    if (onEditPatient) {
      onEditPatient(patient.id);
    }
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

        {/* Patients List */}
        <div className="patients-list-section">
          <div className="list-header">
            <h2>{t('patientsList')}</h2>
            <div className="list-controls">
              <div className="search-container">
                <input
                  type="text"
                  placeholder={t('searchPatients')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button
                    className="btn-clear-filter"
                    onClick={() => setSearchTerm('')}
                    title={t('clearFilterBtn')}
                  >
                    ×
                  </button>
                )}
              </div>
              <button 
                className="btn-refresh" 
                onClick={loadPatients}
                disabled={loading}
              >
                {loading ? t('loading') : t('refreshBtn')}
              </button>
            </div>
          </div>
          
          {searchTerm && filteredPatients.length === 0 && patients.length > 0 ? (
            <div className="no-results">
              <p>{t('noMatchingPatients')}</p>
            </div>
          ) : (
            <PatientList
              patients={filteredPatients}
              onEdit={handleEditPatient}
              onDelete={handleDeletePatient}
              onViewDetails={onViewPatientDetails}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientsPage;
