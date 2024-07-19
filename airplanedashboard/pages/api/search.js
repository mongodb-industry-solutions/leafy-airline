import client from '../../lib/mongodb'; // Importing the MongoClient instance

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  const { query } = req.query;
  if (!query) {
    res.status(400).json({ error: 'Query parameter is required' });
    return;
  }

  try {
    // Use the imported client instance directly
    const db = client.db('leafy_airline');
    const collection = db.collection('flights');

    // Perform the search using Atlas Search
    const results = await collection.aggregate([
      {
        $search: {
          index: 'default', 
          text: {
            query: query,
            path: 'airline' // Field you want to search on
          }
        }
      }
    ]).toArray();

    res.status(200).json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
