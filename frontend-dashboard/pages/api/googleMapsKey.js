// pages/api/googleMapsKey.js
export default function handler(req, res) {
  // res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: "API Key not found" });
  }
  res.status(200).json({ apiKey });
}
  