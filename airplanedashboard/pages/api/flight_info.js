import { MongoClient, ObjectId} from 'mongodb';

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

    // Get flightId from body parameters
    const { flight_id } = req.body;
    console.log("Received flightId:", flight_id);
    const flight = await flightsCollection.find({ _id: new ObjectId(flight_id) }).toArray();
    console.log("Fetched flight:", flight);

    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    else {
      return res.status(200).json(flight[0]);
    }
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
