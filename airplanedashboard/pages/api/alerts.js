// pages/api/alerts.js
let alerts = []; // This should match the alerts used in the WebSocket handler

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(alerts);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
