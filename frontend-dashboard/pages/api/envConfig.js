export default function handler(req, res) {
  res.status(200).json({
    app_url: process.env.SIMULATION_APP_URL,
    simulatedMode: process.env.SIMULATED_MODE === "true",
    maps_api_key: process.env.GOOGLE_MAPS_API_KEY,

    mongo_uri: process.env.MONGO_URI,
    mongodb_db: process.env.MONGODB_DB,

    // Only return safe variables — never secret keys!
  });
}
