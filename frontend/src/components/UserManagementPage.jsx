import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import userService from '../services/userService';
import './UserManagementPage.css';

function UserManagementPage({ onBack }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(null);

  // Form states
  const [createUserData, setCreateUserData] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    const user = userService.getCurrentUser();
    setCurrentUser(user);
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await userService.getUsers();
      setUsers(usersData);
    } catch (error) {
      setMessage({
        text: error.message || t('error_loading_users'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (createUserData.password.length < 6) {
      setMessage({
        text: t('password_min_length'),
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      await userService.createUser({
        name: createUserData.name.trim(),
        email: createUserData.email.trim(),
        password: createUserData.password,
      });
      
      setMessage({
        text: t('user_created_successfully'),
        type: 'success'
      });
      
      setCreateUserData({ name: '', email: '', password: '' });
      setShowCreateForm(false);
      await loadUsers();
    } catch (error) {
      setMessage({
        text: error.message || t('error_creating_user'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setLoading(true);
      const updateData = {};
      if (editUserData.name.trim() !== editingUser.name) {
        updateData.name = editUserData.name.trim();
      }
      if (editUserData.email.trim() !== editingUser.email) {
        updateData.email = editUserData.email.trim();
      }

      if (Object.keys(updateData).length === 0) {
        setMessage({
          text: t('no_changes_made'),
          type: 'info'
        });
        setEditingUser(null);
        return;
      }

      await userService.updateUser(editingUser.id, updateData);
      
      setMessage({
        text: t('user_updated_successfully'),
        type: 'success'
      });
      
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      setMessage({
        text: error.message || t('error_updating_user'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!showPasswordForm) return;

    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({
        text: t('passwords_do_not_match'),
        type: 'error'
      });
      return;
    }

    if (passwordData.new_password.length < 6) {
      setMessage({
        text: t('password_min_length'),
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      await userService.changePassword(showPasswordForm, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      
      setMessage({
        text: t('password_changed_successfully'),
        type: 'success'
      });
      
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setShowPasswordForm(null);
    } catch (error) {
      setMessage({
        text: error.message || t('error_changing_password'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(t('confirm_delete_user', { name: userName }))) {
      return;
    }

    try {
      setLoading(true);
      await userService.deleteUser(userId);
      
      setMessage({
        text: t('user_deleted_successfully'),
        type: 'success'
      });
      
      await loadUsers();
    } catch (error) {
      setMessage({
        text: error.message || t('error_deleting_user'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setEditUserData({
      name: user.name,
      email: user.email,
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditUserData({ name: '', email: '' });
  };

  const startPasswordChange = (userId) => {
    setShowPasswordForm(userId);
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
  };

  const cancelPasswordChange = () => {
    setShowPasswordForm(null);
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
  };

  return (
    <div className={`user-management-page ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="page-header">
        <button className="back-button" onClick={onBack}>
          <span className="back-arrow">{isRTL ? '→' : '←'}</span>
          {t('back')}
        </button>
        <h1>{t('user_management')}</h1>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="users-section">
        <div className="section-header">
          <h2>{t('users')}</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
            disabled={loading}
          >
            {showCreateForm ? t('cancel') : t('add_user')}
          </button>
        </div>

        {showCreateForm && (
          <div className="form-card">
            <h3>{t('create_new_user')}</h3>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label htmlFor="create-name">{t('name')} *</label>
                <input
                  id="create-name"
                  type="text"
                  value={createUserData.name}
                  onChange={(e) => setCreateUserData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="create-email">{t('email')} *</label>
                <input
                  id="create-email"
                  type="email"
                  value={createUserData.email}
                  onChange={(e) => setCreateUserData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="create-password">{t('password')} *</label>
                <input
                  id="create-password"
                  type="password"
                  value={createUserData.password}
                  onChange={(e) => setCreateUserData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                  disabled={loading}
                />
                <small>{t('password_min_length')}</small>
              </div>

              <div className="form-actions">
                {isRTL ? (
                  <>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? t('creating') : t('create_user')}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)} disabled={loading}>
                      {t('cancel')}
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)} disabled={loading}>
                      {t('cancel')}
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? t('creating') : t('create_user')}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        )}

        {loading && users.length === 0 ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>{t('loading')}</p>
          </div>
        ) : (
          <div className="users-list">
            {users.map(user => (
              <div key={user.id} className="user-card">
                {editingUser && editingUser.id === user.id ? (
                  <form onSubmit={handleEditUser} className="edit-user-form">
                    <div className="form-group">
                      <label>{t('name')}</label>
                      <input
                        type="text"
                        value={editUserData.name}
                        onChange={(e) => setEditUserData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('email')}</label>
                      <input
                        type="email"
                        value={editUserData.email}
                        onChange={(e) => setEditUserData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-actions">
                      {isRTL ? (
                        <>
                          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                            {t('save')}
                          </button>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit} disabled={loading}>
                            {t('cancel')}
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit} disabled={loading}>
                            {t('cancel')}
                          </button>
                          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                            {t('save')}
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="user-info">
                      <h3>{user.name}</h3>
                      <p className="user-email">{user.email}</p>
                      {currentUser && user.id === currentUser.id && (
                        <span className="current-user-badge">{t('current_user')}</span>
                      )}
                    </div>
                    <div className="user-actions">
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => startEdit(user)}
                        disabled={loading}
                      >
                        {t('edit')}
                      </button>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => startPasswordChange(user.id)}
                        disabled={loading}
                      >
                        {t('change_password')}
                      </button>
                      {currentUser && user.id !== currentUser.id && (
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          disabled={loading}
                        >
                          {t('delete')}
                        </button>
                      )}
                    </div>
                  </>
                )}

                {showPasswordForm === user.id && (
                  <div className="password-form">
                    <h4>{t('change_password_for', { name: user.name })}</h4>
                    <form onSubmit={handleChangePassword}>
                      <div className="form-group">
                        <label>{t('current_password')}</label>
                        <input
                          type="password"
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t('new_password')}</label>
                        <input
                          type="password"
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                          required
                          minLength={6}
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t('confirm_new_password')}</label>
                        <input
                          type="password"
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                          required
                          minLength={6}
                          disabled={loading}
                        />
                      </div>
                      <div className="form-actions">
                        {isRTL ? (
                          <>
                            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                              {t('change_password')}
                            </button>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={cancelPasswordChange} disabled={loading}>
                              {t('cancel')}
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={cancelPasswordChange} disabled={loading}>
                              {t('cancel')}
                            </button>
                            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                              {t('change_password')}
                            </button>
                          </>
                        )}
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagementPage;
