// Proxy route for listing active sessions (optional debugging endpoint)
// Maps to: GET /api/simulation/sessions -> GET {BACKEND_URL}/list-sessions

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    // Get backend URL from environment (server-side only)
    const backendUrl = process.env.SIMULATION_APP_URL || 
                       "http://localhost:8000";
    
    const url = `${backendUrl}/list-sessions`;
    
    console.log(`🔗 Proxying GET request to: ${url}`);
    
    // Forward request to backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Backend error (${response.status}):`, errorText);
      
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { detail: errorText || 'Request failed' };
      }
      
      return res.status(response.status).json(errorJson);
    }

    const data = await response.json();
    console.log('✅ Backend response:', data);
    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return res.status(500).json({
      error: 'Failed to connect to simulation backend',
      details: error.message
    });
  }
}