import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import './Navigation.css';

function Navigation({ currentPage, onNavigate, user, onLogout }) {
  const { t } = useTranslation();

  const menuButtons = (
    <div className="nav-menu">
      <button 
        className={`nav-button ${currentPage === 'patients' ? 'active' : ''}`}
        onClick={() => onNavigate('patients')}
      >
        {t('patients')}
      </button>
      <button 
        className={`nav-button ${currentPage === 'add-patient' ? 'active' : ''}`}
        onClick={() => onNavigate('add-patient')}
      >
        {t('add_patient')}
      </button>
      <button 
        className={`nav-button ${currentPage === 'treatments' ? 'active' : ''}`}
        onClick={() => onNavigate('treatments')}
      >
        {t('treatments')}
      </button>
    </div>
  );

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-left">
          <h1 className="nav-title">{t('treatments_manager')}</h1>
        </div>
        
        <div className="nav-center">
          {menuButtons}
        </div>
        
        <div className="nav-right">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <button className="logout-button" onClick={onLogout}>
              {t('logout')}
            </button>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
