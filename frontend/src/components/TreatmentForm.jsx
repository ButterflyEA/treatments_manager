import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import treatmentService from '../services/treatmentService';
import './TreatmentForm.css';

function TreatmentForm({ patientId, treatment, onSave, onCancel }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [formData, setFormData] = useState({
    summary: '',
    date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (treatment) {
      // Format the date for datetime-local input
      const date = new Date(treatment.date);
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      
      setFormData({
        summary: treatment.summary,
        date: localDate,
      });
    } else {
      // Set current date/time as default for new treatments
      const now = new Date();
      const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      
      setFormData({
        summary: '',
        date: localDate,
      });
    }
  }, [treatment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const treatmentData = {
        summary: formData.summary,
        date: formData.date ? new Date(formData.date).toISOString() : null,
      };

      if (treatment) {
        // Update existing treatment
        await treatmentService.updateTreatment(
          treatment.patient_id,
          treatment.id,
          treatmentData
        );
      } else {
        // Create new treatment
        await treatmentService.createTreatment(patientId, treatmentData);
      }

      onSave();
    } catch (err) {
      setError(treatment ? t('error_updating_treatment') : t('error_creating_treatment'));
      console.error('Error saving treatment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="treatment-form">
      <h3>{treatment ? t('edit_treatment') : t('add_treatment')}</h3>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="summary">{t('treatment_summary')} *</label>
          <textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            required
            rows={4}
            placeholder={t('treatment_summary_placeholder')}
            autocomplete="off"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">{t('treatment_date')}</label>
          <input
            type="datetime-local"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          {isRTL ? (
            // RTL: Cancel first (appears left), Create second (appears right)
            <>
              <button
                type="button"
                className="btn-secondary"
                style={{
                  backgroundColor: '#dc3545',
                  borderColor: '#dc3545',
                  color: 'white'
                }}
                onClick={onCancel}
                disabled={loading}
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{
                  backgroundColor: '#28a745',
                  borderColor: '#28a745',
                  color: 'white'
                }}
                disabled={loading || !formData.summary.trim()}
              >
                {loading ? t('saving') : (treatment ? t('update') : t('create'))}
              </button>
            </>
          ) : (
            // LTR: Cancel first, Create/Update second
            <>
              <button
                type="button"
                className="btn-secondary"
                style={{
                  backgroundColor: '#dc3545',
                  borderColor: '#dc3545',
                  color: 'white'
                }}
                onClick={onCancel}
                disabled={loading}
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{
                  backgroundColor: '#28a745',
                  borderColor: '#28a745',
                  color: 'white'
                }}
                disabled={loading || !formData.summary.trim()}
              >
                {loading ? t('saving') : (treatment ? t('update') : t('create'))}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default TreatmentForm;
