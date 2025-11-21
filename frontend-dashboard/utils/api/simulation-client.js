// API Client for Simulation Backend Communication
// This client uses the proxy pattern to call simulation endpoints

// IMPORTANT: Use /api as base URL (Next.js proxy pattern)
// This points to Next.js API routes, NOT the backend directly
const API_BASE_URL = '/api';

class SimulationAPIClient {
  /**
   * Start simulation scheduler
   * @param {Object} flightData - Flight information for simulation
   * @param {boolean} simulatedMode - Whether to use simulated mode
   * @returns {Promise<Object>} Simulation start response
   */
  static async startScheduler(flightData, simulatedMode = true) {
    try {
      const endpoint = simulatedMode ? 'simulation/start-simulated' : 'simulation/start';
      
      console.log(`🚀 Starting simulation (simulated: ${simulatedMode})`, flightData);
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flightData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          detail: `Failed to start simulation: ${response.status}` 
        }));
        throw new Error(error.detail || error.message || 'Failed to start simulation');
      }

      const result = await response.json();
      console.log('✅ Simulation started successfully', result);
      return result;
    } catch (error) {
      console.error('❌ Error starting simulation:', error);
      throw error;
    }
  }

  /**
   * Reset simulation scheduler
   * @param {string} sessionId - Session ID to reset
   * @returns {Promise<Object>} Reset response
   */
  static async resetScheduler(sessionId) {
    try {
      console.log(`🔄 Resetting simulation for session: ${sessionId}`);
      
      const response = await fetch(`${API_BASE_URL}/simulation/reset/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          detail: `Failed to reset simulation: ${response.status}` 
        }));
        throw new Error(error.detail || error.message || 'Failed to reset simulation');
      }

      const result = await response.json();
      console.log('✅ Simulation reset successfully', result);
      return result;
    } catch (error) {
      console.error('❌ Error resetting simulation:', error);
      throw error;
    }
  }

  /**
   * List active sessions (optional debugging endpoint)
   * @returns {Promise<Object>} Active sessions list
   */
  static async listSessions() {
    try {
      console.log('📋 Fetching active sessions');
      
      const response = await fetch(`${API_BASE_URL}/simulation/sessions`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          detail: `Failed to fetch sessions: ${response.status}` 
        }));
        throw new Error(error.detail || error.message || 'Failed to fetch sessions');
      }

      const result = await response.json();
      console.log('✅ Sessions fetched successfully', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching sessions:', error);
      throw error;
    }
  }
}

export default SimulationAPIClient;