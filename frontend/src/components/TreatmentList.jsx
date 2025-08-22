import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import treatmentService from '../services/treatmentService';
import { patientService } from '../services/patientService';
import TreatmentForm from './TreatmentForm';
import './TreatmentList.css';

function TreatmentList({ patientId = null, showPatientInfo = true, hideAddButton = false, onEditTreatment = null }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [treatments, setTreatments] = useState([]);
  const [filteredTreatments, setFilteredTreatments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    loadTreatments();
    if (showPatientInfo) {
      loadPatients();
    }
  }, [patientId, showPatientInfo]);

  // Filter treatments when search term, date range, or treatments list changes
  useEffect(() => {
    filterTreatments();
  }, [treatments, searchTerm, fromDate, toDate, patients]);

  const filterTreatments = () => {
    let filtered = [...treatments];

    // Filter by search term (patient name or treatment summary)
    if (searchTerm.trim()) {
      filtered = filtered.filter(treatment => {
        const patientName = getPatientName(treatment.patient_id).toLowerCase();
        const treatmentSummary = treatment.summary.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return patientName.includes(searchLower) || treatmentSummary.includes(searchLower);
      });
    }

    // Filter by date range
    if (fromDate) {
      filtered = filtered.filter(treatment => {
        const treatmentDate = new Date(treatment.date);
        const fromDateTime = new Date(fromDate);
        return treatmentDate >= fromDateTime;
      });
    }

    if (toDate) {
      filtered = filtered.filter(treatment => {
        const treatmentDate = new Date(treatment.date);
        const toDateTime = new Date(toDate);
        toDateTime.setHours(23, 59, 59, 999); // Include the entire end date
        return treatmentDate <= toDateTime;
      });
    }

    setFilteredTreatments(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFromDate('');
    setToDate('');
  };

  const hasActiveFilters = searchTerm.trim() || fromDate || toDate;

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
      // The useEffect will handle filtering
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
    if (onEditTreatment) {
      // Use external handler (for page navigation)
      onEditTreatment(treatment.patient_id, treatment.id);
    } else {
      // Use internal popup handler (fallback)
      setEditingTreatment(treatment);
      setShowForm(true);
    }
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
        {patientId && !hideAddButton && (
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

      {/* Filter Controls - only show for all treatments view */}
      {!patientId && (
        <div className="filter-section">
          <div className="filter-header">
            <h3>{t('filterTreatments')}</h3>
            {hasActiveFilters && (
              <button
                className="btn-clear-filters"
                onClick={clearFilters}
              >
                {t('clearFilters')}
              </button>
            )}
          </div>
          
          <div className="filter-controls">
            <div className="search-filter">
              <input
                id="search-treatments"
                name="search"
                type="text"
                placeholder={t('searchTreatments')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-search-input"
                autoComplete="off"
              />
            </div>
            
            <div className="date-filters">
              {isRTL ? (
                // RTL: To Date first, then From Date
                <>
                  <div className="date-filter">
                    <label htmlFor="toDate">{t('toDate')}:</label>
                    <input
                      id="toDate"
                      name="toDate"
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="date-input"
                    />
                  </div>
                  
                  <div className="date-filter">
                    <label htmlFor="fromDate">{t('fromDate')}:</label>
                    <input
                      id="fromDate"
                      name="fromDate"
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="date-input"
                    />
                  </div>
                </>
              ) : (
                // LTR: From Date first, then To Date
                <>
                  <div className="date-filter">
                    <label htmlFor="fromDate">{t('fromDate')}:</label>
                    <input
                      id="fromDate"
                      name="fromDate"
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="date-input"
                    />
                  </div>
                  
                  <div className="date-filter">
                    <label htmlFor="toDate">{t('toDate')}:</label>
                    <input
                      id="toDate"
                      name="toDate"
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="date-input"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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

      {(!patientId && hasActiveFilters && filteredTreatments.length === 0 && treatments.length > 0) ? (
        <div className="no-results">
          <p>{t('noMatchingTreatments')}</p>
        </div>
      ) : (
        <>
          {(patientId ? treatments : filteredTreatments).length === 0 ? (
            <div className="no-treatments">
              {t('no_treatments_found')}
            </div>
          ) : (
            <div className="treatments-grid">
              {(patientId ? treatments : filteredTreatments).map((treatment) => (
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
        </>
      )}
    </div>
  );
}

export default TreatmentList;
