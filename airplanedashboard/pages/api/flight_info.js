import { MongoClient, ObjectId} from 'mongodb';
import clientPromise from '../../lib/mongo';

const client = await clientPromise;
const db = client.db('leafy_airline');

export default async function handler(req, res) {
  try {
    
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
