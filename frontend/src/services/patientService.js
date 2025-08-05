import AuthService from './AuthService';

// Use relative path - works in both dev and production
const API_BASE_URL = '/api/v1';

class PatientService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await AuthService.makeAuthenticatedRequest(url, options);
      if (!response) return null; // Redirected due to auth error
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getAll() {
    return this.request('/patients');
  }

  async getById(id) {
    return this.request(`/patients/${id}`);
  }

  async create(patientData) {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  async update(id, patientData) {
    return this.request(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    });
  }

  async delete(id) {
    return this.request(`/patients/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleStatus(id) {
    return this.request(`/patients/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }
}

export const patientService = new PatientService();
