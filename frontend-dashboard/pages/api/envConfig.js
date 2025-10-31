export default function handler(req, res) {
  res.status(200).json({
    app_url: process.env.SIMULATION_APP_URL,
    simulatedMode: process.env.SIMULATED_MODE === "true",
    maps_api_key: process.env.GOOGLE_MAPS_API_KEY,

    // Only return safe variables — never secret keys!
  });
}
