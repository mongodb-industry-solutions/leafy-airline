// pages/api/searchfilter.js
import client from '../../lib/mongodb'; // Import the MongoClient instance

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  const { query, filters } = req.body; // Assume you send query and filters in the request body

  try {
    const db = client.db('leafy_airline');
    const collection = db.collection('flights');

    const filter = {};

    // Add search criteria if present
    if (query) {
      filter.$text = { $search: query }; // Assumes you have a text index on fields to be searched
    }

    // Add filter criteria
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        filter[key] = value;
      }
    }

    // Find documents matching the filter
    const results = await collection.find(filter).toArray();

    res.status(200).json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
