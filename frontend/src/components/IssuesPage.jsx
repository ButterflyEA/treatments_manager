import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AuthService from '../services/AuthService';
import './IssuesPage.css';

// API configuration - use relative URLs when served from same domain
const getApiBaseUrl = () => {
    // If we're running in development mode (localhost:5173), use the dev server URL
    if (window.location.port === '5173') {
        return 'http://127.0.0.1:8080/api';
    }
    // Otherwise, use relative URLs (production mode served by backend)
    return '/api';
};

const API_BASE_URL = getApiBaseUrl();

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
    const [openIssues, setOpenIssues] = useState([]);
    const [isLoadingIssues, setIsLoadingIssues] = useState(false);
    const [issuesError, setIssuesError] = useState(null);

    // Fetch open issues on component mount
    useEffect(() => {
        fetchOpenIssues();
    }, []);

    const fetchOpenIssues = async () => {
        console.log('🔍 IssuesPage: Starting to fetch open issues');
        console.log('🌐 API_BASE_URL:', API_BASE_URL);
        
        setIsLoadingIssues(true);
        setIssuesError(null);

        try {
            const url = `${API_BASE_URL}/v1/github/issues`;
            console.log('📡 Making request to:', url);
            
            const response = await AuthService.makeAuthenticatedRequest(url, {
                method: 'GET'
            });

            if (!response) {
                setIssuesError('Authentication failed');
                return;
            }

            console.log('📨 Response status:', response.status);
            console.log('📨 Response ok:', response.ok);

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Response data:', result);
                setOpenIssues(result.issues || []);
            } else {
                const error = await response.json();
                console.error('❌ Response error:', error);
                setIssuesError(error.error || 'Failed to load issues');
            }
        } catch (error) {
            console.error('❌ Network error:', error);
            setIssuesError('Network error while loading issues');
        } finally {
            setIsLoadingIssues(false);
        }
    };

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
            const response = await AuthService.makeAuthenticatedRequest(`${API_BASE_URL}/v1/github/issues`, {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            if (!response) {
                setSubmitStatus({
                    type: 'error',
                    message: 'Authentication failed'
                });
                return;
            }

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
                // Refresh the issues list
                fetchOpenIssues();
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

            {/* Open Issues Section */}
            <div className="open-issues-section">
                <div className="open-issues-header">
                    <h2>{t('open_issues')}</h2>
                    <button 
                        onClick={fetchOpenIssues} 
                        disabled={isLoadingIssues}
                        className="refresh-btn"
                    >
                        🔄 {t('refresh')}
                    </button>
                </div>

                {isLoadingIssues && (
                    <div className="loading-message">
                        <span className="spinner"></span>
                        {t('loading_issues')}
                    </div>
                )}

                {issuesError && (
                    <div className="error-message">
                        ❌ {issuesError}
                    </div>
                )}

                {!isLoadingIssues && !issuesError && openIssues.length === 0 && (
                    <div className="no-issues-message">
                        ✅ {t('no_open_issues')}
                    </div>
                )}

                {!isLoadingIssues && !issuesError && openIssues.length > 0 && (
                    <div className="issues-list">
                        {openIssues.map((issue) => (
                            <div key={issue.number} className="issue-card">
                                <div className="issue-header">
                                    <div className="issue-number">#{issue.number}</div>
                                    <div className="issue-labels">
                                        {issue.labels.map((label) => (
                                            <span 
                                                key={label.name} 
                                                className="issue-label"
                                                style={{ backgroundColor: `#${label.color}` }}
                                            >
                                                {label.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <h3 className="issue-title">
                                    <a 
                                        href={issue.html_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="issue-title-link"
                                    >
                                        {issue.title}
                                    </a>
                                </h3>
                                {issue.body && (
                                    <div className="issue-body">
                                        {issue.body.length > 200 
                                            ? `${issue.body.substring(0, 200)}...`
                                            : issue.body
                                        }
                                    </div>
                                )}
                                <div className="issue-meta">
                                    <div className="issue-author">
                                        <img 
                                            src={issue.user.avatar_url} 
                                            alt={issue.user.login}
                                            className="author-avatar"
                                        />
                                        <span>{issue.user.login}</span>
                                    </div>
                                    <div className="issue-dates">
                                        <span>{t('created')}: {new Date(issue.created_at).toLocaleDateString()}</span>
                                        {issue.updated_at !== issue.created_at && (
                                            <span>{t('updated')}: {new Date(issue.updated_at).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
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
