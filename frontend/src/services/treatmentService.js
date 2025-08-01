const API_BASE_URL = 'http://localhost:8080/api/v1';

class TreatmentService {
  async createTreatment(patientId, treatmentData) {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/treatments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(treatmentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getTreatmentsForPatient(patientId) {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/treatments`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAllTreatments() {
    const response = await fetch(`${API_BASE_URL}/treatments`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getTreatmentById(patientId, treatmentId) {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/treatments/${treatmentId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async updateTreatment(patientId, treatmentId, treatmentData) {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/treatments/${treatmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(treatmentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async deleteTreatment(patientId, treatmentId) {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/treatments/${treatmentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // DELETE returns 204 No Content, so no JSON to parse
    return true;
  }
}

export default new TreatmentService();
