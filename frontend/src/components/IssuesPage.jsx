import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './IssuesPage.css';

// API configuration consistent with other services
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '/api/v1') || 'http://127.0.0.1:8080/api/v1';

const IssuesPage = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'bug', // bug, feature, enhancement
        priority: 'medium' // low, medium, high
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/github/issues`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                setSubmitStatus({
                    type: 'success',
                    message: t('issue_created_successfully'),
                    issueUrl: result.html_url
                });
                setFormData({
                    title: '',
                    description: '',
                    type: 'bug',
                    priority: 'medium'
                });
            } else {
                const error = await response.json();
                setSubmitStatus({
                    type: 'error',
                    message: error.error || t('error_creating_issue')
                });
            }
        } catch (error) {
            setSubmitStatus({
                type: 'error',
                message: t('network_error')
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'bug': return '🐛';
            case 'feature': return '✨';
            case 'enhancement': return '🚀';
            default: return '📝';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ff4444';
            case 'medium': return '#ffaa00';
            case 'low': return '#00aa44';
            default: return '#666';
        }
    };

    return (
        <div className="issues-page">
            <div className="issues-header">
                <h1>{t('report_issue')}</h1>
                <p>{t('report_issue_description')}</p>
            </div>

            <div className="issue-form-container">
                <form onSubmit={handleSubmit} className="issue-form">
                    <div className="form-group">
                        <label htmlFor="type">{t('issue_type')}</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="bug">{getTypeIcon('bug')} {t('bug_report')}</option>
                            <option value="feature">{getTypeIcon('feature')} {t('feature_request')}</option>
                            <option value="enhancement">{getTypeIcon('enhancement')} {t('enhancement')}</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="priority">{t('priority')}</label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="low" style={{ color: getPriorityColor('low') }}>
                                🟢 {t('low_priority')}
                            </option>
                            <option value="medium" style={{ color: getPriorityColor('medium') }}>
                                🟡 {t('medium_priority')}
                            </option>
                            <option value="high" style={{ color: getPriorityColor('high') }}>
                                🔴 {t('high_priority')}
                            </option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="title">{t('issue_title')}</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder={t('issue_title_placeholder')}
                            required
                            maxLength="100"
                        />
                        <small>{formData.title.length}/100</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">{t('issue_description')}</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder={t('issue_description_placeholder')}
                            required
                            rows="8"
                            maxLength="2000"
                        />
                        <small>{formData.description.length}/2000</small>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
                            className="submit-btn"
                        >
                            {isSubmitting ? t('creating_issue') : t('create_issue')}
                        </button>
                    </div>
                </form>

                {submitStatus && (
                    <div className={`status-message ${submitStatus.type}`}>
                        <div className="status-content">
                            {submitStatus.type === 'success' ? '✅' : '❌'}
                            <span>{submitStatus.message}</span>
                            {submitStatus.issueUrl && (
                                <a 
                                    href={submitStatus.issueUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="issue-link"
                                >
                                    {t('view_on_github')} 🔗
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="issue-guidelines">
                <h3>{t('issue_guidelines')}</h3>
                <ul>
                    <li>{t('guideline_1')}</li>
                    <li>{t('guideline_2')}</li>
                    <li>{t('guideline_3')}</li>
                    <li>{t('guideline_4')}</li>
                </ul>
            </div>
        </div>
    );
};

export default IssuesPage;
