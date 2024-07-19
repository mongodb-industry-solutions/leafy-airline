import client from '../../lib/mongodb'; // Import the MongoClient instance

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  const query = req.query || {};

  try {
    const db = client.db('leafy_airline');
    const collection = db.collection('flights');

    let results;

    if (Object.keys(query).length > 0) {
      const filter = {};
      for (const [key, value] of Object.entries(query)) {
        filter[key] = value;
      }

      results = await collection.find(filter).toArray();
    } else {
      results = {'not query found':req.query}; 
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
