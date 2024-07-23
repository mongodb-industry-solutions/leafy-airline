import client from '../../lib/mongodb'; // Import the MongoClient instance

export default async function handler(req, res) {
  try {
    const db = client.db('leafy_airline');
    const collection = db.collection('flights');
    const projection = { dep_arp : 1 , arr_arp : 1, _id: 0 };
    const results = await collection.find({}, { projection }).toArray();

    // Extract dates from the ts fields
    const airports = results.flatMap(item => {

        const dep_arp = new String(item.dep_arp._id + " - " + item.dep_arp.city + ", " + item.dep_arp.country) 
        const arr_arp = new String(item.arr_arp._id + " - " + item.arr_arp.city + ", " + item.arr_arp.country) 

        return [dep_arp, arr_arp];
      });
  
    // Get unique dates
    const uniqueAirports = [...new Set(airports)];
    res.json(uniqueAirports);
  
    res.status(200).json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
