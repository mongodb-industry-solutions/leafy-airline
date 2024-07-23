import client from '../../lib/mongodb'; // Import the MongoClient instance

export default async function handler(req, res) {
  try {
    const db = client.db('leafy_airline');
    const collection = db.collection('flights');
    const projection = { dep_time: 1, arr_time: 1,  _id: 0 };
    const results = await collection.find({}, { projection }).toArray();

    // Extract dates from the ts fields
    const dates = results.flatMap(item => {
        const depDate = new Date(item.dep_time).toISOString().split('T')[0];
        const arrDate = new Date(item.arr_time).toISOString().split('T')[0];
        return [depDate, arrDate];
      });
  
    // Get unique dates
    const uniqueDates = [...new Set(dates)];

    res.json(uniqueDates);
  

    res.status(200).json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
