import AuthService from './AuthService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '/api/v1') || 'http://127.0.0.1:8080/api/v1';

class TreatmentService {
  async createTreatment(patientId, treatmentData) {
    const response = await AuthService.makeAuthenticatedRequest(
      `${API_BASE_URL}/patients/${patientId}/treatments`,
      {
        method: 'POST',
        body: JSON.stringify(treatmentData),
      }
    );

    if (!response) return null;

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getTreatmentsForPatient(patientId) {
    const response = await AuthService.makeAuthenticatedRequest(
      `${API_BASE_URL}/patients/${patientId}/treatments`
    );
    
    if (!response) return null;

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAllTreatments() {
    const response = await AuthService.makeAuthenticatedRequest(`${API_BASE_URL}/treatments`);
    
    if (!response) return null;

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getTreatmentById(patientId, treatmentId) {
    const response = await AuthService.makeAuthenticatedRequest(
      `${API_BASE_URL}/patients/${patientId}/treatments/${treatmentId}`
    );
    
    if (!response) return null;

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async updateTreatment(patientId, treatmentId, treatmentData) {
    const response = await AuthService.makeAuthenticatedRequest(
      `${API_BASE_URL}/patients/${patientId}/treatments/${treatmentId}`,
      {
        method: 'PUT',
        body: JSON.stringify(treatmentData),
      }
    );

    if (!response) return null;

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async deleteTreatment(patientId, treatmentId) {
    const response = await AuthService.makeAuthenticatedRequest(
      `${API_BASE_URL}/patients/${patientId}/treatments/${treatmentId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response) return null;

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // DELETE returns 204 No Content, so no JSON to parse
    return true;
  }
}

export default new TreatmentService();
