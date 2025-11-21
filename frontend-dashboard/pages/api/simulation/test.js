// Test proxy route to debug backend connectivity
// Access via: GET /api/simulation/test

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const testResults = {
    timestamp: new Date().toISOString(),
    environment_variables: {
      INTERNAL_SIMULATION_URL: process.env.INTERNAL_SIMULATION_URL,
      SIMULATION_APP_URL: process.env.SIMULATION_APP_URL,
      NODE_ENV: process.env.NODE_ENV
    },
    tests: []
  };

  // Test 1: Internal URL connectivity
  if (process.env.INTERNAL_SIMULATION_URL) {
    try {
      const url = `${process.env.INTERNAL_SIMULATION_URL}/list-sessions`;
      console.log(`🧪 Testing internal URL: ${url}`);
      
      const response = await fetch(url, { 
        method: 'GET',
        timeout: 5000 // 5 second timeout
      });
      
      const responseText = await response.text();
      
      testResults.tests.push({
        name: 'Internal URL Test',
        url: url,
        status: response.status,
        success: response.ok,
        responsePreview: responseText.substring(0, 200),
        isJson: responseText.startsWith('{') || responseText.startsWith('[')
      });
    } catch (error) {
      testResults.tests.push({
        name: 'Internal URL Test',
        url: process.env.INTERNAL_SIMULATION_URL,
        success: false,
        error: error.message
      });
    }
  }

  // Test 2: External URL connectivity
  if (process.env.SIMULATION_APP_URL) {
    try {
      const url = `${process.env.SIMULATION_APP_URL.replace(/\/$/, '')}/list-sessions`;
      console.log(`🧪 Testing external URL: ${url}`);
      
      const response = await fetch(url, { 
        method: 'GET',
        timeout: 5000
      });
      
      const responseText = await response.text();
      
      testResults.tests.push({
        name: 'External URL Test',
        url: url,
        status: response.status,
        success: response.ok,
        responsePreview: responseText.substring(0, 200),
        isJson: responseText.startsWith('{') || responseText.startsWith('[')
      });
    } catch (error) {
      testResults.tests.push({
        name: 'External URL Test',
        url: process.env.SIMULATION_APP_URL,
        success: false,
        error: error.message
      });
    }
  }

  // Test 3: Localhost fallback
  try {
    const url = 'http://localhost:8000/list-sessions';
    console.log(`🧪 Testing localhost: ${url}`);
    
    const response = await fetch(url, { 
      method: 'GET',
      timeout: 3000
    });
    
    const responseText = await response.text();
    
    testResults.tests.push({
      name: 'Localhost Test',
      url: url,
      status: response.status,
      success: response.ok,
      responsePreview: responseText.substring(0, 200),
      isJson: responseText.startsWith('{') || responseText.startsWith('[')
    });
  } catch (error) {
    testResults.tests.push({
      name: 'Localhost Test',
      url: 'http://localhost:8000',
      success: false,
      error: error.message
    });
  }

  console.log('🧪 Backend connectivity test results:', testResults);
  return res.status(200).json(testResults);
}