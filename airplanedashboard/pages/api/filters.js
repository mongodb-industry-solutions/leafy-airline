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

export default async function applyfilters(filters, res) {
  try {
    const { db } = await connectToDatabase();

    const flightsCollection = db.collection('flights');

    const filteredFlights = await flightsCollection.find({filters}).toArray();

    res.status(200).json(filteredFlights);
  } 
  catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}