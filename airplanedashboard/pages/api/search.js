// pages/api/search.js
import client from '../../lib/mongodb'; // Importing the MongoClient instance

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  const { query } = req.query;

  try {
    const db = client.db('leafy_airline');
    const collection = db.collection('flights');

    let results;

    if (query) {
      results = await collection.aggregate([
        {
          $search: {
            index: 'flights-index',
            text: {
              query: query,
              path: ['dep_arp.city', 'dep_arp.country', 'arr_arp.city','arr_arp.country','airline', 'plane']
            }
          }
        }
      ]).toArray();
    } else {
      results = await collection.find({}).toArray();
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
