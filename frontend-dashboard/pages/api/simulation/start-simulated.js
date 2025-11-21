// Proxy route for starting simulation (simulated mode)
// Maps to: POST /api/simulation/start-simulated -> POST {BACKEND_URL}/simulated/start-scheduler

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // Get backend URL from environment (server-side only)
    const backendUrl = process.env.SIMULATION_APP_URL || 
                       "http://localhost:8000";
    
    const url = `${backendUrl}/simulated/start-scheduler`;
    
    console.log(`🔗 Proxying POST request to: ${url}`);
    console.log('🌐 Available env vars:');
    console.log('  - SIMULATION_APP_URL:', process.env.SIMULATION_APP_URL);
    console.log('📤 Request body:', req.body);
    
    // Forward request to backend
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    // Get response text first to handle both JSON and HTML
    const responseText = await response.text();
    console.log(`📥 Backend response (${response.status}):`, responseText.substring(0, 200));

    if (!response.ok) {
      console.error(`❌ Backend error (${response.status}):`, responseText);
      
      // Try to parse as JSON, fallback to plain text
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { 
          detail: responseText.includes('<!DOCTYPE') ? 'Backend returned HTML error page' : responseText,
          status: response.status 
        };
      }
      
      return res.status(response.status).json(errorData);
    }

    // Try to parse success response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      // If not JSON, return the text wrapped in an object
      data = { message: responseText, status: 'success' };
    }
    
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