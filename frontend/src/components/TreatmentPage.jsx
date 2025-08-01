import React from 'react';
import { useTranslation } from 'react-i18next';
import TreatmentList from './TreatmentList';
import './TreatmentPage.css';

function TreatmentPage() {
  const { t } = useTranslation();

  return (
    <div className="treatment-page">
      <div className="page-header">
        <h1>{t('treatments')}</h1>
        <p className="page-description">{t('treatments_page_description')}</p>
      </div>
      <TreatmentList showPatientInfo={true} />
    </div>
  );
}

export default TreatmentPage;
