import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('leafy_airline'); // Replace with your database name

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();

    const flightsCollection = db.collection('flights');
    const costsCollection = db.collection('flights_costs');

    const flights = await flightsCollection.find({}).toArray();
    const costs = await costsCollection.find({}).toArray();

    const mergedData = flights.map(flight => {
      const cost = costs.find(cost => cost._id === flight._id); // Assuming _id is used as the common field
      return {
        ...flight,
        delay_time: cost ? cost.DelayTime : 0, // Ensure DelayTime matches exactly the field name in flights_costs
      };
    });

    res.status(200).json(mergedData);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
