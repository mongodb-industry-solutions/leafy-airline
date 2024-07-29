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
  const db = client.db('leafy_airline'); 

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();

    const flightsCollection = db.collection('flights');
    const flights = await flightsCollection.find({}).toArray();

    // Exclude the flights_costs collection since it's no longer needed
    // And return only the flight data
    res.status(200).json(flights);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
