const API_BASE_URL = 'http://127.0.0.1:8080/api/v1';

class PatientService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
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
}

export const patientService = new PatientService();
