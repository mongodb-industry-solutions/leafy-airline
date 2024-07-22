import client from '../../lib/mongodb'; // Import the MongoClient instance

const endOfDay = (dateStr) => {
  const date = new Date(dateStr);
  date.setHours(23, 50, 0, 0);
  return date;
};


export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  const params = req.query;
  const query = {};

  // Queries based on the day of search with a limit
  if (params.dep_time) {
      query['dep_time'] = { $gte: new Date(params.dep_time), $lte: endOfDay(params.dep_time) };
  }
  if (params.arr_time) {
      query['arr_time'] = { $gte: new Date(params.arr_time), $lte: endOfDay(params.arr_time) };
  }
  if (params['dep_arp._id']) {
      query['dep_arp._id'] = params['dep_arp._id'];
  }
  if (params['arr_arp._id']) {
      query['arr_arp._id'] = params['arr_arp._id'];
  }

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
      results = await collection.find({}).toArray();
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
