import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const PatientForm = ({ patient, onSubmit, onCancel, loading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    description: '',
    date: ''
  });

  useEffect(() => {
    if (patient) {
      // Format date for datetime-local input
      const date = new Date(patient.date);
      const localISOTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString().slice(0, 16);
      
      setFormData({
        name: patient.name || '',
        email: patient.email || '',
        phone_number: patient.phone_number || '',
        description: patient.description || '',
        date: localISOTime
      });
    } else {
      // Set default date to current date/time for new patients
      const now = new Date();
      const localISOTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
        .toISOString().slice(0, 16);
      
      setFormData({
        name: '',
        email: '',
        phone_number: '',
        description: '',
        date: localISOTime
      });
    }
  }, [patient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      date: formData.date ? new Date(formData.date).toISOString() : null
    };

    onSubmit(submitData);
    
    if (!patient) {
      // Reset form for new patient
      const now = new Date();
      const localISOTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
        .toISOString().slice(0, 16);
      
      setFormData({
        name: '',
        email: '',
        phone_number: '',
        description: '',
        date: localISOTime
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">{t('name')}:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
            autocomplete="name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">{t('email')}:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            autocomplete="email"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="phone_number">{t('phoneNumber')}:</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
            disabled={loading}
            autocomplete="tel"
          />
        </div>
        <div className="form-group">
          <label htmlFor="date">{t('date')}:</label>
          <input
            type="datetime-local"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">{t('description')}:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          disabled={loading}
          autocomplete="off"
        />
      </div>

      <div className="form-actions">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? t('savingPatient') : (patient ? t('updatePatientBtn') : t('addPatientBtn'))}
        </button>
        {patient && onCancel && (
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            {t('cancelBtn')}
          </button>
        )}
      </div>
    </form>
  );
};

export default PatientForm;
